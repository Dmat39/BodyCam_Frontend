const SLICE_COUNT = 38;

const getAvgKmSIPCOP = (rows, turno) => avgByTurno(rows, turno, {1:25, 2:45, 3:5});

const getAvgKmGeosatelital = (rows, turno) => avgByTurno(rows, turno, {1:23, 2:43, 3:6});

const getAvgTacticos = (rows, turno) => avgByTurno(rows, turno, {1:20, 2:41, 3:4});

const getAvgIncidencias = (rows, turno) => avgByTurno(rows, turno, {1:27, 2:48, 3:10});

function avgByTurno(rows, turno, cellMap) {
  if (!Array.isArray(rows) || rows.length === 0) return '0.00';

  const celda = cellMap[turno];
  if (!celda) return '0.00';

  const sliceRows = rows.slice(0, SLICE_COUNT);
  const total = sliceRows
    .map(row => Number(row[celda]) || 0)
    .reduce((acc, v) => acc + v, 0);

  return (total / SLICE_COUNT).toFixed(2);
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