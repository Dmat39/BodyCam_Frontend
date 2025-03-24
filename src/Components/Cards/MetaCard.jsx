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

    const DAILY_GOALS = {
        kmSipcop: 85,
        kmGeo: 85,
        tacticos: 210,
        incidencias: 3,
    };

    useEffect(() => {
        if (!rows.length) return;

        const { cod: currentCod } = getCurrentShift();
        setTurnoActual(getCurrentShift());

        const shiftOrder = [3, 1, 2];
        let totalKmSipcop = 0, totalKmGeo = 0, totalTacticos = 0, totalIncidencias = 0;

        for (const turno of shiftOrder) {
            totalKmSipcop += parseFloat(getAvgKmSIPCOP(rows, turno)) || 0;
            totalKmGeo += parseFloat(getAvgKmGeosatelital(rows, turno)) || 0;
            totalTacticos += parseFloat(getAvgTacticos(rows, turno)) || 0;
            totalIncidencias += parseFloat(getAvgIncidencias(rows, turno)) || 0;
            if (turno === currentCod) break;
        }
        //calcular el porcentaje
        const pct = (value, goal) => ((value / goal) * 100).toFixed(2);

        // Meta diaria
        setAvgKmSIPCOPDia(pct(totalKmSipcop, DAILY_GOALS.kmSipcop));
        setAvgKmGeosatelitalDia(pct(totalKmGeo, DAILY_GOALS.kmGeo));
        setAvgTacticosDia(pct(totalTacticos, DAILY_GOALS.tacticos));
        setAvgIncidenciasDia(pct(totalIncidencias, DAILY_GOALS.incidencias));

        // Turno actual
        setAvgKmSIPCOPTurno(getAvgKmSIPCOP(rows, currentCod));
        setAvgKmGeosatelitalTurno(getAvgKmGeosatelital(rows, currentCod));
        setAvgTacticosTurno(getAvgTacticos(rows, currentCod));
        setAvgIncidenciasTurno(getAvgIncidencias(rows, currentCod));
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
