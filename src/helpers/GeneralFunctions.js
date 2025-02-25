export function SortData(data, orderBy, orderDirection) {
    return [...data]
        .sort((a, b) => {
            // Separar orderBy por puntos para acceder a propiedades anidadas
            const orderByKeys = orderBy.split('.');

            // Acceder a las propiedades anidadas
            const aValue = orderByKeys.reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : null, a);
            const bValue = orderByKeys.reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : null, b);

            // Comprobar el orden
            if (orderDirection === 'asc') {
                return aValue < bValue ? -1 : 1;
            }
            return aValue > bValue ? -1 : 1;
        });
}

export const formatFirstNameLastName = (nombes, apellidos) => {
    const firstName = nombes?.trim().split(" ")[0];
    const lastName = apellidos?.trim().split(" ")[0];
    return `${firstName} ${lastName}`;
}

export const hasPermissionFunction = (user, permission) => {
    const hasAllAccess = user?.permissions?.includes("all_system_access");
    const hasSpecificPermission = user?.permissions?.includes(`read_${permission}`);
    return hasAllAccess || !permission || hasSpecificPermission;
}

// Función para formatear la fecha
export const formatDate = (DateString) => {
    const date = new Date(DateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses empiezan en 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
};

export const FormatoEnvioFecha = (fecha) => {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}