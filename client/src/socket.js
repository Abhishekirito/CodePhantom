import io from 'socket.io-client';

// Connect to your backend URL
export const socket = io.connect("https://codephantom-backend.onrender.com");
