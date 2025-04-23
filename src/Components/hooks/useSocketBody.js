import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocketControlBody = (token) => {
  const socketRef = useRef(null);
  const [controlBodys, setControlBodys] = useState([]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_APP_ENDPOINT, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Conectado al servidor de WebSocket");
      socketRef.current.emit("getAllControlBodysGenerales"); // Usar el nombre correcto del evento
      console.log(socketRef.current.emit("getAllControlBodysGenerales"));
    });

    // Escuchar la respuesta correcta del backend
    socketRef.current.on("getAllControlBodysGeneralesResponse", (response) => {
      if (response.status === 200) {
        //console.log("📡 Datos de Control Body recibidos:", response.data);
        setControlBodys(response.data);
        console.log("📡 Datos de Control Body recibidos:", response);
      } else {
        console.error("❌ Error al obtener Control Bodies:", response.message);
      }
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("🔴 Desconectado del servidor de WebSocket", reason);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("❌ Error de conexión con Socket.io:", error);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return { controlBodys };
};

export default useSocketControlBody;
