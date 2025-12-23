import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore, LobbyChatMessage } from '@/lib/gameStore';
import { cn } from '@/lib/utils';

export function LobbyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { lobbyChatMessages, sendLobbyChat, user } = useGameStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [lobbyChatMessages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (message.trim()) {
      sendLobbyChat(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) return '';
    try {
      return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const unreadCount = lobbyChatMessages.length > 0 && !isOpen ? lobbyChatMessages.length : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div 
          className="w-72 sm:w-80 bg-[#0f1d32]/95 backdrop-blur-md border border-[#3d4a5c] rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 duration-200"
          data-testid="container-lobby-chat"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#3d4a5c]">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#e07b39]" />
              <span className="text-sm font-medium text-gray-200">Chat da Sala</span>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="h-7 w-7"
              data-testid="button-close-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-60 overflow-y-auto p-3 space-y-2 scrollbar-hide">
            {lobbyChatMessages.length === 0 ? (
              <p className="text-center text-gray-500 text-xs mt-8">
                Nenhuma mensagem ainda...
              </p>
            ) : (
              lobbyChatMessages.map((msg: LobbyChatMessage) => {
                const isMe = msg.senderId === user?.uid;
                return (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] animate-in fade-in duration-200",
                      isMe ? "ml-auto items-end" : "items-start"
                    )}
                    data-testid={`message-${msg.id}`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={cn(
                        "text-[10px] font-medium",
                        isMe ? "text-[#e07b39]" : "text-gray-400"
                      )}>
                        {isMe ? 'Você' : msg.senderName}
                      </span>
                      <span className="text-[9px] text-gray-600">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className={cn(
                      "px-2.5 py-1.5 rounded-lg text-sm break-words",
                      isMe 
                        ? "bg-[#e07b39]/20 text-gray-100" 
                        : "bg-[#1a2a42] text-gray-200"
                    )}>
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex items-center gap-2 p-2 border-t border-[#3d4a5c]">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="flex-1 h-8 text-sm bg-[#1a2a42] border-[#3d4a5c] focus:border-[#e07b39] placeholder:text-gray-500"
              maxLength={200}
              data-testid="input-chat-message"
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!message.trim()}
              className="h-8 w-8 bg-[#e07b39] hover:bg-[#c96a2d] text-white"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-12 w-12 rounded-full bg-[#e07b39] hover:bg-[#c96a2d] text-white shadow-lg"
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}