import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CRUDTable from '../../Components/Table/CRUDTable';
import { socket, authenticateSocket } from '../../Components/Socket/socket';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import {
  FormControl,
  InputAdornment,
  InputLabel,
  Input,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Box,
  Chip
} from '@mui/material';
import usePermissions from '../../Components/hooks/usePermission';
import { useSelector } from 'react-redux';
import UseUrlParamsManager from '../../Components/hooks/UseUrlParamsManager';
import AddBD from './Add_BD';

// Componente mejorado de barra de búsqueda con entrada fluida
const EnhancedSearchBar = ({
  searchValue,
  onSearchChange,
  onClearAllFilters,
  loading,
  onDelete
}) => {
  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  // Estado local para el input para permitir escritura fluida
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Actualizar el valor local cuando cambia el valor externo
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  const handleClearSearch = () => {
    setLocalSearchValue('');
    onClearAllFilters();

    // Focus back to the search input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Manejar cambios locales en el input sin throttling
  const handleLocalInputChange = (event) => {
    const value = event.target.value;
    setLocalSearchValue(value);
    // Pasar el valor al componente padre para el debounce
    onSearchChange(value);
  };

  return (
    <FormControl
      variant="standard"
      size="small"
      className="w-full relative"
      sx={{
        "& .MuiInput-root": {
          borderRadius: "4px",
          transition: "all 0.2s ease",
          pr: localSearchValue ? 1 : 0,
          "&:hover, &.Mui-focused": {
            backgroundColor: "rgba(0, 0, 0, 0.04)"
          }
        }
      }}
    >
      <InputLabel htmlFor="search-bodycam-input">Buscar</InputLabel>
      <Input
        id="search-bodycam-input"
        value={localSearchValue}
        onChange={handleLocalInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        inputRef={searchInputRef}
        disabled={loading}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon color={localSearchValue ? "primary" : "action"} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end" className="flex items-center gap-1">

            {/* Botón para limpiar búsqueda */}
            {localSearchValue && (
              <IconButton
                aria-label="clear search"
                onClick={handleClearSearch}
                edge="end"
                size="small"
                sx={{ p: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}

            
          </InputAdornment>
        }
        placeholder="Número, serie, batería..."
        sx={{
          pl: 1,
          pr: 0.5,
          transition: "all 0.3s ease",
          backgroundColor: isFocused ? "rgba(0, 0, 0, 0.04)" : "transparent",
        }}
      />
    </FormControl>
  );
};

// Componente memoizado para mostrar el chip de filtro activo
const FilterChip = memo(({ label, onClear }) => (
  <Chip
    label={`Marca: ${label}`}
    color="primary"
    variant="outlined"
    onDelete={onClear}
    size="small"
    className="ml-2"
  />
));

// Función de utilidad para transformar un objeto row en el formato consistente
const transformRow = (row) => ({
  id: row.id,
  numero: row.numero || '',
  serie: row.serie || '',
  nro_bateria: row.nro_bateria || '',
  marca: row.proveedors?.marca || '',
  modelo: row.proveedors?.modelo || '',
});

const BaseDatos = ({ moduleName }) => {
  const { canCreate } = usePermissions(moduleName);
  const { token } = useSelector((state) => state.auth);
  const { addParams, getParams, removeParams } = UseUrlParamsManager();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados principales
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  // Estado para el campo de búsqueda
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Para debounce de búsqueda
  const timeoutRef = useRef(null);

  // Constantes (Marcas disponibles para filtrar)
  const availableMarks = ['Motorola', 'Hytera', 'Axon', 'Samsung'];  // Ajusta según tus datos reales

  // Obtener parámetros actuales de la URL
  const urlParams = new URLSearchParams(location.search);
  const currentPage = parseInt(urlParams.get('page') || '1');
  const rowsPerPage = parseInt(urlParams.get('limit') || '20');
  const currentSearchTerm = urlParams.get('search') || '';
  const currentMarkFilter = urlParams.get('marca') || '';

  // Inicializar estados desde URL al montar
  useEffect(() => {
    setSearchInputValue(currentSearchTerm);
    setIsSearching(!!currentSearchTerm);
  }, [currentSearchTerm]);

  // Inicializar conexión de socket
  useEffect(() => {
    const handleConnect = () => {
      console.log("✅ Socket conectado exitosamente");
      authenticateSocket(token);
      setSocketReady(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.warn("⚠️ Socket desconectado");
      setSocketReady(false);
      setError("Se ha perdido la conexión con el servidor");
      setOpenSnackbar(true);
    };

    const handleConnectError = (err) => {
      console.error("❌ Error de conexión del socket:", err);
      setSocketReady(false);
      setError("Error al conectar con el servidor");
      setOpenSnackbar(true);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (!socket.connected && !socket.connecting) {
      console.log("Iniciando conexión del socket...");
      socket.connect();
    } else if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [token]);

  // Procesar datos recibidos del servidor
  const handleUpdateBodyCams = useCallback((response) => {
    console.log("📥 Respuesta del servidor:", response);

    if (response?.status === 200 && response?.data) {
      const { data: rows = [], totalCount = 0 } = response.data;

      // Usamos la función de utilidad para transformar filas
      let transformedRows = rows.map(transformRow);

      // Ordenar por ID de forma descendente (más nuevo primero)
      transformedRows = transformedRows.sort((a, b) => b.id - a.id);

      setData(transformedRows);
      setCount(totalCount);
    } else {
      setData([]);
      setCount(0);
      setError(response?.message || 'Error al cargar datos');
      setOpenSnackbar(true);
    }
    setLoading(false);
  }, []);

  // Obtener datos del servidor con parámetros
  const fetchData = useCallback(() => {
    if (!socketReady) {
      setError("No hay conexión con el servidor");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);

    // Crear objeto con parámetros actuales de la URL
    const apiParams = {
      page: currentPage,
      limit: rowsPerPage,
      search: currentSearchTerm  // Un solo parámetro para todos los campos
    }

    console.log("Enviando parámetros al servidor:", apiParams);
    socket.emit("getAllBodys", apiParams);
  }, [socketReady, currentPage, rowsPerPage, currentSearchTerm, currentMarkFilter]);

  // Configurar listeners de socket
  useEffect(() => {
    if (!socketReady) return;

    // Cargar datos iniciales cuando el socket está listo
    fetchData();

    // Manejadores de respuestas de socket
    const handleSocketResponse = (response) => {
      if (typeof response !== "object" || response === null) {
        console.error("❌ Respuesta inválida del servidor:", response);
        setError("Respuesta inválida del servidor");
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      handleUpdateBodyCams(response);
    };

    const handleBodyCamActualizada = (response) => {
      if (response?.status === 200) {
        fetchData();
      } else {
        setError(response?.message || "Error en la actualización");
        setOpenSnackbar(true);
      }
    };

    // Configurar listeners
    //socket.on("getAllBodysResponse", handleSocketResponse);
    //socket.on("listaallbodys", handleUpdateBodyCams);
    socket.on("getAllRegistrofilterResponse", (response) => {
      console.log("💾 Datos recibidos del backend:", response);
      handleSocketResponse(response);
    });
    socket.on("bodyCamRegistrada", (response) => {
      if (response.status === 200) {
        fetchData();
      } else {
        setError(response?.message || "Error al procesar la nueva BodyCam");
        setOpenSnackbar(true);
      }
    });
    socket.on("bodyCamActualizada", handleBodyCamActualizada);

    // Limpieza
    return () => {
      socket.off("getAllBodysResponse", handleSocketResponse);
      socket.off("listaallbodys", handleUpdateBodyCams);
      socket.off("bodyCamRegistrada");
      socket.off("bodyCamActualizada", handleBodyCamActualizada);
    };
  }, [socketReady, fetchData, handleUpdateBodyCams]);

  // Recargar cuando cambia la URL
  useEffect(() => {
    if (socketReady) {
      fetchData();
    }
  }, [location.search, socketReady, fetchData]);

  // Limpieza del timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Manejadores de paginación
  const handlePageChange = (event, newPageIndex) => {
    const page = newPageIndex + 1;
    // Mantener los filtros y búsqueda al cambiar de página
    addParams({ page });
  };

  const handleRowsPerPageChange = (event) => {
    const newLimit = parseInt(event.target.value);
    // Mantener filtros y búsqueda, pero volver a página 1
    addParams({ limit: newLimit, page: 1 });
  };

  // Manejador de clic en fila
  const handleRowClick = (e, row) => {
    setSelectedRowId(prevId => prevId === row.id ? null : row.id);
  };

  // Manejadores de menú de filtro
  const handleFilterSelect = (marca) => {
    // Mantener la búsqueda pero aplicar el filtro y volver a página 1
    addParams({ marca, page: 1 });
  };

  const handleClearFilter = () => {
    const currentParams = { ...getParams() };
    delete currentParams.marca;
    // Mantener la búsqueda pero quitar el filtro y volver a página 1
    addParams({ ...currentParams, page: 1 });
  };

  // Manejador de cambio en búsqueda con debounce
  const handleSearchChange = (value) => {
    setSearchInputValue(value);
    setIsSearching(value !== '');

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce para reducir llamadas
    timeoutRef.current = setTimeout(() => {
      const currentParams = { ...getParams() };

      if (value.trim() === '') {
        delete currentParams.search;
      } else {
        currentParams.search = value.trim();
      }

      // Siempre volver a página 1 cuando se cambia la búsqueda
      currentParams.page = 1;

      addParams(currentParams);
    }, 500); // Tiempo de debounce
  };

  // Refrescar datos
  const handleRefresh = () => {
    if (socketReady) {
      fetchData();
    } else {
      setError("No hay conexión con el servidor. Espere a que se restablezca.");
      setOpenSnackbar(true);
    }
  };

  // Limpiar todos los filtros
  const handleClearAllFilters = () => {
    setSearchInputValue('');
    setIsSearching(false);
    // Eliminamos todos los parámetros de URL y volvemos a la página 1
    removeParams();
    // Volvemos a cargar los datos sin filtros
    fetchData();
  };

  // Cerrar Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  return (
    <div className='flex flex-col w-full h-screen max-h-screen overflow-hidden'>
      <header className="text-white bg-green-700 py-4 px-3 mb-4 w-full rounded-lg flex justify-center relative flex-shrink-0">
        <Link onClick={() => navigate(-1)} className='flex items-center gap-1'>
          <ArrowBackIosNewRoundedIcon className='!size-5 md:!size-6 mt-[0.1rem] absolute left-4' />
        </Link>
        <h1 className="md:text-2xl lg:text-4xl font-bold text-center">Base de Datos</h1>
      </header>

      <div className='flex-1 flex flex-col bg-white shadow rounded-lg p-4 overflow-hidden'>
        <div className='flex flex-col md:flex-row justify-between pb-4 gap-3 flex-shrink-0'>
          <div className='flex items-center gap-2'>
            <span className='text-gray-600'>
              Total de filas: <span id="rowCount" className='font-bold'>{count || 0}</span>
            </span>
            {currentMarkFilter && (
              <FilterChip
                label={currentMarkFilter}
                onClear={handleClearFilter}
              />
            )}
            
          </div>
          <div className='flex items-center justify-end gap-3 w-full md:w-auto'>
            <Tooltip title="Refrescar" placement='top' arrow>
              <span>
                <IconButton
                  aria-label="refresh"
                  onClick={handleRefresh}
                  disabled={loading || !socketReady}
                >
                  <RefreshRoundedIcon className={loading ? 'animate-spin' : ''} />
                </IconButton>
              </span>
            </Tooltip>

            {/* Componente de búsqueda mejorado */}
            <div className="w-full md:w-80">
              <EnhancedSearchBar
                searchValue={searchInputValue}
                onSearchChange={handleSearchChange}
                onClearAllFilters={handleClearAllFilters}
                loading={loading}
                onDelete={() => {
                  // Aquí puedes manejar la lógica de eliminación
                  if (selectedRowId) {
                    // Implementa tu lógica para eliminar el registro seleccionado
                    console.log("Eliminar registro ID:", selectedRowId);
                    // socket.emit("deleteBodyCam", { id: selectedRowId });
                  } else {
                    setError("Selecciona un registro para eliminar");
                    setOpenSnackbar(true);
                  }
                }}
              />
            </div>

            {canCreate && <AddBD onSuccess={fetchData} currentPage={currentPage} />}
          </div>
        </div>

        <div className='flex-1 relative overflow-hidden'>
          <CRUDTable
            data={data}
            loading={loading}
            count={count}
            currentPage={currentPage - 1}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            pagination={true}
            filter={true}
            activeFilter={currentMarkFilter}
            rowOnClick={handleRowClick}
            selectedRowId={selectedRowId}
          />
        </div>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || "Operación completada con éxito"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default memo(BaseDatos);