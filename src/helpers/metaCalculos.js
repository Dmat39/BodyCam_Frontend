const getAvgKmSIPCOP = (rows, turno) => {
    let celda = 0;
    if (rows.length === 0) return;
    const sliceCount = 38;
    const sliceRows = rows.slice(0, sliceCount);
    if (turno == 1) {
        celda = 25;
    } else if (turno == 2) {
        celda = 45;
    }
    else if (turno == 3) {
        celda = 5;
    }
    else if (celda == 0)
        return false;
    const total = sliceRows.reduce((acc, row) => {
        const value = Number(row[celda]) || 0;
        return acc + value;
    }, 0);

    return ((total / sliceCount).toFixed(2));
}

const getAvgKmGeosatelital = (rows, turno) => {
    let celda = 0;
    if (rows.length === 0) return;
    const sliceCount = 38;
    const sliceRows = rows.slice(0, sliceCount);
    if (turno == 1) {
        celda = 23;
    } else if (turno == 2) {
        celda = 43;
    }
    else if (turno == 3) {
        celda = 6;
    }
    else if (celda == 0)
        return false;
    const total = sliceRows.reduce((acc, row) => {
        const value = Number(row[celda]) || 0;
        return acc + value;
    }, 0);

    return ((total / sliceCount).toFixed(2));
}

const getAvgTacticos = (rows, turno) => {
    let celda = 0;
    if (rows.length === 0) return;
    const sliceCount = 38;
    const sliceRows = rows.slice(0, sliceCount);
    if (turno == 1) {
        celda = 20;
    } else if (turno == 2) {
        celda = 41;
    }
    else if (turno == 3) {
        celda = 4;
    }
    else if (celda == 0)
        return false;
    const total = sliceRows.reduce((acc, row) => {
        const value = Number(row[4]) || 0;
        return acc + value;
    }
        , 0);

    return ((total / sliceCount).toFixed(2));
}

const getAvgIncidencias = (rows, turno) => {
    let celda = 0;
    if (rows.length === 0) return;
    const sliceCount = 38;
    const sliceRows = rows.slice(0, sliceCount);
    if (turno == 1) {
        celda = 27;
    } else if (turno == 2) {
        celda = 48;
    }
    else if (turno == 3) {
        celda = 10;
    }
    else if (celda == 0)
        return false;
    const total = sliceRows.reduce((acc, row) => {
        const value = Number(row[celda]) || 0;
        return acc + value;
    }
        , 0);

    return ((total / sliceCount).toFixed(2));
}

function getCurrentShift(date = new Date()) {
    const hour = date.getHours(); // devuelve 0–23

    if (hour >= 7 && hour < 15) {
        return { cod: 1, nombre: "Mañana" }; // 07:00–14:59
    }
    if (hour >= 15 && hour < 23) {
        return { cod: 2, nombre: "Tarde" }; // 15:00–22:59
    }
    return { cod: 3, nombre: "Noche" }; // 23:00–06:59
}





export { getAvgKmSIPCOP, getAvgKmGeosatelital, getAvgTacticos, getAvgIncidencias, getCurrentShift };