import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CRUDTable from '../../Components/Table/CRUDTable';
import { socket, authenticateSocket } from '../../Components/Socket/socket';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchIcon from '@mui/icons-material/Search';
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
import AddBD from './Add_BD';

// Función de utilidad para transformar un objeto row en el formato consistente
const transformRow = (row) => ({
  id: row.id,
  numero: row.numero || '',
  serie: row.serie || '',
  nro_bateria: row.nro_bateria || '',
  marca: row.proveedors?.marca || '',
  modelo: row.proveedors?.modelo || '',
  state: row.state != null ? row.state.toString() : '',
});

const BaseDatos = ({ moduleName }) => {
  const { canCreate } = usePermissions(moduleName);
  const { token } = useSelector((state) => state.auth);
  const { addParams, getParams } = UseUrlParamsManager();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(getParams().search || '');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const timeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Referencia para rastrear si estamos conectados
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const params = getParams();
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    setCurrentPage(page); // Actualiza el estado con la página de la URL
    socket.emit("getAllBodys", { page, limit });
  }, [location.search]);

  /**
   * Función para transformar y guardar la data
   */
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
      // código de manejo de error existente
    }
    setLoading(false);
  }, []);

  /**
   * Cargar datos iniciales
   */
  const fetchInitialData = useCallback(() => {
    if (!socket.connected) {
      console.warn("⚠️ El socket no está conectado.");
      setError("El servidor no está disponible");
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    console.log("📡 Solicitando datos iniciales...");
    socket.emit("getAllBodys", {
      page: currentPage,
      limit: 20,
      sortBy: 'id',  // Ordena por ID
      sortOrder: 'desc'  // De más reciente a más antiguo
    });
  }, [currentPage]);

  /**
   * Manejo de búsqueda (client-side o server-side)
   */
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      addParams({ search: value.trim() });
      // Aquí podrías implementar la búsqueda en el servidor si el backend lo soporta
    }, 800);
  };

  /**
   * Refrescar datos manualmente
   */
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    socket.emit("getAllBodys", {
      page: currentPage,
      limit: 20,
      sortBy: 'id',
      sortOrder: 'desc'
    });
  }, [currentPage]);

  // Cerrar snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // Manejar reconexión del socket
  const handleSocketReconnect = useCallback(() => {
    console.log("Socket reconectado, actualizando datos...");
    authenticateSocket(token);
    fetchInitialData();
  }, [token, fetchInitialData]);

  /**
   * useEffect para configurar sockets y obtener datos
   */
  useEffect(() => {
    // Autenticar y conectar el socket
    authenticateSocket(token);

    // Handler para la respuesta del socket
    const handleResponse = (response) => {
      if (typeof response !== "object" || response === null) {
        console.error("❌ Respuesta inválida del servidor:", response);
        setError("Respuesta inválida del servidor");
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }
      console.log("🔄 Respuesta del servidor:", response);
      if (response.status === 200) {
        handleUpdateBodyCams(response);
      } else {
        console.error("⚠️ Error al obtener data:", response.message);
        setError(response.message || "Error al obtener datos");
        setOpenSnackbar(true);
        setLoading(false);
      }
    };

    // Monitorear conexión del socket
    const onConnect = () => {
      console.log('Socket conectado');
      isConnectedRef.current = true;
      handleSocketReconnect();
    };

    const onDisconnect = () => {
      console.log('Socket desconectado');
      isConnectedRef.current = false;
      setError("Se ha perdido la conexión con el servidor");
      setOpenSnackbar(true);
    };

    // Escuchar eventos del socket
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('getAllBodysResponse', handleResponse);
    socket.on('listaallbodys', handleUpdateBodyCams);

    // 3. Escuchar cuando se registra una nueva BodyCam
    const handleBodyCamRegistrada = (response) => {
      console.log('Nueva BodyCam registrada:', response);

      if (response?.status === 200 && response?.data) {
        // Recargar datos para mantener la coherencia con el servidor
        handleRefresh();
      } else {
        console.warn('Respuesta de nueva BodyCam inválida:', response);
        setError(response?.message || "Error al procesar la nueva BodyCam");
        setOpenSnackbar(true);
      }
    };
    socket.on("bodyCamRegistrada", (response) => {
      if (response.status === 200) {
        console.log("Nueva bodycam registrada");

        // Simplemente refrescar los datos de la página actual sin cambiar de página
        handleRefresh();

        // O si prefieres ser más explícito:
        socket.emit("getAllBodys", {
          page: currentPage, // Mantener la página actual
          limit: 20,
          sortBy: 'id',
          sortOrder: 'desc'
        });
      } else {
        setError(response?.message || "Error al procesar la nueva BodyCam");
        setOpenSnackbar(true);
      }
    });

    // Escuchar actualizaciones
    socket.on('bodyCamActualizada', (response) => {
      console.log("Respuesta de actualización:", response);
      if (response.status === 200) {
        handleRefresh();
      } else {
        setError(response.message || "Error en la actualización");
        setOpenSnackbar(true);
      }
    });

    // Si ya estamos conectados, obtener datos iniciales
    if (socket.connected) {
      console.log('Socket ya conectado, obteniendo datos...');
      isConnectedRef.current = true;
      fetchInitialData();
    }

    // Cleanup: remover listeners al desmontar
    return () => {
      console.log('Limpiando listeners de socket');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('getAllBodysResponse', handleResponse);
      socket.off('listaallbodys', handleUpdateBodyCams);
      socket.off('bodyCamRegistrada', handleBodyCamRegistrada);
      socket.off('bodyCamActualizada');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token, handleUpdateBodyCams, fetchInitialData, handleSocketReconnect, handleRefresh, currentPage]);

  return (
    <div className='h-full flex flex-col w-full bg-gray-100 p-4'>
      {/* Encabezado */}
      <header className="text-white bg-green-700 py-4 px-3 mb-6 w-full rounded-lg flex justify-center relative">
        <Link onClick={() => navigate(-1)} className='flex items-center gap-1'>
          <ArrowBackIosNewRoundedIcon className='!size-5 md:!size-6 mt-[0.1rem] absolute left-4' />
        </Link>
        <h1 className="md:text-2xl lg:text-4xl font-bold text-center">Base de Datos</h1>
      </header>

      {/* Contenido principal */}
      <main className='flex-1 bg-white shadow rounded-lg p-4 h-full overflow-hidden'>
        <div className='flex flex-col w-full h-full'>

          {/* Barra superior (count, buscar, refrescar, botón crear) */}
          <div className='w-full flex flex-col md:flex-row justify-between pb-6 gap-3'>
            <div className='w-full flex items-center gap-2'>
              <span className='text-gray-600'>
                Total de filas: <span id="rowCount" className='font-bold'>{count || 0}</span>
              </span>
            </div>
            <div className='w-full flex items-center justify-end gap-3'>
              <Tooltip title="Refrescar" placement='top' arrow>
                <IconButton
                  aria-label="refresh"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshRoundedIcon className={loading ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>
              <FormControl variant="standard" size='small' className='w-full max-w-full md:max-w-sm'>
                <InputLabel htmlFor="input-with-icon-adornment">Buscar</InputLabel>
                <Input
                  id="input-with-icon-adornment"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                />
              </FormControl>
              {canCreate && <AddBD onSuccess={fetchInitialData} currentPage={currentPage} />}
            </div>
          </div>

          {/* Tabla de BodyCams */}
          <div className='relative h-full'>
            {loading && (
              <div className='absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10'>
                <div className='animate-pulse text-green-700 font-semibold'>Cargando...</div>
              </div>
            )}
            <CRUDTable
              data={data}
              loading={loading}
              count={count}
            />
          </div>
        </div>
      </main>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BaseDatos;