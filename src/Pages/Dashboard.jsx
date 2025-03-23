import useSocketCam from "../Components/hooks/useSocketCam";
import useSocket from "../Components/hooks/useSocketBody";
import axios from "axios";
import Bomberos from "./Bomberos";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Car } from "lucide-react";
import Card from "../Components/Cards/SimpleCard";
import WeatherCard from "../Components/Cards/WeatherCard";
import RiverFlowCard from "../Components/Cards/RiverFlowCard";
import LoadingCard from "../Components/Cards/LoadingCard";

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

// Página principal
const CampoPage = () => {

  const [clima, setClima] = useState(null);
  const [caudal, setCaudal] = useState(null);
  const [ultima, setUltima] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const currentDate = new Date();
        const fecha = currentDate.toLocaleDateString('en-CA');
        //Formatear la hora en formato HH:mm
        const hora = currentDate.getHours().toString().padStart(2, '0') + ":" + currentDate.getMinutes().toString().padStart(2, '0');
        const formData = new FormData();
        formData.append("fecha", fecha);  // Fecha en formato YYYY-MM-DD
        formData.append("hora", hora);    // Hora en formato HH:mm
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = new FormData();
        formData.append("cod_sector", "0011");
        const response = await axios.post(
          "https://www.senamhi.gob.pe/mapas/mapa-limametropolitana/include/ajaxPronosticoSector.php",
          formData
        );
        if (response.data) {
          setClima(response.data);
        }
        console.log("Pronóstico del clima:", response.data);
      } catch (error) {
        console.error("Error al obtener el pronóstico del clima:", error);
      }
    };
    fetchData()
  }, []);

  useEffect(() => {
    const fetchDataIncidencia = async () => {
      try {
        const response = await axios.get("http://172.16.10.20:3000/api/preincidencias/historial");
        console.log("data:", response.data);
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
      } catch (error) {
        console.error(error);
      }
    };
    fetchBomberosIncidencia();
  }, []);

  const { camaras } = useSocketCam();
  const { controlBodys } = useSocket();
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
          {clima ? <a href="https://weather.com/es-GT/tiempo/horario/l/San+Juan+De+Lurigancho+Provincia+de+Lima+Per%C3%BA?canonicalCityId=2acb024069dd3de22b211c32db19df87" target="_blank" rel="noopener noreferrer" className="hover:shadow-2xl hover:scale-105 p-4 flex flex-col gap-2 items-center justify-center w-32 h-36 ">
            <WeatherCard
              city="Lima"
              temperature={clima[0]?.N_TEM}
              weatherIcon={clima[0]?.V_COD_ICONO}
              HR={clima[0]?.N_HUM}
              hora={clima[0]?.V_HORA}
            />
          </a> : <LoadingCard />}
          {caudal ? <a href="https://www.senamhi.gob.pe/?&p=monitoreo-chirilu" target="_blank" rel="noopener noreferrer" className="hover:shadow-2xl hover:scale-105 p-4 flex flex-col gap-2 items-center justify-center w-32 h-36 ">
            <RiverFlowCard
              nivel={Math.round(caudal?.dato)}
              medida={caudal?.unidad}
              umbralMaximo={caudal?.umbralRojo}
              cuerpoAgua={caudal?.nomCuenca} />
          </a> : <LoadingCard />}
          {ultima ? <Bomberos
            ultima={ultima}
            click={true}
          /> : <LoadingCard />}
        </div>
      </div>
    </div>
  );
};

export default CampoPage;
