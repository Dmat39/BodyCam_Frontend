import { useState, useEffect } from 'react';
import { getAvgKmSIPCOP, getAvgKmGeosatelital, getAvgTacticos, getAvgIncidencias, getCurrentShift } from "../../helpers/metaCalculos";
import Target from "../../assets/img/target.svg";
import Goal from "../../assets/img/goal.svg";

const MetaData = ({ rows }) => {

    const [avgTacticosDia, setAvgTacticosDia] = useState(0);
    const [avgKmGeosatelitalDia, setAvgKmGeosatelitalDia] = useState(0);
    const [avgKmSIPCOPDia, setAvgKmSIPCOPDia] = useState(0);
    const [avgIncidenciasDia, setAvgIncidenciasDia] = useState(0);
    const [turnoActual, setTurnoActual] = useState(null);

    const [avgTacticosTurno, setAvgTacticosTurno] = useState(0);
    const [avgKmGeosatelitalTurno, setAvgKmGeosatelitalTurno] = useState(0);
    const [avgKmSIPCOPTurno, setAvgKmSIPCOPTurno] = useState(0);
    const [avgIncidenciasTurno, setAvgIncidenciasTurno] = useState(0);

    useEffect(() => {
        if (!rows.length) return;

        const { cod: currentCod } = getCurrentShift();
        setTurnoActual(getCurrentShift());

        // Define el orden correcto de los turnos
        const shiftOrder = [3, 1, 2];

        // Funciones helper que devuelven número (no string)
        const parse = fn => turno => Number(fn(rows, turno)) || 0;

        const sumReducer = (acc, fn) => turno => acc + parse(fn)(turno);

        // Calcula estadística por turno actual
        setAvgKmSIPCOPTurno(parse(getAvgKmSIPCOP)(currentCod));
        setAvgTacticosTurno(parse(getAvgTacticos)(currentCod));
        setAvgKmGeosatelitalTurno(parse(getAvgKmGeosatelital)(currentCod));
        setAvgIncidenciasTurno(parse(getAvgIncidencias)(currentCod));

        // Inicializa acumuladores
        let totalKmSIPCOP = 0;
        let totalTacticos = 0;
        let totalKmGeo = 0;
        let totalIncidencias = 0;

        // Itera solo hasta el turno actual, en orden 3→1→2
        for (const turno of shiftOrder) {
            if (turno === currentCod || shiftOrder.indexOf(turno) < shiftOrder.indexOf(currentCod)) {
                totalKmSIPCOP += parse(getAvgKmSIPCOP)(turno);
                totalTacticos += parse(getAvgTacticos)(turno);
                totalKmGeo += parse(getAvgKmGeosatelital)(turno);
                totalIncidencias += parse(getAvgIncidencias)(turno);
            }
            if (turno === currentCod) break;
        }

        // Setea todos los acumulados de una sola vez
        setAvgKmSIPCOPDia(((totalKmSIPCOP.toFixed(2) / 210) * 100).toFixed(2));
        setAvgTacticosDia(((totalTacticos.toFixed(2) / 210) * 100).toFixed(2));
        setAvgKmGeosatelitalDia(((totalKmGeo.toFixed(2) / 210) * 100).toFixed(2));
        setAvgIncidenciasDia(((totalIncidencias.toFixed(2) / 3) * 100).toFixed(2));
    }, [rows]);


    return (
        <>
            <div className="w-[250px] h-[278px] bg-blue-300 text-white p-2 border-2 border-blue-300 rounded-lg shadow-sm flex flex-col space-y-0 hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:shadow-2xl hover:scale-105">
                <div className="flex items-center justify-around">
                    <span className="text-left">
                        <p className="text-2xl font-semibold text-white ">Meta Diaria</p>
                        <p>SIPCOP : {avgKmSIPCOPDia} % </p>
                        <p>Geosat: {avgKmGeosatelitalDia} % </p>
                        <p>Tactico: {avgTacticosDia} % </p>
                        <p>Incidencias: {avgIncidenciasDia}%</p>
                    </span>
                    <div className="">
                        <img src={Target} className="w-[70px]" />
                    </div>
                </div>
                <div className="flex items-center justify-around">
                    <div className="">
                        <img src={Goal} className="w-[70px]" />
                    </div>
                    <span className="text-left">
                        <p className="text-2xl font-semibold text-white ">{turnoActual?.nombre}</p>
                        <p>SIPCOP : {avgKmSIPCOPTurno} Km </p>
                        <p>Geosat: {avgKmGeosatelitalTurno} Km </p>
                        <p>Tactico: {avgTacticosTurno} min </p>
                        <p>Incidencias: {avgIncidenciasTurno}</p>
                    </span>

                </div>
            </div>
        </>
    );
}

export default MetaData;
