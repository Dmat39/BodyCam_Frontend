import { Box, Fade, Modal } from '@mui/material';
import React from 'react'

const CustomModal = ({ children, Open, handleClose, className }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };
    return (
        <Modal
            keepMounted
            open={Open}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"

        >
            <Fade in={Open} >
                <Box sx={style} className={`w-[95%] max-w-2xl rounded-md text-black ${className}`}>
                    {children}
                </Box>
            </Fade>
        </Modal>
    )
}

export default CustomModal