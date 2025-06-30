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
    const code = randomstrting.generate({
      length: 6,
    });
    setRoomCode(code.toUpperCase());
  }
  function joinroom() {
    if (!name || !roomCode) {
      toast('Please enter your name and room code');
      return;
    }
    const ws = new WebSocket(`ws://localhost:8080`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join',
          roomId: roomCode,
          data: { name, payload: '' },
        })
      );
    };

    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.status === 'success') {
        toast(`Joined room ${message.roomId} as ${message.data.name}`);
        router.push(`/chat/${message.roomId}?name=${encodeURIComponent(name)}`);
      }
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };
  }

  return (
    <div className='min-h-screen dark:bg-black/20 from-background to-muted/20 flex items-center justify-center p-4'>
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
              <CardTitle className='text-2xl font-bold'>Real Time Chat</CardTitle>
              <CardDescription className='mt-2'>
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
  );
}
