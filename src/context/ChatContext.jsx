import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  // Estado local para los chats. Estructura: { [friendId]: [ { id, text, isMe, timestamp, type, songData } ] }
  const [chats, setChats] = useState({
    // Inicializamos con un mensaje de prueba para Carlos Ruiz (id: 1)
    1: [
      {
        id: 'msg-1',
        text: '¡Hola! ¿Qué andas escuchando?',
        isMe: false,
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    ]
  });

  const sendMessage = (friendId, text) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      isMe: true,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    setChats(prev => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMessage]
    }));
  };

  const shareSong = (friendId, songData) => {
    const newMessage = {
      id: Date.now().toString(),
      isMe: true,
      timestamp: new Date().toISOString(),
      type: 'song',
      songData
    };

    setChats(prev => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMessage]
    }));
  };

  return (
    <ChatContext.Provider value={{ chats, sendMessage, shareSong }}>
      {children}
    </ChatContext.Provider>
  );
};
