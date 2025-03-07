import React from 'react'
import { useLocation } from 'react-router-dom';
import UseUrlParamsManager from '../hooks/UseUrlParamsManager';
import { TablePagination } from '@mui/material';

const CustomTablePagination = ({count}) => {
    const { addParams } = UseUrlParamsManager();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get('page')) || 1;
    const limit = parseInt(queryParams.get('limit')) || 20;

    return (
        <TablePagination
            className='select-none'
            component="div"
            count={count || 1000}
            page={page - 1}
            onPageChange={(event, newPage) => {
                localStorage.setItem('scrollPosition', 0);
                addParams({ page: newPage + 1, limit });
            }}
            rowsPerPage={limit}
            onRowsPerPageChange={(event) => {
                const newLimit = parseInt(event.target.value);
                addParams({ page: 1, limit: newLimit });
            }}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            rowsPerPageOptions={[20, 50, 100]}
        />
    )
}

export default CustomTablePagination