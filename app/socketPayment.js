import { io } from "socket.io-client";

const socket = io("http://localhost:3333", {
  autoConnect: false,
});

export default socket;
