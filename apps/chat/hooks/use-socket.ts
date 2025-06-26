"use client"

import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"

// Configure your backend URL here
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    })

    const socket = socketRef.current

    socket.on("connect", () => {
      console.log("Connected to server")
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
  }
}
