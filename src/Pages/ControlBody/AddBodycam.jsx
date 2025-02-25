import React, { useState } from 'react';
import CustomModal from '../../Components/Modal/CustomModal';
import { Button, IconButton, Tooltip, TextField } from '@mui/material';
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
      number: '',
      responsible: '',
      unit: '',
      jurisdiction: '',
    },
    validate: (values) => {
      const errors = {};
      if (!values.number) errors.number = 'Campo requerido';
      if (!values.responsible) errors.responsible = 'Campo requerido';
      if (!values.unit) errors.unit = 'Campo requerido';
      if (!values.jurisdiction) errors.jurisdiction = 'Campo requerido';
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
        <IconButton aria-label="add" onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose}>
        <div className="flex items-center mb-2">
          <h1 className="text-lg font-bold">Añadir Bodycam</h1>
        </div>
        <form onSubmit={formik.handleSubmit} className="mt-4">
          <div className="flex flex-col gap-3">
            <TextField
              label="Número de Bodycam"
              name="number"
              value={formik.values.number}
              onChange={formik.handleChange}
              error={formik.touched.number && Boolean(formik.errors.number)}
              helperText={formik.touched.number && formik.errors.number}
              fullWidth
            />
            <TextField
              label="Responsable"
              name="responsible"
              value={formik.values.responsible}
              onChange={formik.handleChange}
              error={formik.touched.responsible && Boolean(formik.errors.responsible)}
              helperText={formik.touched.responsible && formik.errors.responsible}
              fullWidth
            />
            <TextField
              label="Unidad"
              name="unit"
              value={formik.values.unit}
              onChange={formik.handleChange}
              error={formik.touched.unit && Boolean(formik.errors.unit)}
              helperText={formik.touched.unit && formik.errors.unit}
              fullWidth
            />
            <TextField
              label="Jurisdicción"
              name="jurisdiction"
              value={formik.values.jurisdiction}
              onChange={formik.handleChange}
              error={formik.touched.jurisdiction && Boolean(formik.errors.jurisdiction)}
              helperText={formik.touched.jurisdiction && formik.errors.jurisdiction}
              fullWidth
            />
          </div>
          <div className="flex justify-between pt-5">
            <Button type="button" variant="contained" color="inherit" onClick={handleClose}>Cerrar</Button>
            <Button type="submit" variant="contained" color="success">Agregar</Button>
          </div>
        </form>
      </CustomModal>
    </>
  );
};

export default AddBodycam;
