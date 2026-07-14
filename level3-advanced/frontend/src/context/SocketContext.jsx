import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Same origin the REST API uses, without the /api suffix.
const SOCKET_URL = 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const token = localStorage.getItem('campuscart_token');
    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
    // Reconnect whenever the logged-in user changes (login/logout/switch account)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
