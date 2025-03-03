import React, { useState } from 'react';
import CustomModal from '../../Components/Modal/CustomModal';
import { Button, IconButton, Tooltip, TextField, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import CustomSwal, { swalError } from '../../helpers/swalConfig';
import { socket } from '../../Components/Socket/socket';

const AddBodycam = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      user: '',
      bodycamSeries: '',
      batterySeries: '',
      deliveryDate: '',
      deliveryTime: '',
      responsible: '',
      shift: '',
      jurisdiction: '',
      unit: '',
      returnDate: '',
      returnTime: '',
    },
    validate: (values) => {
      const errors = {};
      Object.keys(values).forEach((key) => {
        if (!values[key]) errors[key] = 'Campo requerido';
      });
      return errors;
    },
    onSubmit: (values) => {
      socket.emit('addBodycam', values, (response) => {
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
      <Tooltip title="Añadir Bodycam" placement="top" arrow>
        <IconButton aria-label="add" onClick={() => setOpen(true)} color="primary">
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose}>
        <Box className="p-5">
          <Typography variant="h6" fontWeight="bold" className="text-center">
            Añadir Bodycam
          </Typography>

          <form onSubmit={formik.handleSubmit} className="mt-4">
            <Box className="grid grid-cols-2 gap-4">
              <TextField label="Usuario" name="user" {...formik.getFieldProps('user')} fullWidth />
              <TextField label="Serie Bodycam" name="bodycamSeries" {...formik.getFieldProps('bodycamSeries')} fullWidth />
              <TextField label="Serie Batería" name="batterySeries" {...formik.getFieldProps('batterySeries')} fullWidth />
              <TextField label="Fecha Entrega" name="deliveryDate" type="date" {...formik.getFieldProps('deliveryDate')} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Hora Entrega" name="deliveryTime" type="time" {...formik.getFieldProps('deliveryTime')} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Responsable" name="responsible" {...formik.getFieldProps('responsible')} fullWidth />
              <TextField label="Turno" name="shift" {...formik.getFieldProps('shift')} fullWidth />
              <TextField label="Jurisdicción" name="jurisdiction" {...formik.getFieldProps('jurisdiction')} fullWidth />
              <TextField label="Unidad" name="unit" {...formik.getFieldProps('unit')} fullWidth />
              <TextField label="Fecha Devolución" name="returnDate" type="date" {...formik.getFieldProps('returnDate')} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Hora Devolución" name="returnTime" type="time" {...formik.getFieldProps('returnTime')} fullWidth InputLabelProps={{ shrink: true }} />
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

export default AddBodycam;
