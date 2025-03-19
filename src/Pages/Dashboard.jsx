import React from "react";
import useSocketCam from "../Components/hooks/useSocketCam"; // Importamos el hook de WebSocket
import useSocket from "../Components/hooks/useSocketBody"; // Importamos el 2 hook de WebSocket
import axios from "axios";
import { useEffect, useState } from "react";
import Bodycam from "../assets/fotos/bodycam.jpg";
import Motorizado from "../assets/fotos/motorizados.jpg";
import Movil from "../assets/fotos/moviles.jpg";

const procesarControlBodys = (controlBodys) => {
  let conteo = { moto: 0, camioneta: 0 };

  controlBodys.forEach((item) => {
    console.log("item:", item);
    switch (item.funcions?.funcion) {
      case "Sereno motorizado":
        switch (item.status) {
          case "EN CAMPO":
            conteo.moto += 1;
            break;
          default:
            break;
        }
        break;
      default:
        switch (item.status) {
          case "EN CAMPO":
            switch (item.funcions?.funcion) {
              case "Sereno conductor":
                conteo.camioneta += 1;
                break;
              default:
                break;
            }
        }
        break;
    }
  });

  return conteo;
};

// Componente reutilizable para tarjetas
const Card = ({ title, total, data, imageSrc, children }) => {
  const isTwoColumns = Array.isArray(data) && data.length > 6;

  return (
    <div className="bg-[#f8f8f0] rounded-lg shadow-md max p-6">
      <h2 className="text-lg font-semibold text-center">{title}</h2>
      <img src={imageSrc} alt={title} className="w-full h-32 object-cover mt-4 rounded-lg" />
      <div className={`mt-2 text-gray-700 ${isTwoColumns ? "grid grid-cols-2 gap-4" : ""}`}>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((item, index) => (
            <p key={index} className="text-sm text-center">
              {item.label}: <span className="font-bold">{item.value}</span>
            </p>
          ))
        ) : (
          children
        )}
      </div>
      {total !== undefined && <p className="text-green-600 text-center text-xl font-bold">TOTAL {total}</p>}
    </div>
  );
};

// Página principal
const CampoPage = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://www.senamhi.gob.pe/?p=pronostico-detalle&dp=15&localidad=0116");
        //console.log("data:", response.data);
        //(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const { camaras } = useSocketCam(); // Obtenemos las cámaras inactivas
  const { controlBodys } = useSocket(); // Obtenemos las bodycam
  const [conteoVehiculos, setConteoVehiculos] = useState({ moto: 0, camioneta: 0 });

  useEffect(() => {
    if (controlBodys && controlBodys.length > 0) {
      setConteoVehiculos(procesarControlBodys(controlBodys));
    }
  }, [controlBodys]);

  return (
    <div className="flex flex-col md:flex-row justify-center px-4 md:px-10 w-full bg-white" style={{ alignItems: "center", justifyContent: "space-evenly", height: "100vh" }}>
      {/* Monitoreo */}
      <div className="md:w-1/3 w-full px-2">
        <div className="bg-[#f8f8f0] p-6 md:p-12 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold text-center mb-4">Monitoreo Hidrológico</h2>
          <iframe
            src="https://www.senamhi.gob.pe/mapas/mapa-monitoreohidro/include/mnt-grafica-new.php?id=47278214&fecha_hora=2025-03-15+11%3A00%3A00%20&variable=CAUDAL&variable_opcion=C"
            className="w-full h-64 md:h-96 border rounded-lg"
            loading="lazy"
          ></iframe>
        </div>
        <div className="bg-[#f8f8f0] p-6 md:p-12 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-center mb-4">Monitoreo Climatológico</h2>
          <iframe
            src="https://www.senamhi.gob.pe/mapas/mapa-limametropolitana/"
            className="w-full h-64 md:h-96 border rounded-lg"
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Secciones de datos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-10 w-full">
        {/* Tarjetas de información */}
        <div className="flex flex-col gap-6">
          <Card
            title="Bodycams en Campo"
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if(item.funcions?.funcion === "Sereno motorizado" || item.funcions?.funcion === "Sereno conductor"){
                  const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                  acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                  acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
            total={(conteoVehiculos.camioneta + conteoVehiculos.moto) || 0}
            imageSrc={Bodycam}
          />
          <Card title="Móviles en Campo"
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if( item.funcions?.funcion === "Sereno conductor"){
                const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
            total={conteoVehiculos.camioneta}
            imageSrc={Movil} />

          <Card title="Motorizados Activos"
            total={conteoVehiculos.moto}
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if( item.funcions?.funcion === "Sereno motorizado"){
                const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}            
            imageSrc={Motorizado} />
        </div>

        {/* Sección de Incidencias */}
        <div className="bg-[#f8f8f0] p-6 rounded-lg shadow-md w-full min-h-[300px]">
          <h2 className="text-xl text-center font-semibold mb-4">INCIDENCIAS</h2>
          {["Emisión de alertas tempranas en apoyo a la PNP", "Emisión de alertas tempranas en presuntas faltas",
            "Apoyo a la PNP y otras gerencias en infracciones", "Ayuda y apoyo a personas y entidades",
            "Emisión de alertas en desastres e infraestructura"].map((incidencia, index) => (
              <p key={index} className="border-b py-2 flex justify-between">
                {incidencia} <span className="font-bold">5</span>
              </p>
            ))
          }
          <p className="text-right font-bold mt-4">TOTAL: 35</p>
        </div>

        {/* Sección de Cámaras Desactivadas */}
        <div className="bg-[#f8f8f0] p-6 rounded-lg shadow-md w-full min-h-[300px]">
          <h2 className="text-xl font-semibold text-center mb-4">Cámaras Desactivadas</h2>
          {camaras.length > 0 ? (
            <>
              {camaras.map((cam, index) => (
                <p key={index} className="font-bold text-center">
                  {cam.POSTE} - offline 🔴
                </p>
              ))}
              <p className="text-right font-bold mt-4">TOTAL: {camaras.length}</p>
            </>
          ) : (
            <p className="text-center">No hay cámaras desactivadas 🟢</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampoPage;
