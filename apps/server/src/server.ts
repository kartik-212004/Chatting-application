import { WebSocketServer, WebSocket } from 'ws';

const rooms: Record<string, { ws: WebSocket; name: string }[]> = {};

interface Message {
  type: string;
  roomId: string;
  data: {
    name: string;
    payload: string;
  };
}

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 8080 });

const broadcastUserList = (roomId: string) => {
  if (!rooms[roomId]) return;

  const userList = rooms[roomId].map(user => user.name);
  const userListMessage = JSON.stringify({
    type: 'users',
    roomId,
    data: userList,
  });

  rooms[roomId].forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(userListMessage);
    }
  });
};

const removeUserFromRoom = (ws: WebSocket) => {
  for (const roomId in rooms) {
    const userIndex = rooms[roomId].findIndex(user => user.ws === ws);
    if (userIndex !== -1) {
      const removedUser = rooms[roomId][userIndex];
      rooms[roomId].splice(userIndex, 1);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      } else {
        broadcastUserList(roomId);
      }

      console.log(`${removedUser.name} left room ${roomId}`);
      break;
    }
  }
};

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    const parseMessage = JSON.parse(message.toString());
    const { type, roomId, data }: Message = parseMessage;

    if (type === 'join') {
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      const existingUserIndex = rooms[roomId].findIndex(
        user => user.name === data.name
      );
      if (existingUserIndex !== -1) {
        rooms[roomId][existingUserIndex].ws = ws;
      } else {
        rooms[roomId].push({ ws, name: data.name });
      }

      console.log(`${data.name} joined room ${roomId}`);

      ws.send(
        JSON.stringify({
          type: 'join',
          roomId,
          data: { name: data.name, payload: `Welcome to room ${roomId}` },
          status: 'success',
        })
      );

      broadcastUserList(roomId);
    }

    if (type === 'chat') {
      rooms[roomId]?.forEach(({ ws: clientWs }) => {
        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type, roomId, data }));
        }
      });
      console.log(`[${data.name}] ${data.payload}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    removeUserFromRoom(ws);
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
    removeUserFromRoom(ws);
  });
});
