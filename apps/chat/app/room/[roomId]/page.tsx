"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Copy, Users, Moon, Sun, Wifi } from "lucide-react"
import { useTheme } from "next-themes"

export default function ChatRoom() {
  const params = useParams()
  const { theme, setTheme } = useTheme()
  const [newMessage, setNewMessage] = useState("")
  const roomId = params.roomId as string

  // Static demo data
  const messages = [
    {
      id: "1",
      text: "Alice joined the room",
      sender: "System",
      timestamp: "2:30 PM",
      type: "system",
    },
    {
      id: "2",
      text: "Hey everyone! 👋",
      sender: "Alice",
      timestamp: "2:31 PM",
      type: "message",
    },
    {
      id: "3",
      text: "Bob joined the room",
      sender: "System",
      timestamp: "2:32 PM",
      type: "system",
    },
    {
      id: "4",
      text: "Hello! How's everyone doing?",
      sender: "Bob",
      timestamp: "2:32 PM",
      type: "message",
    },
    {
      id: "5",
      text: "Great! Just working on some projects. What about you?",
      sender: "You",
      timestamp: "2:33 PM",
      type: "message",
    },
  ]

  const users = [
    { id: "1", name: "Alice", joinedAt: "2:30 PM" },
    { id: "2", name: "Bob", joinedAt: "2:32 PM" },
    { id: "3", name: "You", joinedAt: "2:29 PM" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
      {/* Header */}
      <Card className="border-0 border-b rounded-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Room {roomId}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wifi className="w-4 h-4 text-green-500" />
                <span>Connected</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Copy className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Copy Link</span>
            </Button>

            <div className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{users.length}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === "system" ? (
                    <div className="flex justify-center">
                      <Badge variant="secondary" className="text-xs">
                        {message.text}
                      </Badge>
                    </div>
                  ) : (
                    <div className={`flex gap-3 ${message.sender === "You" ? "justify-end" : "justify-start"}`}>
                      {message.sender !== "You" && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(message.sender)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${message.sender === "You" ? "order-first" : ""}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            message.sender === "You" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div
                          className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                            message.sender === "You" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.sender !== "You" && <span className="font-medium">{message.sender}</span>}
                          <span>{message.timestamp}</span>
                        </div>
                      </div>
                      {message.sender === "You" && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {getInitials(message.sender)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span>Alice is typing...</span>
              </div>
            </div>
          </ScrollArea>

          {/* Message Input */}
          <Card className="border-0 border-t rounded-none">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-12 rounded-full"
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-full">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Sidebar */}
        <Card className="w-64 border-0 border-l rounded-none hidden lg:block">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h3 className="font-semibold">Online ({users.length})</h3>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-2 p-4 pt-0">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                        {user.name === "You" && <span className="text-muted-foreground ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Joined {user.joinedAt}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
