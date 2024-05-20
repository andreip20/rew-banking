import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  autoConnect: false,
});

export const joinRoom = (userId) => {
  socket.emit("joinRoom", userId);
};

export default socket;
