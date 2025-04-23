import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CRUDTable from '../../Components/Table/CRUDTable';
import { socket, authenticateSocket } from '../../Components/Socket/socket';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
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
  Chip,
  Box,
  Button
} from '@mui/material';
import usePermissions from '../../Components/hooks/usePermission';
import { useSelector } from 'react-redux';
import UseUrlParamsManager from '../../Components/hooks/UseUrlParamsManager';
import AddBodycam from './AddBodycam';
import MissingFieldsModal from './CustomModal';

// Componente mejorado de barra de búsqueda
const EnhancedSearchBar = ({
  searchValue,
  onSearchChange,
  currentStatusFilter,
  onClearFilter,
  availableStatuses,
  onFilterSelect,
  onClearAllFilters,
  loading
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (status) => {
    onFilterSelect(status);
    handleMenuClose();
  };

  const handleClearSearch = () => {
    // En lugar de solo limpiar el texto, usamos la función para limpiar todos los filtros
    onClearAllFilters();
    
    // Focus back to the search input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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
          pr: searchValue || currentStatusFilter ? 1 : 0,
          "&:hover, &.Mui-focused": {
            backgroundColor: "rgba(0, 0, 0, 0.04)"
          }
        }
      }}
    >
      <InputLabel htmlFor="search-bodycam-input">Buscar bodycam</InputLabel>
      <Input
        id="search-bodycam-input"
        value={searchValue}
        onChange={onSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        inputRef={searchInputRef}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon color={searchValue ? "primary" : "action"} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end" className="flex items-center gap-1">
            
            {/* Botón para limpiar búsqueda */}
            {searchValue && (
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

            {/* Botón de filtro */}
            <Tooltip title="Filtrar por estado" placement="top" arrow>
              <IconButton
                aria-label="filter"
                onClick={handleFilterClick}
                color={currentStatusFilter ? "primary" : "default"}
                size="small"
                sx={{ p: 0.5 }}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        }
        placeholder="Número, responsable, turno..."
        sx={{
          pl: 1,
          pr: 0.5,
          transition: "all 0.3s ease",
          backgroundColor: isFocused ? "rgba(0, 0, 0, 0.04)" : "transparent",
        }}
      />

      {/* Menú de filtros */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <Box sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            Filtrar por estado
          </Box>
        </MenuItem>
        {availableStatuses.map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleFilterSelect(status)}
            selected={currentStatusFilter === status}
          >
            {status}
          </MenuItem>
        ))}

        <MenuItem
          onClick={onClearAllFilters}
          disabled={!searchValue && !currentStatusFilter}
          divider
        >
          <Box sx={{ color: 'error.main' }}>Limpiar todos los filtros</Box>
        </MenuItem>
      </Menu>


    </FormControl>
  );
};

// Componente memoizado para mejorar rendimiento
const FilterStatusChip = memo(({ status, onClear }) => (
  <Chip
    label={`Estado: ${status}`}
    color="primary"
    variant="outlined"
    onDelete={onClear}
    size="small"
    className="ml-2"
  />
));

const ControlBody = ({ moduleName }) => {
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

  // Estados de UI
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Estado para el campo de búsqueda
  const [searchInputValue, setSearchInputValue] = useState('');

  // Para debounce de búsqueda
  const timeoutRef = useRef(null);

  // Constantes
  const availableStatuses = ['EN CAMPO', 'EN CECOM'];

  // Obtener parámetros actuales de la URL
  const urlParams = new URLSearchParams(location.search);
  const currentPage = parseInt(urlParams.get('page') || '1');
  const rowsPerPage = parseInt(urlParams.get('limit') || '20');
  const currentSearchTerm = urlParams.get('search') || '';
  const currentStatusFilter = urlParams.get('status') || '';

  // Inicializar estados desde URL al montar
  useEffect(() => {
    setSearchInputValue(currentSearchTerm);
    setIsSearching(!!currentSearchTerm);
  }, []);

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
  const handleUpdateControlBodys = useCallback((response) => {
    if (response?.status === 200 && response?.data) {
      const rows = response.data.data || [];
      const totalCount = response.data.totalCount || 0;

      // Transformar datos
      const transformedRows = rows
        .sort((a, b) => b.id - a.id)
        .map(row => ({
          id: row.id,
          bodyCams: row.bodyCams?.numero || row.id_Body || '',
          Responsable: row.nombres && row.apellidos ? `${row.nombres} ${row.apellidos}` : '',
          "fecha de entrega": row.fecha_entrega || '',
          "hora de entrega": row.hora_entrega || '',
          turno: row.horarios?.turno || row.id_turno || '',
          Jurisdiccion: row.Jurisdiccions?.jurisdiccion || '',
          Unidad: row.Unidads?.numero || '',
          funcion: row.funcion || '',
          "fecha de devolucion": row.fecha_devolucion || '',
          "hora de devolucion": row.hora_devolucion || '',
          detalles: row.detalles || '',
          Estado: row.status || '',
        }));

      setData(transformedRows);
      setCount(totalCount);
      setLoading(false);
    } else {
      setData([]);
      setCount(0);
      setError(response?.message || 'Error al cargar datos');
      setOpenSnackbar(true);
      setLoading(false);
    }
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
      search: currentSearchTerm,
      status: currentStatusFilter
    };

    console.log("Enviando parámetros al servidor:", apiParams);
    // Enviar getAllbodycamsfilter para búsqueda global
    socket.emit("getAllbodycamsfilter", apiParams);
  }, [socketReady, currentPage, rowsPerPage, currentSearchTerm, currentStatusFilter]);

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

      handleUpdateControlBodys(response);
    };

    const handleBodycamActualizada = (response) => {
      if (response?.status === 200) {
        fetchData();
      } else {
        setError(response?.message || "Error en la actualización");
        setOpenSnackbar(true);
      }
    };

    // Configurar listeners
    socket.on("getAllbodycamsfilterResponse", handleSocketResponse);
    socket.on("getAllControlBodysResponse", handleSocketResponse);
    socket.on("ControlBodys", handleUpdateControlBodys);
    socket.on("bodycamActualizada", handleBodycamActualizada);
    socket.on("controlBodysUpdated", fetchData);
    socket.on("ActualizarControlBodysResponse", (response) => {
      if (response?.status === 200) {
        fetchData();
        setOpenSnackbar(true);
        setError(null);
      } else {
        setError(response?.message || "Error al actualizar el control de bodycam");
        setOpenSnackbar(true);
      }
    });
    socket.on("newControlBodyAdded", fetchData);

    // Limpieza
    return () => {
      socket.off("getAllbodycamsfilterResponse", handleSocketResponse);
      socket.off("getAllControlBodysResponse", handleSocketResponse);
      socket.off("ControlBodys", handleUpdateControlBodys);
      socket.off("bodycamActualizada", handleBodycamActualizada);
      socket.off("controlBodysUpdated");
      socket.off("ActualizarControlBodysResponse");
      socket.off("newControlBodyAdded");
    };
  }, [socketReady, fetchData, handleUpdateControlBodys]);

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
    addParams({ page });
  };

  const handleRowsPerPageChange = (event) => {
    const newLimit = parseInt(event.target.value);
    addParams({ page: 1, limit: newLimit });
  };

  // Manejador de clic en fila
  const handleRowClick = (e, row) => {
    setSelectedRowId(prevId => prevId === row.id ? null : row.id);
  };

  // Manejadores de menú de filtro
  const handleFilterSelect = (status) => {
    addParams({ status, page: 1 });
  };

  const handleClearFilter = () => {
    const currentParams = { ...getParams() };
    delete currentParams.status;
    addParams({ ...currentParams, page: 1 });
  };

  // Manejador de cambio en búsqueda con debounce
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInputValue(value);
    setIsSearching(value !== '');

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce para reducir llamadas
    timeoutRef.current = setTimeout(() => {
      if (value.trim() === '') {
        const currentParams = { ...getParams() };
        delete currentParams.search;
        addParams({ ...currentParams, page: 1 });
      } else {
        addParams({ search: value.trim(), page: 1 });
      }
    }, 500); // Tiempo de debounce
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchInputValue('');
    setIsSearching(false);

    const currentParams = { ...getParams() };
    delete currentParams.search;
    addParams({ ...currentParams, page: 1 });
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
    removeParams();
  };

  // Cerrar Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // Manejadores para el modal de edición
  const handleEditMissing = (row) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const handleModalSave = (updatedData) => {
    if (!selectedRow?.id) {
      setError("No se pudo identificar el registro de control a actualizar");
      setOpenSnackbar(true);
      setModalOpen(false);
      return;
    }

    setLoading(true);

    const payload = {
      id: selectedRow.id,
      fecha_devolucion: updatedData.fecha_devolucion,
      hora_devolucion: updatedData.hora_devolucion,
      detalles: updatedData.detalles,
      status: updatedData.status
    };

    if (updatedData.numero_unidad) {
      payload.numero_unidad = updatedData.numero_unidad;
    }

    socket.emit("ActualizarControlBodys", payload, (response) => {
      setLoading(false);

      if (response?.status === 200) {
        setError(null);
        setOpenSnackbar(true);
      } else {
        setError(response?.message || "Error al actualizar el control de bodycam");
        setOpenSnackbar(true);
      }

      setModalOpen(false);
      setSelectedRow(null);
    });
  };

  return (
    <div className='flex flex-col w-full h-screen max-h-screen overflow-hidden'>
      <header className="text-white bg-green-700 py-4 px-3 mb-4 w-full rounded-lg flex justify-center relative flex-shrink-0">
        <Link onClick={() => navigate(-1)} className='flex items-center gap-1'>
          <ArrowBackIosNewRoundedIcon className='!size-5 md:!size-6 mt-[0.1rem] absolute left-4' />
        </Link>
        <h1 className="md:text-2xl lg:text-4xl font-bold text-center">Control de Bodycam</h1>
      </header>

      <div className='flex-1 flex flex-col bg-white shadow rounded-lg p-4 overflow-hidden'>
        <div className='flex flex-col md:flex-row justify-between pb-4 gap-3 flex-shrink-0'>
          <div className='flex items-center gap-2'>
            <span className='text-gray-600'>
              Total de filas: <span id="rowCount" className='font-bold'>{count || 0}</span>
            </span>
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

            {/* Nuevo componente de búsqueda mejorado */}
            <div className="w-full md:w-80">
              <EnhancedSearchBar
                searchValue={searchInputValue}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                currentStatusFilter={currentStatusFilter}
                onClearFilter={handleClearFilter}
                availableStatuses={availableStatuses}
                onFilterSelect={handleFilterSelect}
                onClearAllFilters={handleClearAllFilters}
                loading={loading}
              />
            </div>

            {canCreate && <AddBodycam currentPage={currentPage} />}
          </div>
        </div>

        <div className='flex-1 relative overflow-hidden'>
          <CRUDTable
            data={data}
            loading={loading}
            count={count}
            onEdit={handleEditMissing}
            currentPage={currentPage - 1}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            pagination={true}
            filter={true}
            activeFilter={currentStatusFilter}
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

      {selectedRow && (
        <MissingFieldsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          rowData={selectedRow}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default memo(ControlBody);