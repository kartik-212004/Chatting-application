'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useEffect, useRef, useState } from 'react';

import { useTheme } from 'next-themes';
import { useParams, useSearchParams } from 'next/navigation';

import { Moon, Sun } from 'lucide-react';
import { Copy, MoreVertical, Search, Send, Settings, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<{ name: string; payload: string }[]>([]);
  const { theme, setTheme } = useTheme();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'User';

  useEffect(() => {
    if (params.roomId) {
      setRoomId(String(params.roomId));
    }
  }, [params.roomId, name]);

  useEffect(() => {
    if (!params.roomId) return;

    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        // Send join message immediately after connection
        ws.current?.send(
          JSON.stringify({
            type: 'join',
            roomId: params.roomId,
            data: { name: name, payload: '' },
          })
        );
      };

      ws.current.onmessage = event => {
        const msg = JSON.parse(event.data);
        console.log('Received message:', msg);

        if (msg.type === 'chat') {
          setMessages(prev => [...prev, msg.data]);
        }

        // Handle user list updates
        if (msg.type === 'users') {
          console.log('Updated user list:', msg.data);
          setConnectedUsers(msg.data);
        }

        // Handle join confirmation
        if (msg.type === 'join' && msg.status === 'success') {
          console.log('Successfully joined room');
        }
      };

      ws.current.onerror = error => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = event => {
        console.log('WebSocket closed:', event.code, event.reason);
        // Attempt to reconnect after a delay
        if (event.code !== 1000) {
          // 1000 is normal closure
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [params.roomId, name]);

  const sendMessage = () => {
    if (!newMessage || !ws.current || ws.current.readyState !== WebSocket.OPEN)
      return;

    const message = {
      type: 'chat',
      roomId: params.roomId,
      data: { name, payload: newMessage },
    };

    ws.current.send(JSON.stringify(message));
    setMessages(prev => [...prev, message.data]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success(`${roomId} copied to clipboard`);
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className='h-screen from-background to-muted/20 flex'>
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
      {/* Sidebar */}
      <Card className='w-80 border-0 border-r rounded-none hidden md:block'>
        <CardHeader className='border-b p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Chat Room</h2>
              <p className='text-sm text-muted-foreground'>
                {connectedUsers.length} online
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          <ScrollArea className='h-[calc(100vh-5rem)]'>
            <div className='p-4 space-y-1'>
              {roomId && (
                <div className='mb-4'>
                  <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2'>
                    Room ID
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={copyRoomId}
                    className='w-full justify-between text-xs'
                  >
                    <span className='truncate'>{roomId}</span>
                    <Copy className='h-3 w-3 ml-2' />
                  </Button>
                </div>
              )}

              <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2'>
                Online - {connectedUsers.length}
              </div>
              {connectedUsers.map((user, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'
                >
                  <div className='relative'>
                    <Avatar className='w-8 h-8'>
                      <AvatarFallback className='text-xs bg-primary/10 text-primary'>
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background' />
                  </div>
                  <span className='text-sm font-medium'>{user}</span>
                  {user === name && (
                    <span className='text-xs text-muted-foreground'>(You)</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <Card className='border-0 border-b rounded-none'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4'>
            <div className='flex items-center gap-3'>
              <div className='md:hidden'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full'
                >
                  <Users className='h-5 w-5' />
                </Button>
              </div>
              <div>
                <h1 className='font-semibold text-lg'>Chat Room</h1>
                <p className='text-sm text-muted-foreground'>
                  {connectedUsers.length} members online
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-4 max-w-6xl mx-auto'>
            {messages.length === 0 ? (
              <div className='flex justify-center items-start h-64'>
                <p className='text-muted-foreground'>
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMyMessage = message.name === name;
                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMyMessage && (
                      <Avatar className='w-10 h-10'>
                        <AvatarFallback className='text-sm bg-primary/10 text-primary'>
                          {getInitials(message.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-md ${isMyMessage ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isMyMessage
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className='text-sm'>{message.payload}</p>
                      </div>
                      <div
                        className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                          isMyMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isMyMessage && (
                          <span className='font-medium'>{message.name}</span>
                        )}
                        <span>
                          {new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    {isMyMessage && (
                      <Avatar className='w-10 h-10'>
                        <AvatarFallback className='text-sm bg-primary text-primary-foreground'>
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <Card className='border-0 border-t rounded-none'>
          <CardContent className='p-4'>
            <div className='max-w-4xl mx-auto'>
              <div className='flex gap-3'>
                <Avatar className='w-10 h-10'>
                  <AvatarFallback className='text-sm bg-primary text-primary-foreground'>
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 flex gap-2'>
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='Type a message...'
                    className='flex-1 h-12 rounded-full'
                  />
                  <Button
                    onClick={sendMessage}
                    size='icon'
                    className='h-12 w-12 rounded-full'
                    disabled={!newMessage.trim()}
                  >
                    <Send className='h-5 w-5' />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
