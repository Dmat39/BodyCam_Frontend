import { io } from "socket.io-client"

const URL = import.meta.env.VITE_APP_ENDPOINT

export const socket = io(URL, {
    transports: ['websocket'],    
})