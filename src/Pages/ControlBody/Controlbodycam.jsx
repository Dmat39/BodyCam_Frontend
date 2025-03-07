import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CRUDTable from '../../Components/Table/CRUDTable';
import { socket, authenticateSocket } from '../../Components/Socket/socket';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, InputLabel, Input, IconButton, Tooltip } from '@mui/material';
import usePermissions from '../../Components/hooks/usePermission';
import { useSelector } from 'react-redux';
import UseUrlParamsManager from '../../Components/hooks/UseUrlParamsManager';
import AddBodycam from './AddBodycam';

const ControlBody = ({ moduleName }) => {
  const { canCreate } = usePermissions(moduleName);
  const { token } = useSelector((state) => state.auth);
  const { addParams } = UseUrlParamsManager();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);


  const handleUpdateControlBodys = (response) => {
    if (response.status === 200 && response.data) {
      const { data: rows = [], totalCount = 0 } = response.data;

      const transformedRows = rows.map(row => ({
        id: row.id, // Asegúrate de conservar el id único de la fila
        // 1. Identificador de la BodyCam (número)
        bodyCams: row.bodyCams?.numero || '',
        // 2. Nombre completo de la Persona que usa la BodyCam
        Personas: row.Personas ? `${row.Personas.nombres} ${row.Personas.apellidos}` : '',
        // 3. Fecha y 4. Hora de entrega
        fecha_entrega: row.fecha_entrega || '',
        hora_entrega: row.hora_entrega || '',
        // 8. Jurisdicción (nombre)
        Jurisdiccions: row.Jurisdiccions?.jurisdiccion || '',
        // 9. Unidad (número)
        Unidads: row.Unidads?.numero || '',
        // 10. Función (nombre)
        funcions: row.funcions?.funcion || '',
        // 5. Fecha y 6. Hora de devolución
        fecha_devolucion: row.fecha_devolucion || '',
        hora_devolucion: row.hora_devolucion || '',
        // 11. Detalles adicionales
        detalles: row.detalles || '',
        // 7. Estado (status)
        status: row.status || '',

      }));

      setData(transformedRows);
      setCount(totalCount);
    } else {
      setData([]);
      setCount(0);
    }
    setLoading(false);
  };
  // Fetch initial data and set up socket listeners
  useEffect(() => {
    // Autenticar y conectar el socket
    authenticateSocket(token);



    // Obtener datos iniciales
    const fetchInitialData = () => {
      socket.emit('getAllControlBodys', { page: 1, limit: 20 }, (response) => {
        handleUpdateControlBodys(response);
      });
    };

    // Escuchar ambos eventos para actualizaciones
    socket.on('updateControlBodys', handleUpdateControlBodys);
    socket.on('ControlBodys', handleUpdateControlBodys);

    // Cargar datos iniciales
    fetchInitialData();

    // Cleanup: remover listeners al desmontar
    return () => {
      socket.off('updateControlBodys', handleUpdateControlBodys);
      socket.off('ControlBodys', handleUpdateControlBodys);
    };
  }, [token]);

  // Search handling
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      addParams({ search: value.trim() });
      // Optionally, implement server-side search
      // socket.emit('searchControlBodys', { searchTerm: value.trim() });
    }, 800);
  };

  // Refresh handler
  const handleRefresh = () => {
    setLoading(true);
    socket.emit('getAllControlBodys', { page: 1, limit: 20 }, (response) => {
      handleUpdateControlBodys(response);
    });
  };


  return (
    <div className='h-full flex flex-col w-full bg-gray-100 p-4'>
      {/* ... (previous header code remains the same) ... */}
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
                <IconButton aria-label="refresh" onClick={handleRefresh}>
                  <RefreshRoundedIcon />
                </IconButton>
              </Tooltip>
              <FormControl variant="standard" size='small' className='w-full max-w-full md:max-w-sm'>
                <InputLabel htmlFor="input-with-icon-adornment">Buscar</InputLabel>
                <Input
                  id="input-with-icon-adornment"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                />
              </FormControl>
              {canCreate && <AddBodycam />}
            </div>
          </div>
          <CRUDTable
            data={data}
            loading={loading}
            count={count}
          />
        </div>
      </main>
    </div>
  );
};

export default ControlBody;