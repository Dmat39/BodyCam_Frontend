import { io } from "socket.io-client";

// Usa la variable de entorno o fallback a localhost
const URL = import.meta.env.VITE_APP_ENDPOINT ;

export const socket = io(URL, {
    transports: ["websocket", "polling"], // Usa websocket y polling como respaldo
    reconnection: true,  // Habilita la reconexión automática
    reconnectionAttempts: 5, // Intenta reconectar 5 veces antes de fallar
    reconnectionDelay: 2000, // Espera 2 segundos antes de intentar reconectar
});

// Debug para verificar la conexión
socket.on("connect", () => {
    console.log("✅ Conectado a Socket.io en:", URL, "con ID:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.warn("⚠️ Desconectado de Socket.io:", reason);
});

socket.on("connect_error", (error) => {
    console.error("❌ Error de conexión con Socket.io:", error);
});