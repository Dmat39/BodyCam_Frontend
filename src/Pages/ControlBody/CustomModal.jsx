import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress 
} from '@mui/material';

const MissingFieldsModal = ({ open, onClose, rowData, onSave, loading }) => {
  const [fecha_devolucion, setFechaDevolucion] = useState('');
  const [hora_devolucion, setHoraDevolucion] = useState('');
  const [detalles, setDetalles] = useState('');
  const [status, setStatus] = useState('EN CAMPO');
  const [formModified, setFormModified] = useState(false);
  
  // Actualizar estados cuando rowData cambia o cuando se abre el modal
  useEffect(() => {
    if (rowData && open) {
      setFechaDevolucion(rowData.fecha_devolucion || '');
      setHoraDevolucion(rowData.hora_devolucion || '');
      setDetalles(rowData.detalles || '');
      setStatus(rowData.status || 'EN CAMPO');
      setFormModified(false);
    }
  }, [rowData, open]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormModified(true);
  };

  const handleSave = () => {
    // Retornar todos los campos, incluido status
    onSave({
      numero: rowData.bodyCams, // Usar el número de bodycam para identificación
      fecha_devolucion,
      hora_devolucion,
      detalles,
      status
    });
  };

  const handleClose = () => {
    if (formModified) {
      if (window.confirm('¿Estás seguro de cerrar sin guardar los cambios?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Actualizar Bodycam {rowData?.bodyCams}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Fecha de Devolución"
          type="date"
          value={fecha_devolucion}
          onChange={handleInputChange(setFechaDevolucion)}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Hora de Devolución"
          type="time"
          value={hora_devolucion}
          onChange={handleInputChange(setHoraDevolucion)}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Detalles"
          value={detalles}
          onChange={handleInputChange(setDetalles)}
          fullWidth
          margin="dense"
          multiline
          rows={3}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            value={status}
            label="Status"
            onChange={handleInputChange(setStatus)}
          >
            <MenuItem value="EN CAMPO">EN CAMPO</MenuItem>
            <MenuItem value="EN CECOM">EN CECOM</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MissingFieldsModal;