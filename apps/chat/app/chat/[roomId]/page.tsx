'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'User';

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    
    // Scroll to bottom after sending message
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success(`Room ID ${roomId} copied to clipboard!`, {
        duration: 2000,
        position: 'bottom-center',
      });
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className='mobile-vh flex flex-col bg-gradient-to-br from-background to-muted/20'>
      {/* Mobile Header */}
      <div className='md:hidden flex-shrink-0'>
        <Card className='border-0 border-b rounded-none'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4'>
            <div className='flex items-center gap-3'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='rounded-full'>
                    <Users className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-80'>
                  <SheetHeader>
                    <SheetTitle className='font-satoshi font-medium'>Chat Room</SheetTitle>
                    <SheetDescription className='font-light'>
                      {connectedUsers.length} members online
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className='mt-6 space-y-4'>
                    {roomId && (
                      <div>
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

                    <div>
                      <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2'>
                        Online - {connectedUsers.length}
                      </div>
                      <div className='space-y-1'>
                        {connectedUsers.map((user, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors'
                          >
                            <div className='relative'>
                              <Avatar className='w-8 h-8'>
                                <AvatarFallback className='text-xs bg-primary/10 text-primary'>
                                  {getInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background' />
                            </div>
                            <span className='text-sm font-medium font-satoshi'>{user}</span>
                            {user === name && (
                              <span className='text-xs text-muted-foreground font-light'>(You)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <div>
                <h1 className='font-semibold text-lg'>Chat Room</h1>
                <p className='text-sm text-muted-foreground'>
                  {connectedUsers.length} online
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='rounded-full'>
                  <MoreVertical className='h-5 w-5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={copyRoomId}>
                  <Copy className='h-4 w-4 mr-2' />
                  Copy Room ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? (
                    <>
                      <Sun className='h-4 w-4 mr-2' />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className='h-4 w-4 mr-2' />
                      Dark Mode
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
        </Card>
      </div>

      <div className='flex flex-1 overflow-hidden min-h-0'>
        {/* Desktop Sidebar */}
        <Card className='w-80 border-0 border-r rounded-none hidden md:block flex-shrink-0'>
          <CardHeader className='border-b p-4'>          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-medium font-satoshi'>Chat Room</h2>
              <p className='text-sm text-muted-foreground font-light'>
                {connectedUsers.length} online
              </p>
            </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className='h-8 w-8'
                >
                  {theme === 'dark' ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
                </Button>
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
                    <span className='text-sm font-medium font-satoshi'>{user}</span>
                    {user === name && (
                      <span className='text-xs text-muted-foreground font-light'>(You)</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <div className='flex-1 flex flex-col overflow-hidden min-h-0'>
          {/* Desktop Header */}
          <Card className='border-0 border-b rounded-none hidden md:block flex-shrink-0'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4'>
              <div>
                <h1 className='font-medium text-lg font-satoshi'>Chat Room</h1>
                <p className='text-sm text-muted-foreground font-light'>
                  {connectedUsers.length} online
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <div className='flex-1 overflow-hidden min-h-0'>
            <ScrollArea className='h-full p-3 md:p-4'>
              <div className='space-y-4 max-w-4xl mx-auto'>
                {messages.length === 0 ? (
                  <div className='flex justify-center items-center h-64'>
                    <p className='text-muted-foreground text-center'>
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isMyMessage = message.name === name;
                      return (
                        <div
                          key={index}
                          className={`flex gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMyMessage && (
                            <Avatar className='w-8 h-8 md:w-10 md:h-10'>
                              <AvatarFallback className='text-xs md:text-sm bg-primary/10 text-primary'>
                                {getInitials(message.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[80%] md:max-w-md ${isMyMessage ? 'order-first' : ''}`}>
                            <div
                              className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                                isMyMessage
                                  ? 'bg-primary text-primary-foreground ml-auto'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className='text-sm font-normal'>{message.payload}</p>
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
                            <Avatar className='w-8 h-8 md:w-10 md:h-10'>
                              <AvatarFallback className='text-xs md:text-sm bg-primary text-primary-foreground'>
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                    {/* Scroll target */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Message Input */}
          <Card className='border-0 border-t rounded-none flex-shrink-0'>
            <CardContent className='p-3 md:p-4 pb-safe'>
              <div className='max-w-4xl mx-auto'>
                <div className='flex gap-2 md:gap-3'>
                  <Avatar className='w-8 h-8 md:w-10 md:h-10 flex-shrink-0'>
                    <AvatarFallback className='text-xs md:text-sm bg-primary text-primary-foreground'>
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 flex gap-2'>
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Type a message...'
                      className='flex-1 h-10 md:h-12 rounded-full text-base'
                      autoComplete='off'
                      autoCorrect='off'
                      spellCheck='false'
                    />
                    <Button
                      onClick={sendMessage}
                      size='icon'
                      className='h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0'
                      disabled={!newMessage.trim()}
                    >
                      <Send className='h-4 w-4 md:h-5 md:w-5' />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
