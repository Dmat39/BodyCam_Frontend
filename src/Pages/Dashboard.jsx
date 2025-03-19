import React from "react";
import useSocket from "../Components/hooks/useSocket"; // Importamos el hook de WebSocket
import axios from "axios";
import { useEffect, useState } from "react";




// Componente reutilizable para tarjetas
const Card = ({ title, total, data, imageSrc, children }) => {




  return (
    <div className="bg-[#f8f8f0] rounded-lg shadow-md w-90 p-6">
      {imageSrc && <img src={imageSrc} alt={title} className="w-full h-24 object-cover rounded-md mb-2" />}
      <h2 className="text-lg font-semibold text-center">{title}</h2>
      {total !== undefined && <p className="text-green-600 text-center text-xl font-bold">TOTAL {total}</p>}
      <div className="mt-2 text-gray-700">
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
    </div>
  );
};
//style={{ width: "100%", height: "50%", alignItems: "center", justifyContent: "space-evenly" }}
//style={{ alignItems: "center", justifyContent: "space-evenly", height: "100vh" }}
// Página principal
const CampoPage = () => {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://www.senamhi.gob.pe/?p=pronostico-detalle&dp=15&localidad=0116");
        console.log("data:", response.data);
        //(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const { camaras } = useSocket(); // Obtenemos las cámaras inactivas

  return (
    <div className="flex flex-cols-2 justify-center min-h-screen px-0 w-90  bg-white" >
      {/* Tarjeta con monitoreo hidrológico */}
      <div className="ml-5" >
      <div className="bg-[#f8f8f0] p-12 rounded-lg shadow-md mb-2" >
        <div className="flex justify-center">
          <h2 className="text-xl font-semibold mb-4">Monitoreo Hidrológico</h2>
        </div>
        <iframe
          src="https://www.senamhi.gob.pe/mapas/mapa-monitoreohidro/include/mnt-grafica-new.php?id=47278214&fecha_hora=2025-03-15+11%3A00%3A00%20&variable=CAUDAL&variable_opcion=C"
          className="w-[500px] h-96 border rounded-lg h-96"
          loading="lazy"
        ></iframe>
      </div>
      <div className="bg-[#f8f8f0] p-12 rounded-lg shadow-md" >
        <div className="flex justify-center">
          <h2 className="text-xl font-semibold h-10 mb-4">Monitoreo Climatologico</h2>
        </div>
        <iframe
          src="https://www.senamhi.gob.pe/mapas/mapa-limametropolitana/"
          className="w-[500px] h-96 border rounded-lg"
          loading="lazy"
        ></iframe>
      </div>
      </div>

      <div className="grid grid-cols-3 p-10 min-h-screen min-w-screen mt-1 gap-6" style={{ alignItems: "center", justifyContent: "space-evenly" }}>
        {/* Tarjetas de información */}
        <div className="flex justify-center grid grid-cols-1 md:grid-cols-1 gap-6">
          <Card title="Bodycams en Campo" total={99} data={[
            { label: "ZONA SUR", value: 33 },
            { label: "ZONA NORTE", value: 33 },
            { label: "ZONA CENTRO", value: 33 },
            { label: "LIBRE", value: 1 },
          ]} imageSrc="/bodycam.jpg" />

          <Card title="Móviles en Campo" total={99} data={[
            { label: "ZONA SUR", value: 33 },
            { label: "ZONA NORTE", value: 33 },
            { label: "ZONA CENTRO", value: 33 },
            { label: "META", value: 33 },
          ]} imageSrc="/moviles.jpg" />

          <Card title="Motorizados Activos" total={99} data={[
            { label: "ZONA SUR", value: 33 },
            { label: "ZONA NORTE", value: 33 },
            { label: "ZONA CENTRO", value: 33 },
            { label: "META", value: 33 },
          ]} imageSrc="/motorizados.jpg" />
        </div>

        {/* Sección de Incidencias */}
        <div className="bg-[#f8f8f0] p-6 rounded-lg shadow-md w-900 min-h-[500px]">
          <h2 className="text-xl text-center font-semibold h-10 mb-4">INCIDENCIAS</h2>
          {["Emisión de alertas tempranas en apoyo a la PNP", "Emisión de alertas tempranas en presuntas faltas",
            "Apoyo a la PNP y otras gerencias en infracciones", "Ayuda y apoyo a personas y entidades",
            "Emisión de alertas en desastres e infraestructura"].map((incidencia, index) => (
              <p key={index} className="border-b py-2 flex h-20 justify-between">
                {incidencia} <span className="font-bold">5</span>
              </p>
            ))
          }
          <p className="text-right font-bold mt-4">TOTAL: 35</p>
        </div>

        {/* Sección de Cámaras Desactivadas */}
        <div className="bg-[#f8f8f0] p-6 rounded-lg shadow-md w-90 min-h-[500px]">
          <h2 className="text-xl font-semibold h-25 text-center mb-4">Cámaras Desactivadas</h2>
          {camaras.length > 0 ? (
            camaras.map((cam, index) => (
              <p key={index} className=" font-bold h-10 text-align-center">
                {cam.POSTE} - offline 🔴
              </p>
            ))
          ) : (
            <p>No hay cámaras desactivadas 🟢</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampoPage;
