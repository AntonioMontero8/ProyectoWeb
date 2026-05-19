import { createContext, useContext, useState } from 'react';
import { mockFriendsData } from '../data/mockFriends';

const CommentsContext = createContext();

export const useComments = () => useContext(CommentsContext);

export const CommentsProvider = ({ children }) => {
  // Estructura: { [trackId]: [ { id, user, text, timestamp } ] }
  const [comments, setComments] = useState({
    // Fake comments para cualquier track que decidan abrir primero
    // O idealmente un ID específico, pero lo dejaremos vacío y que agreguen, 
    // O inyectar dinámicamente. Para simplicidad, empezaremos vacío pero con una función helper.
  });

  // Para simular que ya hay comentarios, si una canción no tiene, le metemos uno fake
  const getCommentsForEntity = (entityId) => {
    if (!comments[entityId]) {
      const fakeComments = [
        {
          id: `fake-1-${entityId}`,
          user: mockFriendsData[0], // Carlos
          text: "¡Esta canción es una locura total! 🔥",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: `fake-2-${entityId}`,
          user: mockFriendsData[1], // Ana
          text: "La he escuchado como 10 veces hoy sin parar",
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ];
      // Lo guardamos en el estado para que sea persistente si agregan más
      setComments(prev => ({...prev, [entityId]: fakeComments}));
      return fakeComments;
    }
    return comments[entityId];
  };

  const addComment = (entityId, user, text) => {
    const newComment = {
      id: Date.now().toString(),
      user: {
        id: 'me',
        name: user.name || 'Yo',
        avatar: user.picture || 'https://i.pravatar.cc/150?img=68'
      },
      text,
      timestamp: new Date().toISOString()
    };

    setComments(prev => {
      const existing = prev[entityId] || [];
      return {
        ...prev,
        [entityId]: [...existing, newComment]
      };
    });
  };

  return (
    <CommentsContext.Provider value={{ getCommentsForEntity, addComment }}>
      {children}
    </CommentsContext.Provider>
  );
};
