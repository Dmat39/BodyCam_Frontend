import React, { useState, useEffect } from 'react';
import CustomModal from '../../Components/Modal/CustomModal';
import {
  Button,
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
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

  // Verificar estado de conexión de socket
  useEffect(() => {
    // Agregar event listeners para socket
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

    // Verificar conexión actual
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
      // Llamada al evento "getProveedores" en el servidor
      socket.emit('getProveedores', {}, (response) => {
        console.log('Respuesta getProveedores:', response);
        if (response && response.status === 200) {
          // Si hay éxito, guardamos la lista en el estado
          setProveedores(response.data || []);
          console.log('Proveedores cargados:', response.data?.length || 0);
        } else {
          // Si hay error, lo mostramos en consola (o con swal)
          console.error('Error al obtener proveedores:', response?.message);
          swalError('Error al cargar proveedores: ' + (response?.message || 'Error desconocido'));
        }
      });
    }
  }, [socketConnected, open]); // Agregamos "open" para que se recargue al abrir el modal

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const formik = useFormik({
    initialValues: {
      numero: 'SG',       // Valor inicial con "SG"
      serie: '',
      nro_bateria: '',
      id_proveedor: '',   // Ahora inicia vacío, para forzar selección
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

      // Validación adicional para "numero" - debe comenzar con SG
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

      // Crear un nuevo objeto que incluya todos los valores del formulario más la página actual
      const dataToSend = {
        ...values,
        currentPage: currentPage  // Añadimos la página actual
      };

      // Datos a enviar (agregamos logging para depuración)
      console.log('Enviando datos:', dataToSend);

      // Emite el evento "createBody" con los datos que incluyen currentPage
      socket.emit('createBody', dataToSend, (response) => {
        setIsLoading(false);
        console.log('Respuesta del servidor (createBody):', response);

        if (response && response.status === 200) {
          // Cerramos el modal primero
          setOpen(false);

          // Mostrar la confirmación después de cerrar el modal
          setTimeout(() => {
            CustomSwal.fire({
              title: 'Agregado',
              text: 'La bodycam ha sido agregada correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });

            // Limpiar el formulario después de mostrar la alerta
            formik.resetForm();

            // Actualizamos el listado manteniendo la página actual
            try {
              socket.emit('getAllBodys', { page: currentPage, limit: 20 });
            } catch (err) {
              console.error('Error al actualizar listado:', err);
            }
          }, 100);
        }
        else if (response && response.status === 400 && response.errores) {
          // Muestra errores de validación
          swalError(response.errores.join(', '));
        }
        else {
          // Error 500 o cualquier otro
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
        <Box className="p-5">
          <Typography variant="h6" fontWeight="bold" className="text-center">
            Añadir BodyCam
          </Typography>

          {!socketConnected && (
            <Typography color="error" className="text-center mt-2">
              Sin conexión al servidor. Por favor, recargue la página.
            </Typography>
          )}

          <form onSubmit={formik.handleSubmit} className="mt-4">
            <Box className="grid grid-cols-2 gap-4">
              {/* Campo "numero" */}
              <TextField
                label="Número"
                name="numero"
                value={formik.values.numero}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                helperText={formik.touched.numero && formik.errors.numero ?
                  formik.errors.numero : "Debe comenzar con SG seguido de dígitos"}
                error={Boolean(formik.errors.numero && formik.touched.numero)}
              />

              {/* Campo "serie" */}
              <TextField
                label="Serie"
                name="serie"
                value={formik.values.serie}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={Boolean(formik.errors.serie && formik.touched.serie)}
                helperText={formik.touched.serie && formik.errors.serie}
              />

              {/* Campo "nro_bateria" */}
              <TextField
                label="Nro. Batería"
                name="nro_bateria"
                value={formik.values.nro_bateria}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={Boolean(formik.errors.nro_bateria && formik.touched.nro_bateria)}
                helperText={formik.touched.nro_bateria && formik.errors.nro_bateria}
              />

              {/* Campo "id_proveedor" */}
              <FormControl
                fullWidth
                error={Boolean(formik.errors.id_proveedor && formik.touched.id_proveedor)}
              >
                <InputLabel id="proveedor-label">Proveedor</InputLabel>
                <Select
                  labelId="proveedor-label"
                  id="id_proveedor"
                  name="id_proveedor"
                  value={formik.values.id_proveedor}
                  onChange={formik.handleChange}
                  label="Proveedor"
                  disabled={proveedores.length === 0}
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

              {/* Campo "state" */}
              <FormControl fullWidth>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  id="state"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  label="Estado"
                >
                  <MenuItem value={true}>Activo</MenuItem>
                  <MenuItem value={false}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className="flex justify-between pt-5">
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={isLoading || !socketConnected}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Agregar"}
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>
    </>
  );
};

export default Add_BD;