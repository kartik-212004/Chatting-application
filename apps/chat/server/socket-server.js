const { createServer } = require("http")
const { Server } = require("socket.io")

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
})

// Store rooms and users
const rooms = new Map()
const users = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId)

    // Store user info
    const userData = {
      id: socket.id,
      name: user.name,
      joinedAt: new Date(),
    }
    users.set(socket.id, userData)

    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set())
    }
    rooms.get(roomId).add(socket.id)

    // Get all users in room
    const roomUsers = Array.from(rooms.get(roomId)).map((userId) => users.get(userId))

    // Notify room about new user
    io.to(roomId).emit("user-joined", {
      user: userData,
      users: roomUsers,
    })

    console.log(`User ${user.name} joined room ${roomId}`)
  })

  socket.on("send-message", ({ roomId, message }) => {
    // Broadcast message to all users in room
    io.to(roomId).emit("new-message", message)
    console.log(`Message sent in room ${roomId}:`, message.text)
  })

  socket.on("typing", ({ roomId, user }) => {
    socket.to(roomId).emit("user-typing", { user })
  })

  socket.on("stop-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("user-stopped-typing", { user })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    const userData = users.get(socket.id)
    if (userData) {
      // Remove user from all rooms
      for (const [roomId, roomUsers] of rooms.entries()) {
        if (roomUsers.has(socket.id)) {
          roomUsers.delete(socket.id)

          // Get remaining users in room
          const remainingUsers = Array.from(roomUsers).map((userId) => users.get(userId))

          // Notify room about user leaving
          io.to(roomId).emit("user-left", {
            user: userData,
            users: remainingUsers,
          })

          // Clean up empty rooms
          if (roomUsers.size === 0) {
            rooms.delete(roomId)
            console.log(`Room ${roomId} deleted (empty)`)
          }
        }
      }

      users.delete(socket.id)
    }
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
