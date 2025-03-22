import useSocketCam from "../Components/hooks/useSocketCam"; // Importamos el hook de WebSocket
import useSocket from "../Components/hooks/useSocketBody"; // Importamos el 2 hook de WebSocket
import axios from "axios";
import Bomberos from "./Bomberos";
import { useEffect, useState } from "react";
import { LucideUsers } from "lucide-react";
import { Camera } from "lucide-react";
import { Car } from "lucide-react";




const procesarControlBodys = (controlBodys) => {
  const conteo = { moto: 0, camioneta: 0 };

  controlBodys.forEach((item) => {
    console.log(item.funcions?.funcion);
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
const Card = ({ title, total, percentage, icon: Icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 items-center justify-between w-32 border-black border-2">
      <div>
        <p className="text-xs text-gray-500 uppercase">{title}</p>
        <h2 className="text-2xl font-bold text-center">{total.toLocaleString()}</h2>
        {percentage && (
          <span className="text-sm bg-green-100 text-green-600 font-semibold px-2 py-1 rounded-lg">
            +{percentage}%
          </span>
        )}
      </div>
      <div className="text-gray-300 text-5xl">
        {Icon ? <Icon size={48} /> : <LucideUsers size={48} />}
      </div>
    </div>
  );
};

// Este componente puede recibir props como el nombre de la ciudad, temperatura, estado del clima, etc.
const WeatherCard = ({ temperature, weatherIcon, HR, hora }) => {
  return (
    <div className="w-[250px] h-[278px] px-10 py-4 bg-blue-300 rounded-lg shadow-md flex flex-col items-center justify-center space-y-0 ">
      {/* Ciudad */}
      <h2 className="text-4xl font-semibold text-white ">Lima Este</h2>

      {/* Icono del clima */}
      <img src={`https://www.senamhi.gob.pe/public/images/icono/icon${weatherIcon}.png`} alt="weather icon" className="w-18 h-18" />

      {/* Temperatura */}
      <div className="flex items-baseline space-x-2">
        <span className="text-5xl font-bold text-white">{temperature}</span>
        <span className="text-2xl text-gray-500 text-white">°C</span>
      </div>

      {/* Humedad Relativa */}

      <div className="flex items-baseline space-x-2">
        <span className="text-lg font-bold text-white">HR: {HR}</span>
        <span className="text-lg text-gray-500 text-white">%</span>
      </div>

      {/* HORA */}
      <div className="flex items-baseline space-x-2">
        <span className="text-lg font-bold text-white">{hora}</span>
        <span className="text-lg text-gray-500 text-white"> hrs</span>
      </div>
    </div>
  );
};

// Función para determinar el color según el nivel

const getLevelColor = (nivel) => {
  if (nivel < 75) return "bg-blue-500";  // Azul para niveles menores a 75
  if (nivel >= 75 && nivel < 90) return "bg-yellow-500"; // Amarillo para niveles entre 75 y 90
  if (nivel >= 90 && nivel < 120) return "bg-orange-500"; // Naranja para niveles entre 90 y 120
  return "bg-red-600"; // Rojo para niveles mayores a 120
};

const RiverFlowCard = ({ nivel, medida, umbralMaximo, cuerpoAgua }) => {

  const levelColor = getLevelColor(nivel);
  return (
    <div className={`w-[250px] h-[278px] px-10 py-4 ${levelColor} rounded-lg shadow-sm flex flex-col items-center justify-center space-y-0 hover:shadow-2xl transition-shadow duration-300 ease-in-out`}>

      <h2 className="text-lg font-semibold text-white">Caudal - {cuerpoAgua}</h2>
      {/* Cuerpo de agua
      <div className="w-full bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">Cuerpo de Agua:</h3>
        <p className="text-gray-600">{cuerpoAgua}</p>
      </div> */}

      {/* Nivel del caudal */}
      <div className="flex items-center space-x-2 w-full">
        <span className={`text-5xl font-bold  text-white p-2 rounded-lg`}>{nivel}</span>
        <span className="text-xl text-gray-500 text-white">{medida}</span>
      </div>

      {/* Umbral máximo */}
      <div className="w-full rounded-lg p-4">
        <h3 className="text-lg font-medium text-white">Umbral Máximo:</h3>
        <p className="text-gray-600 text-white">{umbralMaximo} {medida}</p>
      </div>
    </div>
  );
};


// Página principal
const CampoPage = () => {

  const [clima, setClima] = useState({});
  const [caudal, setCaudal] = useState({});
  const [ultima, setUltima] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const currentDate = new Date();
        const fecha = currentDate.toLocaleDateString('en-CA');
        //Formatear la hora en formato HH:mm
        const hora = currentDate.getHours().toString().padStart(2, '0') + ":" + currentDate.getMinutes().toString().padStart(2, '0');
        console.log("Fecha:", currentDate);
        console.log("Hora:", fecha);

        const formData = new FormData();
        formData.append("fecha", fecha);  // Fecha en formato YYYY-MM-DD
        formData.append("hora", hora);    // Hora en formato HH:mm

        //https://www.senamhi.gob.pe/include/ajax-informacion-diaria-chirilu.php
        const response = await axios.post(
          "https://www.senamhi.gob.pe/include/ajax-informacion-diaria-chirilu.php",
          formData
        );

        console.log("Datos de caudal:", response.data.content); // content["13"] es la ruta hacia el caudal del río Rímac en el objeto de respuesta
        setCaudal(response.data.content["13"]);

      } catch (error) {
        console.error("Error al obtener el caudal:", error);
      }
    };
    fetchData();
  }, []); // Dependencia vacía para que solo se ejecute una vez al montar el componente

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Crear un objeto FormData para enviar los datos en formato form-data
        const formData = new FormData();
        formData.append("cod_sector", "0011");

        // Hacer la solicitud POST
        const response = await axios.post(
          "https://www.senamhi.gob.pe/mapas/mapa-limametropolitana/include/ajaxPronosticoSector.php",
          formData
        );
        if (response.data) {
          setClima(response.data);
        }
        // Procesar la respuesta
        console.log("Pronóstico del clima:", response.data);
        // Aquí podrías hacer algo con la respuesta como actualizar el estado
      } catch (error) {
        console.error("Error al obtener el pronóstico del clima:", error);
      }
    };
    fetchData();
  }, []); // Dependencia vacía para que solo se ejecute al montar el componente

  useEffect(() => {
    const fetchDataIncidencia = async () => {
      try {
        const response = await axios.get("http://172.16.10.20:3000/api/preincidencias/historial");
        console.log("data:", response.data);
        //(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataIncidencia();
  }, []);

  useEffect(() => {
    const fetchBomberosIncidencia = async () => {
      try {
        //const response = await axios.get("https://cecomapi.erickpajares.dev/incidents");
        const { data } = await axios.get('/api/incidents');
        console.log("data bomberos:", data);
        setUltima(data.incidents[0]);
        //(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBomberosIncidencia();
  }, []);

  const { camaras } = useSocketCam(); // Obtenemos las cámaras inactivas
  const { controlBodys } = useSocket(); // Obtenemos las bodycam
  const [conteoVehiculos, setConteoVehiculos] = useState({ moto: 0, camioneta: 0 });

  useEffect(() => {
    console.log("controlBodys:", controlBodys);
    if (controlBodys && controlBodys.length > 0) {
      setConteoVehiculos(procesarControlBodys(controlBodys));
    }
  }, [controlBodys]);

  return (
    <div className="flex flex-col md:flex-row justify-center px-4 md:px-10 w-full bg-white" style={{ alignItems: "center", justifyContent: "space-evenly", height: "100vh" }}>
      {/* Secciones de datos */}
      <div className="border-2 border-red-200 w-[100vw] h-[100vh] flex flex-col justify-center items-center">
        <div className="border-2 border-blue-200 w-full h-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 p-4 md:p-10 justify-items-center items-center">
          {/* Cards de Data de información */}
          <a href="/control_bodycam" target="_blank" rel="noopener noreferrer" className="hover:shadow-2xl hover:scale-105 p-4 flex flex-col gap-2 items-center justify-center w-32 h-36 border-2 border-black rounded-xl">
          <Card
            title="Bodycams en Campo"
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if (item.funcions?.funcion === "Sereno motorizado" || item.funcions?.funcion === "Sereno conductor") {
                  const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                  acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                  acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
            total={(conteoVehiculos.camioneta + conteoVehiculos.moto) || 0}
          />
          </a>
          <Card title="Móviles en Campo"
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if (item.funcions?.funcion === "Sereno conductor") {
                  const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                  acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                  acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
            total={conteoVehiculos.camioneta}
            icon={Car}
          />
          <Card title="Motorizados Activos"
            total={conteoVehiculos.moto}
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if (item.funcions?.funcion === "Sereno motorizado") {
                  const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                  acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                  acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
          />
          <Card
            title="Libres en campo"
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if (item.funcions?.funcion === "Sereno motorizado" || item.funcions?.funcion === "Sereno conductor") {
                  const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                  acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                  acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
            total={(conteoVehiculos.camioneta + conteoVehiculos.moto) || 0}
          />
          <Card
            title="Metas en campo"
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if (item.funcions?.funcion === "Sereno motorizado" || item.funcions?.funcion === "Sereno conductor") {
                  const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                  acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                  acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
            total={(conteoVehiculos.camioneta + conteoVehiculos.moto) || 0}
          />
          <Card
            title="Bodycams en Campo"
            data={Object.values(controlBodys.reduce((acc, item) => {
              if (item.status === "EN CAMPO") {
                if (item.funcions?.funcion === "Sereno motorizado" || item.funcions?.funcion === "Sereno conductor") {
                  const jurisdiccion = item.Jurisdiccions?.jurisdiccion || "Desconocido";
                  acc[jurisdiccion] = acc[jurisdiccion] || { label: jurisdiccion, value: 0 };
                  acc[jurisdiccion].value += 1;
                }
              }
              return acc;
            }, {}))}
            total={(conteoVehiculos.camioneta + conteoVehiculos.moto) || 0}
          />
          <a href="http://192.168.30.91:81/" target="_blank" rel="noopener noreferrer" className="hover:shadow-2xl hover:scale-105 p-4 flex flex-col gap-2 items-center justify-center w-32 h-36 border-2 border-black rounded-xl">
            <Card
              title="Cámaras desactivadas"
              total={camaras.length > 0 ? camaras.length : 0}
              icon={Camera}
            />
          </a>



        </div>
        <div className="border-2 border-blue-200 w-full h-[35%] grid grid-cols-7 gap-4 md:grid-cols-7 md:p-10 justify-items-center items-center">
        </div>
        <div className="border-2 border-blue-200 w-full h-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:p-10 justify-items-center items-center ">
        <a href="https://weather.com/es-GT/tiempo/horario/l/San+Juan+De+Lurigancho+Provincia+de+Lima+Per%C3%BA?canonicalCityId=2acb024069dd3de22b211c32db19df87" target="_blank" rel="noopener noreferrer" className="hover:shadow-2xl hover:scale-105 p-4 flex flex-col gap-2 items-center justify-center w-32 h-36 ">
          <WeatherCard
            city="Lima"
            temperature={clima[0]?.N_TEM}
            weatherIcon={clima[0]?.V_COD_ICONO}
            HR={clima[0]?.N_HUM}
            hora={clima[0]?.V_HORA}
          />
          </a>
          <a href="https://www.senamhi.gob.pe/?&p=monitoreo-chirilu" target="_blank" rel="noopener noreferrer" className="hover:shadow-2xl hover:scale-105 p-4 flex flex-col gap-2 items-center justify-center w-32 h-36 ">
          <RiverFlowCard
            nivel={Math.round(caudal?.dato)}
            medida={caudal?.unidad}
            umbralMaximo={caudal?.umbralRojo}
            cuerpoAgua={caudal?.nomCuenca} />
            </a>
          <Bomberos
            ultima={ultima}
            click={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CampoPage;
