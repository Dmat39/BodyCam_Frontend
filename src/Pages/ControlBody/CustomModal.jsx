// MissingFieldsModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const MissingFieldsModal = ({ open, onClose, rowData, onSave }) => {
  const [fecha_devolucion, setFechaDevolucion] = useState(rowData.fecha_devolucion || '');
  const [hora_devolucion, setHoraDevolucion] = useState(rowData.hora_devolucion || '');
  const [detalles, setDetalles] = useState(rowData.detalles || '');
  const [status, setStatus] = useState(rowData.status || 'EN CAMPO'); 
  // ^ Valor por defecto (ajusta a tu gusto)

  const handleSave = () => {
    // Retornar todos los campos, incluido status
    onSave({ fecha_devolucion, hora_devolucion, detalles, status });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Actualizar Bodycam</DialogTitle>
      <DialogContent>
        <TextField
          label="Fecha de Devolución"
          type="date"
          value={fecha_devolucion}
          onChange={(e) => setFechaDevolucion(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Hora de Devolución"
          type="time"
          value={hora_devolucion}
          onChange={(e) => setHoraDevolucion(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Detalles"
          value={detalles}
          onChange={(e) => setDetalles(e.target.value)}
          fullWidth
          margin="dense"
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="EN CAMPO">EN CAMPO</MenuItem>
            <MenuItem value="EN CECOM">EN CECOM</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MissingFieldsModal;
