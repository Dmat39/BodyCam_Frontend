import React, { useState } from 'react';
import CustomModal from '../../Components/Modal/CustomModal';
import { Button, IconButton, Tooltip, TextField, Typography, Box, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import CustomSwal, { swalError } from '../../helpers/swalConfig';
import { socket } from '../../Components/Socket/socket';

const Add_BD = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      numero: 'SG',       // Valor inicial con "SG"
      serie: '',
      nro_bateria: '',
      id_proveedor: 'b8f0770c-b490-4a5e-b4bf-e608b769cfcf',
      state: true,
    },
    validate: (values) => {
      const errors = {};
      // Marca como requerido todo excepto 'state'
      Object.keys(values).forEach((key) => {
        if (!values[key] && key !== 'state') {
          errors[key] = 'Campo requerido';
        }
      });
      return errors;
    },
    onSubmit: (values) => {
      // Emite el evento "createBody", tal como está definido en tu backend
      socket.emit('createBody', values, (response) => {
        console.log('Respuesta del servidor (createBody):', response);
        if (response.status === 200) {
          CustomSwal.fire('Agregado', 'La bodycam ha sido agregada correctamente.', 'success');
          handleClose();
        }
        else if (response.status === 400 && response.errores) {
          // Muestra errores de validación
          swalError(response.errores.join(', '));
        }
        else {
          // Error 500 o cualquier otro
          swalError(response.message || 'Error desconocido');
        }
      });
    },
  });

  return (
    <>
      <Tooltip title="Añadir BodyCam" placement="top" arrow>
        <IconButton aria-label="add" onClick={() => setOpen(true)} color="primary">
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose}>
        <Box className="p-5">
          <Typography variant="h6" fontWeight="bold" className="text-center">
            Añadir BodyCam
          </Typography>

          <form onSubmit={formik.handleSubmit} className="mt-4">
            <Box className="grid grid-cols-2 gap-4">
              {/* Campo "numero" */}
              <TextField
                label="Número"
                name="numero"
                {...formik.getFieldProps('numero')}
                // Deja que el usuario escriba, asumiendo que si
                // no empieza con SG, tu backend lo rechazará.
                fullWidth
                helperText="Debe comenzar con SG seguido de dígitos"
                error={Boolean(formik.errors.numero)}
                FormHelperTextProps={{ className: 'text-red-500' }}
              />

              {/* Campo "serie" */}
              <TextField
                label="Serie"
                name="serie"
                {...formik.getFieldProps('serie')}
                fullWidth
                error={Boolean(formik.errors.serie)}
                helperText={formik.errors.serie}
              />

              {/* Campo "nro_bateria" */}
              <TextField
                label="Nro. Batería"
                name="nro_bateria"
                {...formik.getFieldProps('nro_bateria')}
                fullWidth
                error={Boolean(formik.errors.nro_bateria)}
                helperText={formik.errors.nro_bateria}
              />

              {/* Campo "id_proveedor" */}
              <TextField
                label="ID Proveedor"
                name="id_proveedor"
                {...formik.getFieldProps('id_proveedor')}
                fullWidth
                error={Boolean(formik.errors.id_proveedor)}
                helperText={formik.errors.id_proveedor}
              />

              {/* Campo "state" */}
              <TextField
                select
                label="Estado"
                name="state"
                value={formik.values.state}
                onChange={(e) => formik.setFieldValue('state', e.target.value)}
                fullWidth
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </TextField>
            </Box>

            <Box className="flex justify-between pt-5">
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleClose}
              >
                Cerrar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
              >
                Agregar
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>
    </>
  );
};

export default Add_BD;
