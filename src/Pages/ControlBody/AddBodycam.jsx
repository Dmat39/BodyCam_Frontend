import React, { useState, useEffect } from 'react';
import CustomModal from '../../Components/Modal/CustomModal';
import { Button, IconButton, Tooltip, TextField, Typography, Box, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import CustomSwal, { swalError } from '../../helpers/swalConfig';
import { socket } from '../../Components/Socket/socket';

// Configurar el locale de dayjs a español
dayjs.locale('es');

const AgregarControlBodycam = () => {
  const [open, setOpen] = useState(false);
  const [bodycams, setBodycams] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [jurisdicciones, setJurisdicciones] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = () => {
    socket.emit('getAllBodycams', {}, (response) => {
      if (response.status === 200) {
        setBodycams(response.data.bodycams || []);
      }
    });
    socket.emit('getAllHorarios', {}, (response) => {
      if (response.status === 200) {
        setTurnos(response.data || []);
      }
    });
    socket.emit('getAllJurisdicciones', {}, (response) => {
      if (response.status === 200) {
        setJurisdicciones(response.data || []);
      }
    });
    socket.emit('getAllFunciones', {}, (response) => {
      if (response.status === 200) {
        setFunciones(response.data || []);
      }
    });
    socket.emit('getAllUnidades', {}, (response) => {
      if (response.status === 200) {
        setUnidades(response.data || []);
      }
    });
  };

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      numero: '',
      nombres: '',
      apellidos: '',
      dni: '',
      turno: '',
      jurisdiccion: '',
      funcion: '',
      unidad: '',
      // Inicializamos con dayjs() en lugar de new Date()
      fecha_entrega: dayjs(),
      hora_entrega: dayjs(),
    },
    validate: (values) => {
      const errors = {};
      const camposRequeridos = ['numero', 'nombres', 'apellidos', 'dni', 'turno', 'jurisdiccion', 'funcion', 'unidad'];
      camposRequeridos.forEach((campo) => {
        if (!values[campo]) {
          errors[campo] = 'Campo requerido';
        }
      });
      if (values.dni && !/^\d+$/.test(values.dni)) {
        errors.dni = 'El DNI debe contener solo números';
      }
      return errors;
    },
    onSubmit: (values) => {
      // Formateamos la fecha y hora utilizando dayjs
      const fechaEntrega = values.fecha_entrega.format('YYYY-MM-DD');
      const horaEntrega = values.hora_entrega.format('HH:mm:ss');

      const datosEnvio = {
        ...values,
        fecha_entrega: fechaEntrega,
        hora_entrega: horaEntrega
      };

      socket.emit('createControlBody', datosEnvio, (response) => {
        if (response.status === 200) {
          CustomSwal.fire('Registrado', 'El control de bodycam ha sido registrado correctamente.', 'success');
          // Emitir evento para actualizar la lista
          socket.emit('getAllControlBodys', { page: 1, limit: 20 });
          handleClose();
        } else if (response.status === 400 && response.errores) {
          swalError(response.errores.join(', '));
        } else if (response.status === 404) {
          swalError(response.message || 'Recurso no encontrado');
        } else {
          swalError(response.message || 'Error desconocido');
        }
      });
    },
  });

  return (
    <>
      <Tooltip title="Registrar Control de Bodycam" placement="top" arrow>
        <IconButton aria-label="add" onClick={() => setOpen(true)} color="primary">
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose}>
        <Box className="p-5">
          <Typography variant="h6" fontWeight="bold" className="text-center">
            Registrar Control de Bodycam
          </Typography>
          <form onSubmit={formik.handleSubmit} className="mt-4">
            <Box className="grid grid-cols-2 gap-4">
              {/* Selección de Bodycam */}
              <TextField
                label="Número de Bodycam"
                name="numero"
                value={formik.values.numero}
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(formik.errors.numero)}
                helperText={formik.errors.numero}
              />
              {/* DNI */}
              <TextField
                label="DNI"
                name="dni"
                {...formik.getFieldProps('dni')}
                fullWidth
                error={Boolean(formik.errors.dni)}
                helperText={formik.errors.dni}
              />

              {/* Nombres */}
              <TextField
                label="Nombres"
                name="nombres"
                {...formik.getFieldProps('nombres')}
                fullWidth
                error={Boolean(formik.errors.nombres)}
                helperText={formik.errors.nombres}
              />

              {/* Apellidos */}
              <TextField
                label="Apellidos"
                name="apellidos"
                {...formik.getFieldProps('apellidos')}
                fullWidth
                error={Boolean(formik.errors.apellidos)}
                helperText={formik.errors.apellidos}
              />

              {/* Turno */}
              <TextField
                label="Turno"
                name="turno"
                {...formik.getFieldProps('turno')}
                fullWidth
                error={Boolean(formik.errors.turno)}
                helperText={formik.errors.turno}
              />

              {/* Jurisdicción */}
              <TextField
                label="Jurisdicción"
                name="jurisdiccion"
                {...formik.getFieldProps('jurisdiccion')}
                fullWidth
                error={Boolean(formik.errors.jurisdiccion)}
                helperText={formik.errors.jurisdiccion}
              />

              {/* Función */}
              <TextField
                label="Función"
                name="funcion"
                {...formik.getFieldProps('funcion')}
                fullWidth
                error={Boolean(formik.errors.funcion)}
                helperText={formik.errors.funcion}
              />

              {/* Unidad */}
              <TextField
                label="Unidad"
                name="unidad"
                {...formik.getFieldProps('unidad')}
                fullWidth
                error={Boolean(formik.errors.unidad)}
                helperText={formik.errors.unidad}
              />


              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* Fecha de Entrega */}
                <DatePicker
                  label="Fecha de Entrega"
                  value={formik.values.fecha_entrega}
                  onChange={(newValue) => formik.setFieldValue('fecha_entrega', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />

                {/* Hora de Entrega */}
                <TimePicker
                  label="Hora de Entrega"
                  value={formik.values.hora_entrega}
                  onChange={(newValue) => formik.setFieldValue('hora_entrega', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Box>

            <Box className="flex justify-between pt-5">
              <Button type="button" variant="outlined" color="error" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="success">
                Registrar
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>
    </>
  );
};

export default AgregarControlBodycam;
