'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useState } from 'react';

import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import { MessageCircleMore } from 'lucide-react';
import { Moon, Sun, Users } from 'lucide-react';
import randomstrting from 'randomstring';
import { toast } from 'sonner';

export default function HomePage() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  function generateRoomCode() {
    if (!name.trim()) {
      toast.error('Please enter your name first', {
        duration: 3000,
      });
      return;
    }
    const code = randomstrting.generate({
      length: 6,
      charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    });
    const generatedCode = code.toUpperCase();
    setRoomCode(generatedCode);
    
    // Automatically join the room after generating
    setTimeout(() => {
      joinRoomWithCode(generatedCode);
    }, 100);
  }

  function joinRoomWithCode(code: string) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join',
          roomId: code,
          data: { name, payload: '' },
        })
      );
    };

    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.status === 'success') {
        toast.success(`Joined room ${message.roomId} as ${message.data.name}`, {
          duration: 2000,
        });
        router.push(`/chat/${message.roomId}?name=${encodeURIComponent(name)}`);
      }
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
      toast.error('Failed to connect to chat server', {
        duration: 3000,
      });
    };
  }

  function joinroom() {
    if (!name || !roomCode) {
      toast.error('Please enter your name and room code', {
        duration: 3000,
      });
      return;
    }
    joinRoomWithCode(roomCode);
  }

  return (
    <div className='h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 overflow-hidden'>
      {/* Desktop Layout */}
      <div className='hidden md:flex md:items-center md:justify-center md:p-4 w-full h-full'>
        <div className='absolute top-4 right-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='rounded-full'
          >
            {theme === 'dark' ? (
              <Sun className='h-5 w-5' />
            ) : (
              <Moon className='h-5 w-5' />
            )}
          </Button>
        </div>

        <div className='w-full max-w-md'>
          <Card className='shadow-lg'>
            <CardHeader className='text-center space-y-4'>
              <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
                <MessageCircleMore className='w-8 h-8 text-primary' />
              </div>
              <div>
                <CardTitle className='text-2xl font-semibold font-clash'>Real Time Chat</CardTitle>
                <CardDescription className='mt-2 font-light'>
                  temporary room that expires after all users exit
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className='space-y-6'>
              <Input
                placeholder='Enter your name'
                value={name}
                onChange={e => setName(e.target.value)}
                className='h-12 text-center'
              />

              <Button
                onClick={() => {
                  generateRoomCode();
                }}
                className='w-full h-12 text-base font-medium'
                disabled={!name.trim()}
              >
                Create New Room
              </Button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-card px-2 text-muted-foreground'>
                    Or join existing
                  </span>
                </div>
              </div>

              <div className='flex gap-2'>
                <Input
                  placeholder='Enter Room Code'
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  className='h-12 text-center uppercase'
                  maxLength={6}
                />
                <Button
                  onClick={() => joinroom()}
                  className='h-12 px-6'
                  disabled={!name.trim() || !roomCode.trim()}
                >
                  Join Room
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className='text-center mt-6 text-sm text-muted-foreground'>
            <div className='flex items-center justify-center gap-2'>
              <Users className='w-4 h-4' />
              <span>Rooms are temporary and secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Full Screen */}
      <div className='md:hidden w-full h-full flex flex-col'>
        <div className='absolute top-4 right-4 z-10'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='rounded-full bg-background/80 backdrop-blur-sm'
          >
            {theme === 'dark' ? (
              <Sun className='h-5 w-5' />
            ) : (
              <Moon className='h-5 w-5' />
            )}
          </Button>
        </div>

        <div className='flex-1 flex flex-col justify-center p-6'>
          <div className='text-center space-y-4'>
            <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <MessageCircleMore className='w-8 h-8 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-medium font-clash'>Real Time Chat</h1>
              <p className='text-sm text-muted-foreground mt-2 font-light'>
                temporary room that expires after all users exit
              </p>
            </div>
          </div>

          <div className='space-y-5 mt-8'>
            <Input
              placeholder='Enter your name'
              value={name}
              onChange={e => setName(e.target.value)}
              className='h-12 text-center text-base font-normal'
            />

            <Button
              onClick={() => {
                generateRoomCode();
              }}
              className='w-full h-12 text-base font-medium'
              disabled={!name.trim()}
            >
              Create New Room
            </Button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-4 text-muted-foreground font-normal'>
                  Or join existing
                </span>
              </div>
            </div>

            <div className='flex gap-3'>
              <Input
                placeholder='Room Code'
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                className='h-12 text-center uppercase text-base font-mono font-normal'
                maxLength={6}
              />
              <Button
                onClick={() => joinroom()}
                className='h-12 px-6 text-base font-medium'
                disabled={!name.trim() || !roomCode.trim()}
              >
                Join
              </Button>
            </div>
          </div>

          <div className='text-center mt-6 text-muted-foreground'>
            <div className='flex items-center justify-center gap-2'>
              <Users className='w-4 h-4' />
              <span className='text-sm font-light'>Rooms are temporary and secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
