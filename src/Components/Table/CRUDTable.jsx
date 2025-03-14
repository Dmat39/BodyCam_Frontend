import React, { memo, useEffect, useState } from 'react';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, TableSortLabel, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { SortData } from '../../helpers/GeneralFunctions';
import CustomTablePagination from '../../Pages/Pagination/TablePagination';
import { useLocation } from 'react-router-dom';

// Función auxiliar para obtener el valor de un objeto de búsqueda
const getValueById = (id, lookupObj) => {
    return lookupObj?.[id] || id;
};

// Función para renderizar valores de manera segura
const renderValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        return JSON.stringify(value);
    }

    return value;
};

const CRUDTable = memo(({
    data = [],
    onDelete = null,
    onEdit = null,
    ArrLookup = [],
    loading = false,
    rowOnClick = null,
    count = 100,
    noDataText = 'No hay datos registrados.',
    filter = false,
    pagination = true,

}) => {

    const headers = data.length > 0
        ? Object.keys(data[0]).filter((key) => key !== 'id' && key !== 'notShow')
        : [];

    const location = useLocation();

    const [orderBy, setOrderBy] = useState('index');
    const [orderDirection, setOrderDirection] = useState('asc');
    const [sortedData, setSortedData] = useState([]);
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 20;

    const handleSortRequest = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    useEffect(() => {
        const dataWithIndex = data.map((item, index) => ({
            ...item,
            index: index + 1,
        }));
        setSortedData(SortData(dataWithIndex, orderBy, orderDirection));
    }, [data, orderBy, orderDirection]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchParam = searchParams.get('search');

        if (searchParam && filter) {
            const lowerCaseSearch = searchParam.toLowerCase();
            const filteredData = data.filter((item) =>
                headers.some((key) =>
                    item[key]?.toString().toLowerCase().includes(lowerCaseSearch)
                )
            );
            const filteredDataWithIndex = filteredData.map((item, index) => ({
                ...item,
                index: index + 1,
            }));

            setSortedData(SortData(filteredDataWithIndex, orderBy, orderDirection));
        } else {
            const dataWithIndex = data.map((item, index) => ({
                ...item,
                index: index + 1,
            }));
            setSortedData(SortData(dataWithIndex, orderBy, orderDirection));
        }
    }, [location.search, data, orderBy, orderDirection]);

    return (
        <div className='flex flex-col h-full w-full'>
            {loading ?
                <div className='flex justify-center items-center h-full w-full'>
                    <CircularProgress size={30} thickness={5} />
                </div>
                :
                <>
                    {
                        sortedData && sortedData?.length > 0 ? (
                            <div className="flex flex-col h-full">
                                {/* Table container with scrollable body */}
                                <div className="h-full w-full overflow-hidden">
                                    <div className="overflow-x-auto overflow-y-auto h-full" style={{ width: '100%' }}>
                                        <Table
                                            size="small"
                                            className="text-nowrap"
                                            style={{
                                                tableLayout: 'auto',
                                                minWidth: '100%',
                                            }}
                                        >
                                            <TableHead className='bg-green-600 sticky top-0 z-10'>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{ fontWeight: 600, backgroundColor: '#16a34a' }}
                                                        align={'left'}
                                                    >
                                                        <TableSortLabel
                                                            sx={headerStyles}
                                                            align={'left'}
                                                            active={orderBy === 'index'}
                                                            direction={orderBy === 'index' ? orderDirection : 'asc'}
                                                            onClick={() => handleSortRequest('index')}
                                                        >
                                                            #
                                                        </TableSortLabel>
                                                    </TableCell>
                                                    {headers.map((header) => (
                                                        <TableCell
                                                            key={header}
                                                            sx={{ fontWeight: 600, backgroundColor: '#16a34a' }}
                                                            align={'left'}
                                                        >
                                                            <TableSortLabel
                                                                active={orderBy === header}
                                                                direction={orderBy === header ? orderDirection : 'asc'}
                                                                onClick={() => handleSortRequest(header)}
                                                                sx={headerStyles}
                                                            >
                                                                {header.charAt(0).toUpperCase() + header.slice(1)}
                                                            </TableSortLabel>
                                                        </TableCell>
                                                    ))}
                                                    {(typeof onEdit === 'function' || typeof onDelete === 'function') && (
                                                        <TableCell sx={{ fontWeight: 600, backgroundColor: '#16a34a' }} align={'left'}>
                                                            <span style={{ color: 'white' }}>Acciones</span>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sortedData.map((row) => (
                                                    <TableRow
                                                        onClick={(e) => typeof rowOnClick === 'function' && rowOnClick(e, row)}
                                                        className={`${typeof rowOnClick === 'function' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                                        key={row.id || row.dni}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        <TableCell>{(row.index + (page - 1) * limit)}</TableCell>
                                                        {headers.map((header) => {
                                                            const lookup = ArrLookup.find(item => item.key === header);
                                                            const value = lookup ? getValueById(row[header], lookup.obj) : row[header];

                                                            return (
                                                                <TableCell
                                                                    key={header}
                                                                    align={'left'}
                                                                >
                                                                    {Array.isArray(value) ? (
                                                                        value.map((item, index) => (
                                                                            <Tooltip
                                                                                title={item.label}
                                                                                key={index}
                                                                                arrow
                                                                                placement='top'
                                                                                onClick={item.action}
                                                                                className='cursor-pointer text-gray-500'
                                                                            >
                                                                                {item.icon}
                                                                            </Tooltip>
                                                                        ))
                                                                    ) : (
                                                                        typeof value === 'object' && value !== null ?
                                                                            JSON.stringify(value) :
                                                                            value
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        })}
                                                        {(typeof onEdit === 'function' || typeof onDelete === 'function') && (
                                                            <TableCell align="right">
                                                                {typeof onEdit === 'function' && (
                                                                    <IconButton aria-label="edit" size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onEdit(row);
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                                {typeof onDelete === 'function' && (
                                                                    <IconButton aria-label="delete" size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onDelete(row);
                                                                        }}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                {/* Pagination is now rendered outside the scrollable area */}
                                {pagination && (
                                    <div className='flex-shrink-0 mt-2 border-t'>
                                        <CustomTablePagination count={count} />
                                    </div>
                                )}
                            </div>
                        ) :
                            (
                                <div className='text-center text-sm mt-6 w-full'>
                                    {noDataText}
                                </div>
                            )
                    }
                </>
            }
        </div>
    )
})

export default CRUDTable

const headerStyles = {
    color: 'white',
    '&.Mui-active': {
        color: 'white',
        '& svg': {
            color: 'white !important',
        }
    },
    '&:hover': {
        color: 'white',
        '& svg': {
            color: 'white !important',
        }
    },
    '&:focus': {
        color: 'white',
        '& svg': {
            color: 'white !important',
        }
    }
}