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
  CircularProgress,
  Typography,
  Box
} from '@mui/material';

const BodycamUpdateModal = ({ open, onClose, rowData, onSave, loading }) => {
  const [detalles, setDetalles] = useState('');
  const [status, setStatus] = useState('EN CAMPO');
  const [formModified, setFormModified] = useState(false);

  // Update states when rowData changes or when modal opens
  useEffect(() => {
    if (rowData && open) {
      setDetalles(rowData.detalles || 'NINGUNO');
      setStatus('EN CECOM'); 
      setFormModified(false);
    }
  }, [rowData, open]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormModified(true);
  };

  const handleSave = () => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
  
    onSave({
      id: rowData.id,
      fecha_devolucion: formattedDate,
      hora_devolucion: formattedTime,
      detalles,
      status: "EN CECOM" // Forzar siempre el valor "EN CECOM"
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
      <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', padding: 2 }}>
        <Typography variant="h6" component="div">
          Actualizar Bodycam
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {rowData?.bodyCams}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: 3 }}>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Fecha y hora actuales se registrarán automáticamente
          </Typography>
        </Box>
        
        <TextField
          label="Detalles"
          value={detalles}
          onChange={handleInputChange(setDetalles)}
          fullWidth
          margin="dense"
          multiline
          rows={3}
          sx={{ marginBottom: 2 }}
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
      <DialogActions sx={{ padding: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          CANCELAR
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'GUARDAR'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BodycamUpdateModal;