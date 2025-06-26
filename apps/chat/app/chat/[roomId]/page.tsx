"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Users, Moon, Sun, Settings, Search, MoreVertical } from "lucide-react"
import { useTheme } from "next-themes"

export default function ChatPage() {
  const { theme, setTheme } = useTheme()
  const [newMessage, setNewMessage] = useState("")

  // Static demo data
  const messages = [
    {
      id: "1",
      text: "Welcome to the chat room! 🎉",
      sender: "System",
      timestamp: "10:00 AM",
      type: "system",
    },
    {
      id: "2",
      text: "Hey everyone! How's your day going?",
      sender: "Sarah",
      timestamp: "10:15 AM",
      type: "message",
    },
    {
      id: "3",
      text: "Pretty good! Just finished a big project at work. What about you?",
      sender: "Mike",
      timestamp: "10:16 AM",
      type: "message",
    },
    {
      id: "4",
      text: "That's awesome! I'm working on some new designs today.",
      sender: "You",
      timestamp: "10:17 AM",
      type: "message",
    },
    {
      id: "5",
      text: "Nice! Are you a designer?",
      sender: "Sarah",
      timestamp: "10:18 AM",
      type: "message",
    },
    {
      id: "6",
      text: "Yes, I do UI/UX design. Love creating beautiful interfaces!",
      sender: "You",
      timestamp: "10:19 AM",
      type: "message",
    },
    {
      id: "7",
      text: "That's so cool! I'd love to see some of your work sometime.",
      sender: "Mike",
      timestamp: "10:20 AM",
      type: "message",
    },
    {
      id: "8",
      text: "Alex joined the chat",
      sender: "System",
      timestamp: "10:21 AM",
      type: "system",
    },
    {
      id: "9",
      text: "Hey everyone! What are we talking about?",
      sender: "Alex",
      timestamp: "10:21 AM",
      type: "message",
    },
  ]

  const users = [
    { id: "1", name: "You", status: "online", avatar: "Y" },
    { id: "2", name: "Sarah", status: "online", avatar: "S" },
    { id: "3", name: "Mike", status: "online", avatar: "M" },
    { id: "4", name: "Alex", status: "online", avatar: "A" },
    { id: "5", name: "Emma", status: "away", avatar: "E" },
    { id: "6", name: "John", status: "offline", avatar: "J" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex">
      {/* Sidebar */}
      <Card className="w-80 border-0 border-r rounded-none hidden md:block">
        <CardHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">General Chat</h2>
              <p className="text-sm text-muted-foreground">
                {users.filter((u) => u.status === "online").length} online
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="p-4 space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Online - {users.filter((u) => u.status === "online").length}
              </div>
              {users
                .filter((u) => u.status === "online")
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-background`}
                      />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                ))}

              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 mt-4">
                Away - {users.filter((u) => u.status === "away").length}
              </div>
              {users
                .filter((u) => u.status === "away")
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer opacity-60"
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-background`}
                      />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                ))}

              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 mt-4">
                Offline - {users.filter((u) => u.status === "offline").length}
              </div>
              {users
                .filter((u) => u.status === "offline")
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer opacity-40"
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-background`}
                      />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Card className="border-0 border-b rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Users className="h-5 w-5" />
                </Button>
              </div>
              <div>
                <h1 className="font-semibold text-lg">General Chat</h1>
                <p className="text-sm text-muted-foreground">
                  {users.filter((u) => u.status === "online").length} members online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
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
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                          {message.sender[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-md ${message.sender === "You" ? "order-first" : ""}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
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
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-sm bg-primary text-primary-foreground">Y</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm bg-primary/10 text-primary">S</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl px-4 py-3">
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
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Message Input */}
        <Card className="border-0 border-t rounded-none">
          <CardContent className="p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-sm bg-primary text-primary-foreground">Y</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
