import { Checkbox, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TablaPermisos = ({ formik, permisosAgrupados }) => {
    const [ids, setIds] = useState({});

    const handlePermissionChange = (permisoKey) => {
        const permisos = formik.values.permisos;

        // Si el permiso que se cambia es el 1, dejamos solo el 1 en el arreglo
        if (permisoKey === 1) {
            // Si ya está seleccionado, lo quitamos y eliminamos los demás permisos
            formik.setFieldValue('permisos', permisos.includes(1) ? [] : [1]);

        } else {
            // Si no es el 1, sigue funcionando normalmente
            formik.setFieldValue(
                'permisos',
                permisos.includes(permisoKey)
                    ? permisos.filter((permiso) => permiso !== permisoKey)
                    : [...permisos, permisoKey]
            );
        }
    };

    useEffect(() => {
        // Genera y almacena un ID único para cada combinación de módulo y acción
        const initialIds = {};
        Object.entries(permisosAgrupados).forEach(([modulo, permisosModulo]) => {
            initialIds[modulo] = {
                moduloId: uuidv4(),
                actions: permisosModulo.reduce((acc, permiso) => {
                    acc[permiso.nombre] = uuidv4();
                    return acc;
                }, {})
            };
        });
        
        setIds({
            ...initialIds, 'all-system-access': {
                moduloId: uuidv4(),
                actions: {
                    all: uuidv4()
                }
            }
        });
    }, [permisosAgrupados]);

    return (
        <div className={`border rounded-lg ${formik.touched.permisos && formik.errors.permisos ? 'border-red-500 text-red-500' : 'border-neutral-300'}`}>
            <div className='px-4 py-2 flex items-center justify-between'>
                <h1 className='font-semibold'>Permisos</h1>
                <div className='flex items-center'>
                    <label className='text-sm cursor-pointer' htmlFor={ids["all-system-access"]?.moduloId}>Seleccionar Todos</label>
                    <Checkbox
                        id={ids["all-system-access"]?.moduloId}
                        size="small"
                        checked={formik.values.permisos.includes(1)}
                        onChange={() => handlePermissionChange(1)}
                    />
                </div>
            </div>
            <Table size='small' className='text-nowrap'>
                <TableHead>
                    <TableRow>
                        <TableCell className='text-sm' align="left">
                            Modulo
                        </TableCell>
                        <TableCell className='text-sm !max-w-5' align="center">
                            read
                        </TableCell>
                        <TableCell className='text-sm !max-w-5' align="center">
                            create
                        </TableCell>
                        <TableCell className='text-sm !max-w-5' align="center">
                            update
                        </TableCell>
                        <TableCell className='text-sm !max-w-5' align="center">
                            delete
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(permisosAgrupados).map(([modulo, permisosModulo]) => (
                        <TableRow key={modulo}>
                            <TableCell className="text-sm select-none" align="left">
                                <Checkbox
                                    id={ids[modulo]?.moduloId}
                                    size="small"
                                    checked={formik.values.permisos.includes(1) || permisosModulo.every((permiso) =>
                                        formik.values.permisos.includes(permiso.id)
                                    )}
                                    onChange={() => {
                                        const permisosIds = permisosModulo.map(permiso => permiso.id);
                                        const permisosSeleccionados = formik.values.permisos;

                                        const allPermisos = permisosIds.every(permisoId => permisosSeleccionados.includes(permisoId));

                                        const nuevosPermisos = allPermisos
                                            ? permisosSeleccionados.filter(permisoId => !permisosIds.includes(permisoId)) // Filtramos los permisos existentes
                                            : [
                                                ...permisosSeleccionados,
                                                ...permisosIds.filter(permisoId => !permisosSeleccionados.includes(permisoId)) // Solo agregamos permisos no duplicados
                                            ];

                                        formik.setFieldValue('permisos', nuevosPermisos);
                                    }}
                                    disabled={formik.values.permisos.includes(1)}
                                />
                                <label className='cursor-pointer' htmlFor={ids[modulo]?.moduloId}>{modulo}</label>
                            </TableCell>
                            {['read', 'create', 'update', 'delete'].map((action) => {
                                const permisoKey = permisosModulo.find((permiso) => permiso.nombre.includes(action))?.id;
                                const hasPermiso = permisosModulo.some((permiso) => permiso.nombre.includes(action));

                                return (
                                    <TableCell key={action} className="text-sm !max-w-5" align="center">
                                        <Checkbox
                                            size="small"
                                            disabled={formik.values.permisos.includes(1) || !hasPermiso}
                                            checked={formik.values.permisos.includes(1) || formik.values.permisos.includes(permisoKey)}
                                            onChange={() => handlePermissionChange(permisoKey)}
                                        />
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default TablaPermisos