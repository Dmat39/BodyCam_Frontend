import img1 from "../assets/img/emergencia.png"
import img2 from "../assets/img/Clock.png";
import img3 from "../assets/img/Map.png";
import img4 from "../assets/img/Map pin.png";
import img5 from "../assets/img/Calendar.png";
import img6 from "../assets/img/unidades.svg";
//import "./glow.css";
import moment from "moment";
import Siren from "../assets/audio/sirena.mp3";
import { useRef, useEffect, useState } from "react";
//chrome://settings/content/sound

const Last = ({ ultima, click }) => {

    const audioRef = useRef(new Audio(Siren));
    const [active, setActive] = useState(false);
    const textoAEliminar = " - SAN JUAN DE LURIGANCHO";



    const formatDate = (date) => {
        //console.log("date: ", date);
        if (date) {
            const [datePart, timePart] = date.split('T');
            const [year, month, day] = datePart.split('-');
            return `${day}-${month}-${year}`;
        }
    };

    useEffect(() => {
        if (ultima && ultima.hora) {
            const incidentDate = moment(ultima.fecha, 'YYYY-MM-DD');
            const incidentTime = moment(ultima.hora, 'HH:mm:ss');
            const now = moment();
            const diffMinutes = now.diff(incidentTime, 'minutes');
            const isToday = incidentDate.isSame(now, 'day');
            //console.log("diff Minutes :", diffMinutes);
            if (isToday && diffMinutes <= 10 && diffMinutes > 0 && !active) {
                //console.log("hora que se encontro la incidencia: ", now.format('DD-MM-YYYY HH:mm:ss'));
                setActive(true);
                audioRef.current.play();
            } else if (!isToday || diffMinutes > 10 || diffMinutes < 0 && active) {
                setActive(false);
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [ultima]);

    return (
        <>
                    <a className="py-auto w-[fit-content] rounded cursor-pointer"
                        href={`https://sgonorte.bomberosperu.gob.pe/24horas/Home/Map?numparte=${ultima?.parte}`}
                        target="_blank">
            <div className={`flex flex-col border-4 border-[#DC3545] min-w-[220px] p-3 min-h-[270px] w-[250px] text-black ${click ? "visible" : "invisible"} ${active ? "glowing-border" : ""} hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:shadow-2xl hover:scale-105 `}>
                <p className="flex justify-center items-center text-[12px] my-1 h-[45px]">
                    <img src={img1} className="size-8 bg-white rounded-full mr-1" />{ultima?.titulo}</p>
                <p className="flex justify-start items-center text-[11px] my-2 h-[45px]" >
                    <img src={img2} className="size-5 mx-[6px] bg-white rounded-xl" />{ultima?.direccion.replace(textoAEliminar, '')}</p>
                <p className="flex justify-start items-center text-[11px] mt-2" >
                    <img src={img3} className="size-5 mx-[6px] bg-white rounded" />San Juan de Lurigancho</p>
                <p className="flex justify-start items-center text-[11px] my-1" >
                    <img src={img4} className="size-5 mx-[6px] bg-white rounded-xl " />{ultima?.hora} HRS</p>
                <p className="flex justify-start items-center text-[11px] my-1" >
                    <img src={img5} className="size-5 mx-[6px] bg-white rounded" />{formatDate(ultima?.fecha)}</p>
                <p className="flex justify-start items-center text-[11px] my-1" >
                    <img src={img6} className="size-5 mx-[6px] bg-white rounded" />{ultima?.unidadesMoviles.join(" , ")}</p>
                <div className="flex justify-center items-center">
                </div>
            </div>
                </a>
        </>
    );

}

export default Last;