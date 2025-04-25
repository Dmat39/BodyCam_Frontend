import React, { useState, useEffect } from 'react';
import CustomModal from '../../Components/Modal/CustomModal';
import {
  Button,
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Box,
  Grid,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import CustomSwal, { swalError } from '../../helpers/swalConfig';
import { socket } from '../../Components/Socket/socket';

const Add_BD = () => {
  const [open, setOpen] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [hyteraProveedor, setHyteraProveedor] = useState(null);

  // Verificar estado de conexión de socket
  useEffect(() => {
    const onConnect = () => {
      console.log('Socket conectado');
      setSocketConnected(true);
    };

    const onDisconnect = () => {
      console.log('Socket desconectado');
      setSocketConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setSocketConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Al montar el componente, pedimos la lista de proveedores al backend
  useEffect(() => {
    if (socketConnected) {
      console.log('Solicitando proveedores...');
      socket.emit('getProveedores', {}, (response) => {
        console.log('Respuesta getProveedores:', response);
        if (response && response.status === 200) {
          setProveedores(response.data || []);
          
          // Buscar el proveedor HYTERA y establecerlo por defecto
          const hytera = response.data?.find(prov => 
            prov.marca?.toUpperCase() === 'HYTERA'
          );
          
          if (hytera) {
            setHyteraProveedor(hytera.id);
            // Actualizar el formik solo si ya está abierto el modal
            if (open) {
              formik.setFieldValue('id_proveedor', hytera.id);
            }
          }
          
          console.log('Proveedores cargados:', response.data?.length || 0);
          console.log('HYTERA encontrado:', hytera ? 'Sí' : 'No');
        } else {
          console.error('Error al obtener proveedores:', response?.message);
          swalError('Error al cargar proveedores: ' + (response?.message || 'Error desconocido'));
        }
      });
    }
  }, [socketConnected, open]);

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
    // Si ya tenemos el ID de HYTERA, lo establecemos al abrir el modal
    if (hyteraProveedor) {
      setTimeout(() => {
        formik.setFieldValue('id_proveedor', hyteraProveedor);
      }, 100);
    }
  };

  const formik = useFormik({
    initialValues: {
      numero: 'SG',
      serie: '',
      nro_bateria: '',
      id_proveedor: '',
      state: true,
    },
    validate: (values) => {
      const errors = {};
      const camposRequeridos = ['numero', 'serie', 'nro_bateria', 'id_proveedor'];

      camposRequeridos.forEach((campo) => {
        if (!values[campo]) {
          errors[campo] = 'Campo requerido';
        }
      });

      if (values.numero && !values.numero.startsWith('SG')) {
        errors.numero = 'Debe comenzar con SG';
      }

      return errors;
    },
    onSubmit: (values) => {
      if (!socketConnected) {
        swalError('No hay conexión con el servidor. Intente nuevamente.');
        return;
      }

      setIsLoading(true);
      const dataToSend = {
        ...values,
        currentPage: currentPage
      };

      console.log('Enviando datos:', dataToSend);

      socket.emit('createBody', dataToSend, (response) => {
        setIsLoading(false);
        console.log('Respuesta del servidor (createBody):', response);

        if (response && response.status === 200) {
          setOpen(false);

          setTimeout(() => {
            CustomSwal.fire({
              title: 'Agregado',
              text: 'La bodycam ha sido agregada correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });

            formik.resetForm();

            try {
              socket.emit('getAllBodys', { page: currentPage, limit: 20 });
            } catch (err) {
              console.error('Error al actualizar listado:', err);
            }
          }, 100);
        }
        else if (response && response.status === 400 && response.errores) {
          swalError(response.errores.join(', '));
        }
        else {
          swalError(response?.message || 'Error desconocido al agregar bodycam');
        }
      });
    },
  });

  return (
    <>
      <Tooltip title="Añadir BodyCam" placement="top" arrow>
        <IconButton aria-label="add" onClick={handleOpen} color="primary" disabled={!socketConnected}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose}>
        {/* Contenedor principal más compacto */}
        <Box sx={{ 
          width: '100%', 
          maxWidth: '500px', 
          margin: '0 auto',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Cabecera verde */}
          <Box sx={{ 
            backgroundColor: '#28a745', 
            padding: '10px 16px',
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              Añadir BodyCam
            </Typography>
          </Box>

          {/* Mensaje de error cuando no hay conexión */}
          {!socketConnected && (
            <Typography 
              color="error" 
              sx={{ 
                textAlign: 'center', 
                padding: '8px',
                marginTop: '8px'
              }}
            >
              Sin conexión al servidor. Por favor, recargue la página.
            </Typography>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ padding: '16px 20px' }}>
              {/* Grid con 2 columnas para los campos */}
              <Grid container spacing={2}>
                {/* Primera fila: Número y Serie */}
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                    Número
                  </Typography>
                  <TextField
                    name="numero"
                    value={formik.values.numero}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={Boolean(formik.errors.numero && formik.touched.numero)}
                    placeholder="SG"
                  />
                  {formik.touched.numero && formik.errors.numero ? (
                    <FormHelperText error>{formik.errors.numero}</FormHelperText>
                  ) : (
                    <FormHelperText>Debe comenzar con SG</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                    Serie
                  </Typography>
                  <TextField
                    name="serie"
                    value={formik.values.serie}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={Boolean(formik.errors.serie && formik.touched.serie)}
                  />
                  {formik.touched.serie && formik.errors.serie && (
                    <FormHelperText error>{formik.errors.serie}</FormHelperText>
                  )}
                </Grid>

                {/* Segunda fila: Nro. Batería y Estado */}
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                    Nro. Batería
                  </Typography>
                  <TextField
                    name="nro_bateria"
                    value={formik.values.nro_bateria}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={Boolean(formik.errors.nro_bateria && formik.touched.nro_bateria)}
                  />
                  {formik.touched.nro_bateria && formik.errors.nro_bateria && (
                    <FormHelperText error>{formik.errors.nro_bateria}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                    Estado
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value={true}>Activo</MenuItem>
                      <MenuItem value={false}>Inactivo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Tercera fila: Proveedor (ocupa todo el ancho) */}
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                    Proveedor
                  </Typography>
                  <FormControl
                    fullWidth
                    error={Boolean(formik.errors.id_proveedor && formik.touched.id_proveedor)}
                    size="small"
                  >
                    <Select
                      name="id_proveedor"
                      value={formik.values.id_proveedor}
                      onChange={formik.handleChange}
                      displayEmpty
                      disabled={proveedores.length === 0}
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em>Seleccione un proveedor</em>;
                        }
                        
                        const selectedProvider = proveedores.find(p => p.id === selected);
                        return selectedProvider 
                          ? `${selectedProvider.marca} - ${selectedProvider.modelo}`
                          : 'HYTERA';
                      }}
                    >
                      <MenuItem value="">
                        <em>Seleccione un proveedor</em>
                      </MenuItem>
                      {proveedores.map((prov) => (
                        <MenuItem key={prov.id} value={prov.id}>
                          {prov.marca} - {prov.modelo}
                        </MenuItem>
                      ))}
                    </Select>
                    {proveedores.length === 0 ? (
                      <FormHelperText>Cargando proveedores...</FormHelperText>
                    ) : (
                      formik.touched.id_proveedor && formik.errors.id_proveedor && (
                        <FormHelperText>{formik.errors.id_proveedor}</FormHelperText>
                      )
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 20px',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#f9f9f9'
            }}>
              <Button
                type="button"
                variant="contained"
                sx={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#c82333'
                  }
                }}
                onClick={handleClose}
              >
                CANCELAR
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ 
                  backgroundColor: '#28a745', 
                  color: 'white',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#218838'
                  }
                }}
                disabled={isLoading || !socketConnected}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "AGREGAR"}
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>
    </>
  );
};

export default Add_BD;