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
      numero: 'SG-',  // Prefijo obligatorio
      serie: '',
      nro_bateria: '',
      id_proveedor: '',
      state: true,
    },
    validate: (values) => {
      const errors = {};
      Object.keys(values).forEach((key) => {
        if (!values[key] && key !== 'state') errors[key] = 'Campo requerido';
      });
      return errors;
    },
    onSubmit: (values) => {
      socket.emit('addBodyCam', values, (response) => {
        if (response.status === 'success') {
          CustomSwal.fire('Agregado', 'La bodycam ha sido agregada correctamente.', 'success');
          handleClose();
        } else {
          swalError(response.error);
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
              <TextField
                label="Número"
                name="numero"
                value={formik.values.numero}
                onChange={(e) => {
                  if (e.target.value.startsWith('SG-')) {
                    formik.setFieldValue('numero', e.target.value);
                  }
                }}
                fullWidth
              />
              <TextField label="Serie" name="serie" {...formik.getFieldProps('serie')} fullWidth />
              <TextField label="Nro. Batería" name="nro_bateria" {...formik.getFieldProps('nro_bateria')} fullWidth />
              <TextField
                label="ID Proveedor"
                name="id_proveedor"
                {...formik.getFieldProps('id_proveedor')}
                fullWidth
              />
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
              <Button type="button" variant="outlined" color="error" onClick={handleClose}>
                Cerrar
              </Button>
              <Button type="submit" variant="contained" color="success">
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