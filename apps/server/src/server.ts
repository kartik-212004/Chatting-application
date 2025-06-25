import { WebSocketServer, WebSocket } from "ws";
const rooms: Record<string, WebSocket[]> = {};

interface Message {
  type: string;
  roomId: string;
  data: any;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    const parseMessage = JSON.parse(message.toString());
    const { type, roomId, data }: Message = parseMessage;
    if (type === "join") {
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      rooms[roomId].push(ws);
      console.log(`Client joined room ${roomId}`);
    }
    rooms[roomId]?.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, roomId, data }));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
