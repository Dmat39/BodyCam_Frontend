import React, { useState } from 'react';
import CustomModal from '../../Components/Modal/CustomModal';
import { Button, IconButton, Tooltip, TextField, Typography, Box } from '@mui/material';
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
      user: 'SG-',  // Valor por defecto con el prefijo
      series: '',
      battery: '',
      model: '',
      item: '',
    },
    validate: (values) => {
      const errors = {};
      Object.keys(values).forEach((key) => {
        if (!values[key]) errors[key] = 'Campo requerido';
      });
      return errors;
    },
    onSubmit: (values) => {
      socket.emit('addBD', values, (response) => {
        if (response.status === 'success') {
          CustomSwal.fire('Agregado', 'El BD ha sido agregado correctamente.', 'success');
          handleClose();
        } else {
          swalError(response.error);
        }
      });
    },
  });

  return (
    <>
      <Tooltip title="Añadir BD" placement="top" arrow>
        <IconButton aria-label="add" onClick={() => setOpen(true)} color="primary">
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose}>
        <Box className="p-5">
          <Typography variant="h6" fontWeight="bold" className="text-center">
            Añadir BD
          </Typography>

          <form onSubmit={formik.handleSubmit} className="mt-4">
            <Box className="grid grid-cols-2 gap-4">
              <TextField
                label="Usuario"
                name="user"
                value={formik.values.user}
                onChange={(e) => {
                  // Evitar que se borre el prefijo "SG -"
                  const inputValue = e.target.value;
                  if (inputValue.startsWith('SG-')) {
                    formik.setFieldValue('user', inputValue);
                  }
                }}
                fullWidth
              />
              <TextField label="Serie" name="series" {...formik.getFieldProps('series')} fullWidth />
              <TextField label="Batería" name="battery" {...formik.getFieldProps('battery')} fullWidth />
              <TextField label="Modelo" name="model" {...formik.getFieldProps('model')} fullWidth />
              <TextField label="Ítem" name="item" {...formik.getFieldProps('item')} fullWidth />
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
