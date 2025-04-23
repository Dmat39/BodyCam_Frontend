import { Box, Fade, Modal } from '@mui/material';
import React from 'react';

const CustomModal = ({ children, Open, handleClose, className, onlyCloseFromButton = false }) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 24,
    borderRadius: 2,  // Añadir bordes redondeados
    bgcolor: 'background.paper', // Fondo adecuado
    // No establecer un ancho fijo, dejar que el contenido lo determine
    maxHeight: '90vh', // Limitar altura máxima
    overflow: 'auto', // Permitir scroll si es necesario
    display: 'flex',
    flexDirection: 'column',
    p: 0 // Sin padding en el contenedor principal
  };

  const handleModalClose = (event, reason) => {
    if (onlyCloseFromButton && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return;
    }
    handleClose();
  };

  return (
    <Modal
      keepMounted
      open={Open}
      onClose={handleModalClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
      disableEscapeKeyDown={onlyCloseFromButton}
    >
      <Fade in={Open}>
        <Box sx={style} className={className}>
          {children}
        </Box>
      </Fade>
    </Modal>
  );
};

export default CustomModal;