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
  const { addParams } = UseUrlParamsManager();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  
  // Referencia para rastrear si estamos conectados
  const isConnectedRef = useRef(false);

  /**
   * Función para transformar y guardar la data
   */
  const handleUpdateBodyCams = (response) => {
    console.log('Respuesta recibida:', response); // Debug
    
    if (response?.status === 200 && response?.data) {
      const { data: rows = [], totalCount = 0 } = response.data;

      // Usamos la función de utilidad para transformar filas
      const transformedRows = rows.map(transformRow);

      setData(transformedRows);
      setCount(totalCount);
    } else {
      console.warn('Respuesta inválida:', response); // Debug
      setData([]);
      setCount(0);
    }
    setLoading(false);
  };

  /**
   * Cargar datos iniciales
   */
  const fetchInitialData = () => {
    setLoading(true);
    console.log('Solicitando datos iniciales...'); // Debug
    socket.emit('getAllBodys', { page: 1, limit: 20 }, (response) => {
      console.log('Datos iniciales recibidos'); // Debug
      handleUpdateBodyCams(response);
    });
  };

  /**
   * useEffect para configurar sockets y obtener datos
   */
  useEffect(() => {
    // Autenticar y conectar el socket
    authenticateSocket(token);
    
    // Monitorear conexión del socket
    const onConnect = () => {
      console.log('Socket conectado'); // Debug
      isConnectedRef.current = true;
      fetchInitialData();
    };
    
    const onDisconnect = () => {
      console.log('Socket desconectado'); // Debug
      isConnectedRef.current = false;
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    // Si ya estamos conectados, obtener datos iniciales
    if (socket.connected) {
      console.log('Socket ya conectado, obteniendo datos...'); // Debug
      isConnectedRef.current = true;
      fetchInitialData();
    }

    // 2. Escuchar evento general que retorna la lista actualizada
    const handleListaAllBodys = (response) => {
      console.log('Evento listaallbodys recibido'); // Debug
      handleUpdateBodyCams(response);
    };
    socket.on('listaallbodys', handleListaAllBodys);

    // 3. Escuchar cuando se registra una nueva BodyCam
    const handleBodyCamRegistrada = (response) => {
      console.log('Nueva BodyCam registrada:', response); // Debug
      
      // Si el servidor envía la nueva bodyCam en "data"
      if (response?.status === 200 && response?.data) {
        try {
          // Usar la misma función de transformación para consistencia
          const newItem = transformRow(response.data);
          
          // Verificar si el item ya existe en la lista por ID
          setData((prevData) => {
            const exists = prevData.some(item => item.id === newItem.id);
            if (exists) {
              console.log('Item ya existe, actualizando...'); // Debug
              return prevData.map(item => item.id === newItem.id ? newItem : item);
            } else {
              console.log('Agregando nuevo item a la lista'); // Debug
              return [...prevData, newItem];
            }
          });
          
          // Actualizar contador solo si es un item nuevo
          setCount((prev) => prev + 1);
          
          // Alertar sobre la actualización
          console.log('Datos actualizados correctamente'); // Debug
        } catch (error) {
          console.error('Error al procesar nueva BodyCam:', error); // Debug
          // Si hay un error en el procesamiento, refrescar todos los datos
          fetchInitialData();
        }
      } else {
        console.warn('Respuesta de nueva BodyCam inválida:', response); // Debug
        // Si la respuesta es inválida, refrescar todos los datos
        fetchInitialData();
      }
    };
    socket.on('bodyCamRegistrada', handleBodyCamRegistrada);

    // Cleanup: remover listeners al desmontar
    return () => {
      console.log('Limpiando listeners de socket'); // Debug
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('listaallbodys', handleListaAllBodys);
      socket.off('bodyCamRegistrada', handleBodyCamRegistrada);
    };
  }, [token]);

  /**
   * Manejo de búsqueda (client-side o server-side)
   */
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Ejemplo: actualizamos query param "search" en la URL
    timeoutRef.current = setTimeout(() => {
      addParams({ search: value.trim() });
      // Si quieres búsqueda en el servidor, emite aquí un evento
      // socket.emit('searchBodyCams', { searchTerm: value.trim() });
    }, 800);
  };

  /**
   * Refrescar datos manualmente
   */
  const handleRefresh = () => {
    setLoading(true);
    fetchInitialData();
  };

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
              {canCreate && <AddBD onSuccess={fetchInitialData} />}
            </div>
          </div>

          {/* Tabla de BodyCams */}
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

export default BaseDatos;