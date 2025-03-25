import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocket = () => {
  const socketRef = useRef(null);
  const [camaras, setCamaras] = useState([]);

  useEffect(() => {
    // Inicializar socket solo una vez
    socketRef.current = io(import.meta.env.VITE_SOCKET_CAMARA, {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Conectado al servidor de WebSocket");
      socketRef.current.emit("getCameraStatus");
    });

    // Escuchar evento de cámaras desactivadas
    socketRef.current.on("cameraStatusSingle", (response) => {
      SpeechRecognitionResult((prevResult) => [...prevResult, response]);
    });

    socketRef.current.on("cameraStatus", (data) => {
      setCamaras(data.filter(cam => cam.Status.toLowerCase() === "inactiva"));
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("🔴 Desconectado del servidor de WebSocket", reason);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return { camaras };
};

export default useSocket;
