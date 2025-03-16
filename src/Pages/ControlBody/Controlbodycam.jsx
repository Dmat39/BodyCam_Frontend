import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Alert
} from '@mui/material';
import usePermissions from '../../Components/hooks/usePermission';
import { useSelector } from 'react-redux';
import UseUrlParamsManager from '../../Components/hooks/UseUrlParamsManager';
import AddBodycam from './AddBodycam';
import MissingFieldsModal from './CustomModal';

const ControlBody = ({ moduleName }) => {
  const { canCreate } = usePermissions(moduleName);
  const { token } = useSelector((state) => state.auth);
  const { addParams, getParams } = UseUrlParamsManager();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(getParams('search') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const timeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(parseInt(getParams('page')) || 1);
  // Estado para controlar la disponibilidad del socket
  const [socketReady, setSocketReady] = useState(false);

  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const params = getParams();
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    setCurrentPage(page); // Actualiza el estado con la página de la URL

    // Actualizar la URL si cambia la página
    if (page !== currentPage) {
      addParams({ page });
    }
  }, [getParams, addParams]);

  // Función para cambiar de página desde el componente de tabla
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    addParams({ page: newPage });

    if (socketReady) {
      socket.emit("getAllControlBodys", { page: newPage, limit: 20 });
    }
  };

  // Función para transformar la respuesta del servidor y actualizar el estado
  const handleUpdateControlBodys = useCallback((response) => {
    if (response.status === 200 && response.data) {
      let rows = response.data.data || [];
      let totalCount = response.data.totalCount || 0;

      rows = rows.sort((a, b) => b.id - a.id);

      const transformedRows = rows.map(row => ({
        id: row.id,
        bodyCams: row.bodyCams?.numero || row.id_Body || '',
        Responsable: row.Personas ? `${row.Personas.nombres} ${row.Personas.apellidos}` : '',
        "fecha de entrega": row.fecha_entrega || '',
        "hora de entrega": row.hora_entrega || '',
        turno: row.horarios?.turno || row.id_turno || '',
        Jurisdiccion: row.Jurisdiccions?.jurisdiccion || '',
        Unidad: row.Unidads?.numero || '',
        funcion: row.funcions?.funcion || '',
        "fecha de devolucion": row.fecha_devolucion || '',
        "hora de devolucion": row.hora_devolucion || '',
        detalles: row.detalles || '',
        Estado: row.status || '',
      }));

      setData(transformedRows);
      setCount(totalCount);
    } else {
      setData([]);
      setCount(0);
      setError(response.message || 'Error al cargar datos');
      setOpenSnackbar(true);
    }
    setLoading(false);
  }, []);

  // Emitir el evento para obtener datos iniciales
  const fetchInitialData = useCallback(() => {
    setLoading(true);
    setError(null);
    socket.emit("getAllControlBodys", {
      page: currentPage,
      limit: 20,
      search: searchTerm.trim()
    });
  }, [currentPage, searchTerm]);

  // Manejo del cambio en el input de búsqueda
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Solo indica que está buscando, pero no bloquea la interfaz
    setIsSearching(value.trim() !== '');

    // Usa debounce para retrasar la solicitud de búsqueda real
    timeoutRef.current = setTimeout(() => {
      // Actualiza los parámetros de URL y reinicia la página
      addParams({ search: value.trim(), page: 1 });
      setCurrentPage(1);

      // Solo activa la solicitud del socket si está conectado
      if (socketReady) {
        setLoading(true);
        socket.emit("getAllControlBodys", {
          page: 1,
          limit: 20,
          search: value.trim()
        });
      } else {
        setError("No hay conexión con el servidor");
        setOpenSnackbar(true);
        setIsSearching(false);
      }
    }, 300); // Tiempo reducido para una sensación más receptiva
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    addParams({ search: '', page: 1 });
    setCurrentPage(1);
    if (socketReady) {
      setLoading(true);
      socket.emit("getAllControlBodys", {
        page: 1,
        limit: 20,
        search: ''
      });
    }
  };

  // Handler para refrescar la información
  const handleRefresh = useCallback(() => {
    if (socketReady) {
      setLoading(true);
      setError(null);
      socket.emit("getAllControlBodys", { page: currentPage, limit: 20 });
    } else {
      setError("No hay conexión con el servidor. Espere a que se restablezca.");
      setOpenSnackbar(true);
    }
  }, [currentPage, socketReady]);

  // Cerrar snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // Primer useEffect para manejar la conexión del socket
  useEffect(() => {
    // Función para manejar la conexión exitosa
    const handleConnect = () => {
      console.log("✅ Socket conectado exitosamente");
      authenticateSocket(token);
      setSocketReady(true);
      setError(null);
    };

    // Función para manejar la desconexión
    const handleDisconnect = () => {
      console.warn("⚠️ Socket desconectado");
      setSocketReady(false);
      setError("Se ha perdido la conexión con el servidor");
      setOpenSnackbar(true);
    };

    // Función para manejar errores de conexión
    const handleConnectError = (err) => {
      console.error("❌ Error de conexión del socket:", err);
      setSocketReady(false);
      setError("Error al conectar con el servidor");
      setOpenSnackbar(true);
    };

    // Registrar los handlers de conexión
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Asegurarse de que el socket esté conectado
    if (!socket.connected && !socket.connecting) {
      console.log("Iniciando conexión del socket...");
      socket.connect();
    } else if (socket.connected) {
      // Si ya está conectado al montar el componente
      handleConnect();
    }

    // Limpieza al desmontar
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [token]);

  // Segundo useEffect para cargar datos una vez que el socket esté listo
  useEffect(() => {
    if (socketReady) {
      fetchInitialData();

      // Configuración de los manejadores de eventos para datos
      const handleResponse = (response) => {
        if (typeof response !== "object" || response === null) {
          console.error("❌ Respuesta inválida del servidor:", response);
          setError("Respuesta inválida del servidor");
          setOpenSnackbar(true);
          setLoading(false);
          return;
        }

        if (response.status === 200) {
          handleUpdateControlBodys(response);
        } else {
          console.error("⚠️ Error al obtener ControlBodys:", response.message);
          setError(response.message || "Error al obtener datos");
          setOpenSnackbar(true);
          setLoading(false);
        }
      };

      const handleBodycamActualizada = (response) => {
        if (response.status === 200) {
          handleRefresh();
        } else {
          setError(response.message || "Error en la actualización");
          setOpenSnackbar(true);
        }
      };

      const handleControlBodysUpdated = () => {
        socket.emit("getAllControlBodys", { page: currentPage, limit: 20 });
      };

      const handleActualizarControlBodysResponse = (response) => {
        if (response && response.status === 200) {
          handleRefresh();
          setOpenSnackbar(true);
          setError(null);
        } else {
          setError(response?.message || "Error al actualizar el control de bodycam");
          setOpenSnackbar(true);
        }
      };

      const handleNewControlBodyAdded = (response) => {
        if (response && response.data) {
          handleRefresh(); // Actualiza la tabla silenciosamente sin mostrar mensajes
        }
      };

      // Registro de manejadores de eventos para datos
      socket.on("getAllControlBodysResponse", handleResponse);
      socket.on("ControlBodys", handleUpdateControlBodys);
      socket.on("bodycamActualizada", handleBodycamActualizada);
      socket.on("controlBodysUpdated", handleControlBodysUpdated);
      socket.on("ActualizarControlBodysResponse", handleActualizarControlBodysResponse);
      socket.on("newControlBodyAdded", handleNewControlBodyAdded);

      // Limpieza
      return () => {
        socket.off("getAllControlBodysResponse", handleResponse);
        socket.off("ControlBodys", handleUpdateControlBodys);
        socket.off("bodycamActualizada", handleBodycamActualizada);
        socket.off("controlBodysUpdated", handleControlBodysUpdated);
        socket.off("ActualizarControlBodysResponse", handleActualizarControlBodysResponse);
        socket.off("newControlBodyAdded", handleNewControlBodyAdded); // NUEVO: Quitar listener al desmontar
      };
    }
  }, [socketReady, currentPage, searchTerm, handleUpdateControlBodys, fetchInitialData, handleRefresh]);

  // Limpieza adicional
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Función para abrir el modal al hacer clic en la acción de la fila
  const handleEditMissing = (row) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  // Función que se ejecuta al guardar desde el modal
  // Función que se ejecuta al guardar desde el modal
  const handleModalSave = (updatedData) => {
    // Asegurarse de que tenemos el número de bodycam
    if (!selectedRow || !selectedRow.bodyCams) {
      setError("No se pudo identificar la bodycam a actualizar");
      setOpenSnackbar(true);
      setModalOpen(false);
      return;
    }

    setLoading(true);

    // Crear el payload con los datos correctos para el backend
    // Importante: usar "numero" aquí porque el backend usa getBodyCamByName(numero)
    const payload = {
      numero: selectedRow.bodyCams,
      fecha_devolucion: updatedData.fecha_devolucion,
      hora_devolucion: updatedData.hora_devolucion,
      detalles: updatedData.detalles,
      status: updatedData.status
    };

    // Emitir el evento para actualizar con callback
    socket.emit("ActualizarControlBodys", payload, (response) => {
      setLoading(false);

      if (response && response.status === 200) {
        setError(null);
        setOpenSnackbar(true);
        // No es necesario llamar a handleRefresh aquí si el servidor
        // emite correctamente los eventos de actualización
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
      {/* Header fixed at top */}
      <header className="text-white bg-green-700 py-4 px-3 mb-4 w-full rounded-lg flex justify-center relative flex-shrink-0">
        <Link onClick={() => navigate(-1)} className='flex items-center gap-1'>
          <ArrowBackIosNewRoundedIcon className='!size-5 md:!size-6 mt-[0.1rem] absolute left-4' />
        </Link>
        <h1 className="md:text-2xl lg:text-4xl font-bold text-center">Control de Bodycam</h1>
      </header>

      {/* Main content wrapper with fixed height */}
      <div className='flex-1 flex flex-col bg-white shadow rounded-lg p-4 overflow-hidden'>
        {/* Control bar fixed at top of content area */}
        <div className='flex flex-col md:flex-row justify-between pb-4 gap-3 flex-shrink-0'>
          <div className='flex items-center gap-2'>
            <span className='text-gray-600'>
              Total de filas: <span id="rowCount" className='font-bold'>{count || 0}</span>
            </span>
          </div>
          <div className='flex items-center justify-end gap-3'>
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
            <FormControl variant="standard" size='small' className='w-full max-w-full md:max-w-sm'>
              <InputLabel htmlFor="input-with-icon-adornment">Buscar bodycam</InputLabel>
              <Input
                id="input-with-icon-adornment"
                value={searchTerm}
                onChange={handleSearchChange}
                // Elimina la propiedad disabled para asegurar que la entrada esté siempre disponible
                // disabled={loading}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                endAdornment={
                  searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={handleClearSearch}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
                placeholder="Buscar bodycam"
              />
            </FormControl>
            {searchTerm && (
              <div className='flex items-center justify-start px-2 py-1 bg-blue-50 rounded-md text-sm text-blue-700 flex-shrink-0'>
                <span className='font-medium'>Búsqueda activa:</span>
                <span className='ml-1'>{searchTerm}</span>
                <Tooltip title="Limpiar búsqueda" placement='top' arrow>
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    aria-label="clear search"
                    className='ml-1'
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            )}
            {canCreate && <AddBodycam currentPage={currentPage} />}
          </div>

        </div>

        {/* Table container that gets scrollbar - takes remaining height */}
        <div className='flex-1 relative overflow-hidden'>
          <CRUDTable
            data={data}
            loading={loading}
            count={count}
            onEdit={handleEditMissing}
            currentPage={currentPage}
            onPageChange={handlePageChange}
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

      {/* Renderizar el modal cuando se haya seleccionado una fila */}
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

export default ControlBody;