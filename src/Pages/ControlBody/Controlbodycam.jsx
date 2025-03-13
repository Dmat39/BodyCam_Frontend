import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import AddBodycam from './AddBodycam';
import MissingFieldsModal from './CustomModal';

const ControlBody = ({ moduleName }) => {
  const { canCreate } = usePermissions(moduleName);
  const { token } = useSelector((state) => state.auth);
  const { addParams, getParams } = UseUrlParamsManager();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(getParams('search') || '');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const timeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const params = getParams();
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    setCurrentPage(page); // Actualiza el estado con la página de la URL
    socket.emit("getAllControlBodys", { page, limit });
  }, [location.search]);

  // Función para transformar la respuesta del servidor y actualizar el estado
  const handleUpdateControlBodys = useCallback((response) => {
    console.log("📥 Respuesta del servidor:", response);

    if (response.status === 200 && response.data) {
      let rows = response.data.data || [];
      let totalCount = response.data.totalCount || 0;

      // Ordenar por ID o fecha de creación
      rows = rows.sort((a, b) => a.id - b.id);

      const transformedRows = rows.map(row => ({
        id: row.id,
        bodyCams: row.bodyCams?.numero || row.id_Body || '',
        Personas: row.Personas ? `${row.Personas.nombres} ${row.Personas.apellidos}` : '',
        fecha_entrega: row.fecha_entrega || '',
        hora_entrega: row.hora_entrega || '',
        turno: row.Horarios?.turno || row.id_turno || '', // Añadida la columna de turno
        Jurisdiccions: row.Jurisdiccions?.jurisdiccion || '',
        Unidads: row.Unidads?.numero || '',
        funcions: row.funcions?.funcion || '',
        fecha_devolucion: row.fecha_devolucion || '',
        hora_devolucion: row.hora_devolucion || '',
        detalles: row.detalles || '',
        status: row.status || '',
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
    if (!socket.connected) {
      console.warn("⚠️ El socket no está conectado.");
      setError("El servidor no está disponible");
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    console.log("📡 Solicitando ControlBodys...");
    socket.emit("getAllControlBodys", { page: currentPage, limit: 20 });
  }, [currentPage]);

  // Manejo del cambio en el input de búsqueda
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

  // Handler para refrescar la información
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    socket.emit("getAllControlBodys", { page: currentPage, limit: 20 });
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
  
  useEffect(() => {
    authenticateSocket(token);

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
        handleUpdateControlBodys(response);
      } else {
        console.error("⚠️ Error al obtener ControlBodys:", response.message);
        setError(response.message || "Error al obtener datos");
        setOpenSnackbar(true);
        setLoading(false);
      }
    };

    // Nuevo listener para la respuesta de actualización
    const handleBodycamActualizada = (response) => {
      console.log("Respuesta de actualización:", response);
      if (response.status === 200) {
        // Por ejemplo, refrescamos la tabla para ver la actualización
        handleRefresh();
      } else {
        setError(response.message || "Error en la actualización");
        setOpenSnackbar(true);
      }
    };

    const handleControlBodysUpdated = (data) => {
      console.log("Notificación de actualización de ControlBodys:", data);
      // Si recibimos la notificación, solicitamos los datos actualizados para la página actual
      socket.emit("getAllControlBodys", { page: currentPage, limit: 20 });
    };

    // Listener para respuesta después de actualizar un ControlBody
    const handleActualizarControlBodysResponse = (response) => {
      console.log("Respuesta de ActualizarControlBodys:", response);
      if (response && response.status === 200) {
        handleRefresh();
        setOpenSnackbar(true);
        setError(null);
      } else {
        setError(response?.message || "Error al actualizar el control de bodycam");
        setOpenSnackbar(true);
      }
    };

    // Listener para respuesta después de obtener un ControlBody específico
    const handleGetControlBodyResponse = (response) => {
      console.log("Respuesta de getControlBody:", response);
      // Aquí puedes manejar la respuesta si es necesario
    };

    socket.on("getAllControlBodysResponse", handleResponse);
    socket.on("ControlBodys", handleUpdateControlBodys);
    socket.on("bodycamActualizada", handleBodycamActualizada);
    socket.on("controlBodysUpdated", handleControlBodysUpdated);
    socket.on("getControlBody", handleGetControlBodyResponse);
    socket.on("ActualizarControlBodysResponse", handleActualizarControlBodysResponse);
    socket.on("connect", handleSocketReconnect);
    socket.on("disconnect", () => {
      console.warn("⚠️ Socket desconectado");
      setError("Se ha perdido la conexión con el servidor");
      setOpenSnackbar(true);
    });

    fetchInitialData();

    return () => {
      socket.off("getAllControlBodysResponse", handleResponse);
      socket.off("ControlBodys", handleUpdateControlBodys);
      socket.off("bodycamActualizada", handleBodycamActualizada);
      socket.off("controlBodysUpdated", handleControlBodysUpdated);
      socket.off("getControlBody", handleGetControlBodyResponse);
      socket.off("ActualizarControlBodysResponse", handleActualizarControlBodysResponse);
      socket.off("connect", handleSocketReconnect);
      socket.off("disconnect");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token, handleUpdateControlBodys, fetchInitialData, handleSocketReconnect, currentPage]);

  // Función para abrir el modal al hacer clic en la acción de la fila
  const handleEditMissing = (row) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  // Función que se ejecuta al guardar desde el modal
  const handleModalSave = (updatedData) => {
    // updatedData incluye fecha_devolucion, hora_devolucion, detalles, status
    const payload = {
      numero: selectedRow.bodyCams, // Ajusta si tu backend usa 'numero' para buscar
      ...updatedData,
    };

    // Emitir el evento sin callback
    socket.emit("ActualizarControlBodys", payload);

    setModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className='h-full flex flex-col w-full bg-gray-100 p-4'>
      <header className="text-white bg-green-700 py-4 px-3 mb-6 w-full rounded-lg flex justify-center relative">
        <Link onClick={() => navigate(-1)} className='flex items-center gap-1'>
          <ArrowBackIosNewRoundedIcon className='!size-5 md:!size-6 mt-[0.1rem] absolute left-4' />
        </Link>
        <h1 className="md:text-2xl lg:text-4xl font-bold text-center">Control de Bodycam</h1>
      </header>
      <main className='flex-1 bg-white shadow rounded-lg p-4 h-full overflow-hidden'>
        <div className='flex flex-col w-full h-full'>
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
              {canCreate && <AddBodycam currentPage={currentPage} />}
            </div>
          </div>
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
              onEdit={handleEditMissing}
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