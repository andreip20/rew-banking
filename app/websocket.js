const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("livePayments", (payload, callback) => {
    console.log("Received livePayments event:", payload);
    io.emit("livePayments", payload);

    if (callback) {
      callback({ status: "received" });
    }
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3333, () => {
  console.log("WebSocket server running on port 3333");
});

module.exports = io;
