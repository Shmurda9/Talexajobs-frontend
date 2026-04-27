import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

function GlobalChatListener() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let myId = null;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.id) myId = decoded.id;
      else if (decoded._id) myId = decoded._id;
      else if (decoded.userId) myId = decoded.userId;
    } catch (e) {
      return;
    }

    if (!myId) return;

    // Connect the global radar
    const socket = io("https://talexajobs.onrender.com", {
      transports: ['websocket', 'polling']
    });

    socket.emit("addUser", myId);

    // Listen for messages in the background
    socket.on("getMessage", (message) => {
      // SMART CHECK: Only show the global toast if they are NOT already on the Messages page!
      // (This prevents getting "double" notifications when you are already chatting)
      const currentPath = window.location.pathname.toLowerCase();
      if (!currentPath.includes('/message')) {
        toast.success("💬 You have a new message!");
      }
    });

    // Cleanup when they log out
    return () => {
      socket.disconnect();
    };
  }, []);

  // This component renders absolutely nothing to the screen. It is completely invisible!
  return null; 
}

export default GlobalChatListener;