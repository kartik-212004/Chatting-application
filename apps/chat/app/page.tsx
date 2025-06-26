"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function HomePage() {
  const [name, setName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Real Time Chat</CardTitle>
              <CardDescription className="mt-2">temporary room that expires after all users exit</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-center"
            />

            <Button className="w-full h-12 text-base font-medium">Create New Room</Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or join existing</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="h-12 text-center uppercase"
                maxLength={6}
              />
              <Button className="h-12 px-6">Join Room</Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            <span>Rooms are temporary and secure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
