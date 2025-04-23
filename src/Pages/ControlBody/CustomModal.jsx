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
  const [status, setStatus] = useState('EN CECOM');
  const [numeroUnidad, setNumeroUnidad] = useState('');
  const [formModified, setFormModified] = useState(true);

  // Update states when rowData changes or when modal opens
  useEffect(() => {
    if (rowData && open) {
      setDetalles(rowData.detalles || 'NINGUNO');
      // Establecer el status inicial a EN CECOM cuando se abre el modal
      setStatus('EN CECOM');
      setNumeroUnidad(rowData.Unidad || '');
      // Garantizar que el botón de guardar esté activo desde el inicio
      setFormModified(true);
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
  
    const payload = {
      id: rowData.id,
      fecha_devolucion: formattedDate,
      hora_devolucion: formattedTime,
      detalles,
      status
    };

    // Only include numero_unidad if it was changed
    if (numeroUnidad && numeroUnidad.trim() !== '') {
      payload.numero_unidad = numeroUnidad.trim();
    }

    onSave(payload);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        // Prevents closing the dialog when clicking outside or pressing escape
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        handleClose();
      }} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={true}
      PaperProps={{
        sx: {
          borderRadius: 2, // Aquí está el cambio principal - borde redondeado
          overflow: 'hidden',
          maxHeight: '85vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: '#1b5e20', // Verde oscuro como en el otro modal
          borderBottom: '1px solid #e0e0e0', 
          padding: 2,
          color: '#fff', // Texto en blanco
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold" textAlign="center">
          Actualizar Bodycam
        </Typography>
        <Typography variant="subtitle1" color="#fff" textAlign="center">
          {rowData?.bodyCams}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ padding: 3, overflow: 'auto' }}>
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
          size="small"
          InputProps={{
            style: { fontSize: "0.875rem" },
          }}
          InputLabelProps={{
            style: { fontSize: "0.875rem" },
          }}
        />
        
        <FormControl 
          fullWidth 
          margin="dense" 
          sx={{ marginBottom: 2 }}
          size="small"
        >
          <InputLabel id="status-label" sx={{ fontSize: "0.875rem" }}>Status</InputLabel>
          <Select
            labelId="status-label"
            value={status}
            label="Status"
            onChange={handleInputChange(setStatus)}
            sx={{ fontSize: "0.875rem" }}
          >
            <MenuItem value="EN CAMPO">EN CAMPO</MenuItem>
            <MenuItem value="EN CECOM">EN CECOM</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Número de Unidad"
          value={numeroUnidad}
          onChange={handleInputChange(setNumeroUnidad)}
          fullWidth
          margin="dense"
          helperText="Opcional: Actualizar el número de unidad"
          size="small"
          InputProps={{
            style: { fontSize: "0.875rem" },
          }}
          InputLabelProps={{
            style: { fontSize: "0.875rem" },
          }}
        />
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          padding: 3, 
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f9f9f9', // Fondo gris claro como en el otro modal
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          color="error"
          sx={{
            textTransform: "none",
            borderRadius: 1,
            px: 3,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: "bold"
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="success" // Usar success en lugar de primary
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: 1,
            px: 3,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: "bold",
            backgroundColor: "#2e7d32", // Verde específico
            "&:hover": {
              backgroundColor: "#1b5e20", // Verde oscuro al hover
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BodycamUpdateModal;