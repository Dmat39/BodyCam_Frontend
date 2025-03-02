import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CRUDTable from '../../Components/Table/CRUDTable';
import { socket } from '../../Components/Socket/socket';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, InputLabel, Input, IconButton, Tooltip } from '@mui/material';
import usePermissions from '../../Components/hooks/usePermission';
import { useSelector } from 'react-redux';
import UseUrlParamsManager from '../../Components/hooks/UseUrlParamsManager';
import AddBD from './Add_BD'; // Componente para agregar una nueva bodycam

const ControlBody = ({ moduleName }) => {
    const { canCreate } = usePermissions(moduleName);
    const { token } = useSelector((state) => state.auth);
    const { addParams } = UseUrlParamsManager();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [count, setCount] = useState(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
    
        socket.emit("getAllBodys", {}, (response) => {
            if (isMounted) {
                console.log("Respuesta de getAllBodys:", response);
                if (response?.data) {
                    setData(response.data);
                    setCount(response.data.length);
                }
            }
        });
    
        const handleListaAllBodys = (response) => {
            console.log("Evento recibido en el frontend:", response);
            if (response?.data) {
                setData(response.data);
                setCount(response.data.length);
            }
        };
    
        socket.off("listaallbodys"); // Elimina cualquier suscripción previa
        socket.on("listaallbodys", handleListaAllBodys);
    
        return () => {
            isMounted = false;
            socket.off("listaallbodys", handleListaAllBodys);
        };
    }, [token]);

    const handleRefresh = () => {
        socket.emit('addBodycam', values, (response) => {
            if (response?.status === 'success') {
              CustomSwal.fire('Agregado', 'La bodycam ha sido agregada correctamente.', 'success');
              handleClose();
            } else {
              swalError(response?.error || 'Error desconocido');
            }
          });
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            addParams({ search: value.trim() });
        }, 800);
    };

    return (
        <div className='h-full flex flex-col w-full bg-gray-100 p-4'>
            <header className="text-white bg-green-700 py-4 px-3 mb-6 w-full rounded-lg flex justify-center relative">
                <Link onClick={() => navigate(-1)} className='flex items-center gap-1'>
                    <ArrowBackIosNewRoundedIcon className='!size-5 md:!size-6 mt-[0.1rem] absolute left-4' />
                </Link>
                <h1 className="md:text-2xl lg:text-4xl font-bold text-center">Base de Datos</h1>
            </header>
            <main className='flex-1 bg-white shadow rounded-lg p-4 h-full overflow-hidden'>
                <div className='flex flex-col w-full h-full'>
                    <div className='w-full flex flex-col md:flex-row justify-between pb-6 gap-3'>
                        <div className='w-full flex items-center gap-2'>
                            <span className='text-gray-600'>Total de filas: <span id="rowCount" className='font-bold'>{count || 0}</span></span>
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
                            {canCreate && <AddBD />}
                        </div>
                    </div>
                    <CRUDTable
                        key={data.length} // Se fuerza la actualización al cambiar los datos
                        data={data}
                        loading={!data.length}
                        count={count}
                        columns={[
                            { title: "Número", field: "numero" },
                            { title: "Serie", field: "serie" },
                            { title: "Batería", field: "bateria" },
                            { title: "Proveedor", field: "proveedor" },
                            { title: "Estado", field: "state" }
                        ]}
                    />
                </div>
            </main>
        </div>
    );
};

export default ControlBody;