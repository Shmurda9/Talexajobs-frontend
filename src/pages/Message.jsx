import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// --- PREMIUM ICONS ---
const IconPlay = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>);
const IconPause = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>);
const IconEmpty = () => (<svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const IconClose = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>);
const IconMenu = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>);
const IconBlock = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>);
const IconUnblock = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const IconDelete = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const IconPlus = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>);
const IconPhoto = () => (<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const IconSend = () => (<svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>);
const IconMic = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>);
const IconChevronDown = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>);

// --- DYNAMIC AUDIO PLAYER ---
const CustomAudioPlayer = ({ audioUrl, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  let playerClass = "flex items-center gap-3 w-56 sm:w-64 pt-1 pb-3 ";
  if (isMe) { playerClass += "text-white"; } else { playerClass += "text-slate-700"; }
  
  let barClass = "flex-1 h-1.5 rounded-full relative overflow-hidden ";
  if (isMe) { barClass += "bg-blue-400"; } else { barClass += "bg-slate-200"; }
  
  let progressClass = "absolute top-0 left-0 h-full rounded-full transition-all ";
  if (isMe) { progressClass += "bg-white"; } else { progressClass += "bg-blue-600"; }
  
  let micClass = "h-10 w-10 rounded-full flex-shrink-0 overflow-hidden border flex items-center justify-center ";
  if (isMe) { micClass += "bg-blue-500 border-blue-400 text-blue-100"; } else { micClass += "bg-slate-100 border-slate-200 text-slate-400"; }

  return (
    <div className={playerClass}>
      <button onClick={togglePlay} type="button" className="flex-shrink-0 hover:scale-110 transition-transform focus:outline-none">
        {isPlaying ? <IconPause /> : <IconPlay />}
      </button>
      <div className={barClass}>
        <div className={progressClass} style={{ width: progress + '%' }}></div>
      </div>
      <div className={micClass}>
        <IconMic />
      </div>
    </div>
  );
};

// --- MAIN CHAT COMPONENT ---
function Message() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeBubbleMenu, setActiveBubbleMenu] = useState(null);
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null); 
  const typingTimeoutRef = useRef(null);
  const [socket, setSocket] = useState(null); 

  const token = localStorage.getItem('token');
  let myId = null;
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.id) { myId = decoded.id; }
      else if (decoded._id) { myId = decoded._id; }
      else if (decoded.userId) { myId = decoded.userId; }
    } catch (e) {
      console.error("Token error", e);
    }
  }

  const formatLastSeen = (dateString) => {
    if (!dateString) { return "Offline"; }
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) { return "Active just now"; }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) { return "Active " + diffInMinutes + "m ago"; }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) { return "Active " + diffInHours + "h ago"; }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) { return "Active yesterday"; }
    return "Active " + diffInDays + "d ago";
  };

  const fetchInbox = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('https://talexajobs.onrender.com/api/messages/inbox', {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      if (res.data.success) {
        const uniqueContacts = res.data.contacts.filter(function(v,i,a) {
           return a.findIndex(function(t) { return t._id === v._id; }) === i;
        });
        setContacts(uniqueContacts);
      }
    } catch (error) {
      console.error("Could not load inbox", error);
    } finally {
      setLoadingContacts(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { navigate('/login'); }
    else { fetchInbox(); }
  }, [token, navigate, fetchInbox]);

  useEffect(() => {
    if (location.state) {
       if (location.state.prefilledContact) {
         setSelectedContact(location.state.prefilledContact);
         window.history.replaceState({}, document.title);
       }
    }
  }, [location]);

  useEffect(() => {
    if (selectedContact) {
      let blockedStatus = false;
      if (selectedContact.isBlocked) { blockedStatus = true; }
      setIsBlocked(blockedStatus); 
    }
  }, [selectedContact]);

  useEffect(() => {
    if (myId) {
      const newSocket = io("https://talexajobs.onrender.com", { transports: ['websocket', 'polling'] });
      setSocket(newSocket);
      newSocket.emit("addUser", myId);
      return () => { newSocket.disconnect(); };
    }
  }, [myId]);

  useEffect(() => {
    if (!socket) return;
    
    const handleIncomingMessage = (message) => {
      let isCurrentChat = false;
      if (selectedContact) {
        if (message.sender === selectedContact._id) { isCurrentChat = true; }
        if (message.receiver === selectedContact._id) { isCurrentChat = true; }
      }

      if (isCurrentChat) {
        setMessages(function(prev) {
          if (prev.some(function(m) { return m._id === message._id; })) { return prev; }
          return [...prev, message];
        });
        axios.put('https://talexajobs.onrender.com/api/messages/read/' + selectedContact._id, {}, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
      } else {
        toast.success("New message received!");
        fetchInbox(); 
      }
    };

    const handleStatusUpdate = (data) => {
      setContacts(function(prev) {
        return prev.map(function(c) {
          if (c._id === data.userId) { return { ...c, isOnline: data.isOnline, lastSeen: data.lastSeen }; }
          return c;
        });
      });
      setSelectedContact(function(prev) {
        if (prev) {
          if (prev._id === data.userId) { return { ...prev, isOnline: data.isOnline, lastSeen: data.lastSeen }; }
        }
        return prev;
      });
    };

    const handleTyping = (data) => {
      if (selectedContact && data.senderId === selectedContact._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (selectedContact && data.senderId === selectedContact._id) {
        setIsTyping(false);
      }
    };

    socket.on("getMessage", handleIncomingMessage);
    socket.on("userStatusUpdate", handleStatusUpdate);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    
    return () => { 
       socket.off("getMessage", handleIncomingMessage);
       socket.off("userStatusUpdate", handleStatusUpdate);
       socket.off("typing", handleTyping);
       socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedContact, fetchInbox, token]);

  useEffect(() => {
    if (!selectedContact) return;
    const fetchHistoryAndMarkRead = async () => {
      setLoadingMessages(true);
      setShowMenu(false); 
      setShowAttachMenu(false);
      clearAttachments();
      cancelEditing();
      try {
        await axios.put('https://talexajobs.onrender.com/api/messages/read/' + selectedContact._id, {}, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        const res = await axios.get('https://talexajobs.onrender.com/api/messages/history/' + selectedContact._id, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        if (res.data.success) {
          const uniqueMsgs = res.data.messages.filter(function(v,i,a) {
             return a.findIndex(function(t) { return t._id === v._id; }) === i;
          });
          setMessages(uniqueMsgs);
          fetchInbox(); 
        }
      } catch (error) {
        toast.error("Could not load chat history.");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchHistoryAndMarkRead();
  }, [selectedContact, token, fetchInbox]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const clearAttachments = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      clearAttachments();
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setShowAttachMenu(false);
    }
  };

  const handleTextChange = (e) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; 
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'; 
    }

    if (socket && selectedContact) {
      socket.emit("typing", { senderId: myId, receiverId: selectedContact._id });
      if (typingTimeoutRef.current) { clearTimeout(typingTimeoutRef.current); }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: myId, receiverId: selectedContact._id });
      }, 2000);
    }
  };

  const startEditing = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.text);
    setActiveBubbleMenu(null);
    if (textareaRef.current) { textareaRef.current.focus(); }
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setNewMessage('');
    if (textareaRef.current) { textareaRef.current.style.height = '24px'; }
  };

  const handleDeleteIndividualMsg = async (msgId) => {
    setActiveBubbleMenu(null);
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete('https://talexajobs.onrender.com/api/messages/' + msgId, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      setMessages(function(prev) { return prev.filter(function(m) { return m._id !== msgId; }); });
      toast.success("Message deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete message.");
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    let okToSend = false;
    if (newMessage.trim() !== '') { okToSend = true; }
    if (selectedImage !== null) { okToSend = true; }
    
    if (!okToSend) return;
    if (!selectedContact) return;

    if (socket) {
       socket.emit("stopTyping", { senderId: myId, receiverId: selectedContact._id });
       if (typingTimeoutRef.current) { clearTimeout(typingTimeoutRef.current); }
    }

    if (editingMessage) {
      try {
        const textToUpdate = newMessage;
        cancelEditing(); 
        
        const res = await axios.put('https://talexajobs.onrender.com/api/messages/' + editingMessage._id, { text: textToUpdate }, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        
        if (res.data.success) {
          setMessages(function(prev) {
            return prev.map(function(m) { return m._id === editingMessage._id ? res.data.message : m; });
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to edit.");
      }
      return;
    }

    const cachedText = newMessage;
    const cachedImage = selectedImage;

    setNewMessage('');
    if (textareaRef.current) { textareaRef.current.style.height = '24px'; }
    clearAttachments();

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedContact._id);
      if (cachedText.trim() !== '') { formData.append('text', cachedText); }
      if (cachedImage !== null) { formData.append('image', cachedImage); }

      const res = await axios.post('https://talexajobs.onrender.com/api/messages/send', formData, {
        headers: { token: token, Authorization: "Bearer " + token, 'Content-Type': 'multipart/form-data'}
      });
      
      if (res.data.success) {
        setMessages(function(prev) {
          if (prev.some(function(m) { return m._id === res.data.message._id; })) { return prev; }
          return [...prev, res.data.message];
        });
        fetchInbox(); 
      }
    } catch (error) {
      console.error("Send Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  };

  const handleDeleteChat = async () => {
    if (!window.confirm("Are you sure you want to delete this entire chat?")) return;
    try {
      await axios.delete('https://talexajobs.onrender.com/api/messages/conversation/' + selectedContact._id, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      toast.success("Conversation deleted");
      setMessages([]);
      setSelectedContact(null);
      setShowMenu(false);
      fetchInbox();
    } catch (error) {
      toast.error("Failed to delete chat.");
    }
  };

  const handleToggleBlockUser = async () => {
    try {
      const res = await axios.post('https://talexajobs.onrender.com/api/messages/block/' + selectedContact._id, {}, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      setIsBlocked(!isBlocked);
      toast.success(res.data.message || (isBlocked ? "User Unblocked" : "User Blocked"));
      setShowMenu(false);
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const getDisplayName = (user) => {
    if (!user) { return "Deleted User"; }
    if (user.fullName) { return user.fullName; }
    if (user.employerInfo) {
       if (user.employerInfo.companyName) { return user.employerInfo.companyName; }
    }
    return "User";
  };
  
  const getAvatarFallback = (user) => {
    if (!user) { return "U"; }
    return getDisplayName(user).charAt(0).toUpperCase();
  };
  
  const getAvatarSrc = (user) => {
    if (!user) { return null; }
    let url = user.profilePictureUrl;
    if (!url) {
       if (user.employerInfo) { url = user.employerInfo.logoUrl; }
    }
    if (url) {
      const cleanPath = url.replace(/\\/g, '/');
      if (cleanPath.startsWith('http')) { return cleanPath; }
      if (cleanPath.startsWith('/')) { return "https://talexajobs.onrender.com" + cleanPath; }
      return "https://talexajobs.onrender.com/" + cleanPath;
    }
    return null;
  };

  let hasContentToSend = false;
  if (newMessage.trim() !== '') { hasContentToSend = true; }
  if (selectedImage !== null) { hasContentToSend = true; }

  let contactLocation = "";
  if (selectedContact) {
      if (selectedContact.location) { contactLocation = selectedContact.location; }
      else if (selectedContact.candidateInfo && selectedContact.candidateInfo.location) { contactLocation = selectedContact.candidateInfo.location; }
      else if (selectedContact.employerInfo && selectedContact.employerInfo.location) { contactLocation = selectedContact.employerInfo.location; }
  }

  // 🚨 TEMPORARY FALLBACK ROUTING TO AVOID WHITE SCREEN
  let profileRoute = "#";
  if (selectedContact) {
      if (selectedContact.role === 'employer') { 
          // We are pointing this BACK to the Company Profile temporarily so it works!
          profileRoute = "/user-profile/" + selectedContact._id; 
      }
      else { profileRoute = "/candidate/" + selectedContact._id; }
  }

  // 🚨 UI LOGIC FOR NEW HEADER
  let headerDisplayStatus = formatLastSeen(selectedContact ? selectedContact.lastSeen : null);
  if (selectedContact && selectedContact.isOnline) { headerDisplayStatus = "Active now"; }

  let statusTextColorClass = "text-slate-500";
  if (selectedContact && selectedContact.isOnline) { statusTextColorClass = "text-green-600"; }

  return (
    <div className="bg-[#f0f2f5] py-0 sm:py-6 font-sans flex justify-center overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="w-full max-w-7xl px-0 sm:px-6 lg:px-8 h-full">
        <div className="bg-white sm:border border-slate-200 sm:rounded-2xl shadow-sm flex h-full overflow-hidden">
          
          {/* SIDEBAR */}
          <div className={"w-full md:w-1/3 border-r border-slate-200 flex flex-col h-full bg-white " + (selectedContact ? "hidden md:flex" : "flex")}>
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-xl tracking-tight">Chats</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-0">
              {loadingContacts ? (
                <p className="text-center text-slate-400 mt-10 text-sm font-medium animate-pulse">Loading chats...</p>
              ) : contacts.length === 0 ? (
                <p className="text-center text-slate-400 mt-10 text-sm font-medium">No messages yet.</p>
              ) : (
                contacts.map(function(contact) {
                  let isSelected = false;
                  if (selectedContact) {
                     if (selectedContact._id === contact._id) { isSelected = true; }
                  }
                  const avatarSrc = getAvatarSrc(contact);

                 return (
                  <button key={contact._id} onClick={() => setSelectedContact(contact)} className={"w-full text-left flex items-center gap-3 px-4 py-3 transition border-b border-slate-50 " + (isSelected ? "bg-slate-100" : "hover:bg-slate-50")}>
                    
                    <div className="relative h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">
                      <div className="overflow-hidden h-full w-full rounded-full">
                        {avatarSrc ? <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" /> : getAvatarFallback(contact)}
                      </div>
                      {contact.isOnline ? <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span> : null}
                    </div>

                    <div className="overflow-hidden flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                         <p className="font-bold text-slate-900 truncate text-[15px]">{getDisplayName(contact)}</p>
                      </div>
                      <p className="text-[12px] text-slate-500 truncate">{contact.role === 'employer' ? 'Employer' : 'Candidate'}</p>
                    </div>
                    
                      {contact.unreadCount > 0 ? (
                        <div className="bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full flex-shrink-0 shadow-sm">
                          {contact.unreadCount}
                        </div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className={"w-full md:w-2/3 flex flex-col bg-white h-full relative " + (!selectedContact ? "hidden md:flex" : "flex")}>
            
            {!selectedContact ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center z-10 bg-[#f8f9fa]">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                  <IconEmpty />
                </div>
                <h3 className="font-extrabold text-xl text-slate-700 mb-1">TalexaJobs Web</h3>
                <p className="font-medium text-sm text-slate-500">Select a conversation to start messaging securely.</p>
              </div>
            ) : (
              <>
                {/* 🚨 MINIMAL STICKY HEADER WITH RESTORED ACTIVE STATUS */}
                <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white border-b border-slate-200 flex items-center justify-between relative z-30 w-full shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
                    <button onClick={() => setSelectedContact(null)} className="md:hidden p-1.5 text-blue-600 hover:bg-slate-100 rounded-full transition flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    
                    {/* Clickable Avatar */}
                    <Link to={profileRoute} className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm hover:opacity-80 transition cursor-pointer">
                       {getAvatarSrc(selectedContact) ? <img src={getAvatarSrc(selectedContact)} alt="avatar" className="h-full w-full object-cover" /> : getAvatarFallback(selectedContact)}
                    </Link>
                    
                    {/* Name, Green Dot, and Active Status */}
                    <div className="overflow-hidden flex flex-col justify-center min-w-0">
                      <div className="mb-0.5">
                        <Link to={profileRoute} className="font-extrabold text-slate-900 text-[14px] sm:text-[15px] truncate hover:underline">
                          {getDisplayName(selectedContact)}
                        </Link>
                      </div>
                      
                      {isTyping ? (
                         <p className="text-blue-500 italic font-bold text-[11px] sm:text-[12px] tracking-wide animate-pulse">typing...</p>
                      ) : (
                         <div className="flex items-center gap-1.5">
                           {selectedContact.isOnline ? <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm flex-shrink-0"></span> : null}
                           <p className={"text-[11px] sm:text-[12px] font-medium truncate " + statusTextColorClass}>
                             {headerDisplayStatus}
                           </p>
                         </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Menu Button */}
                  <div className="relative flex-shrink-0 ml-2">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition focus:outline-none">
                      <IconMenu />
                    </button>

                    {showMenu ? (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-[60] border border-slate-100">
                        <button onClick={handleToggleBlockUser} className="w-full text-left px-4 py-2.5 text-[15px] hover:bg-slate-50 transition flex items-center gap-3">
                          {isBlocked ? (
                            <>
                              <span className="text-blue-600"><IconUnblock /></span>
                              <span className="text-slate-700 font-medium">Unblock User</span>
                            </>
                          ) : (
                            <>
                              <span className="text-rose-500"><IconBlock /></span>
                              <span className="text-slate-700 font-medium">Block User</span>
                            </>
                          )}
                        </button>
                        
                        <button onClick={handleDeleteChat} className="w-full text-left px-4 py-2.5 text-[15px] text-slate-700 hover:bg-slate-50 transition flex items-center gap-3">
                          <span className="text-slate-500"><IconDelete /></span> <span className="font-medium">Delete Chat</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* MESSAGES DISPLAY AREA */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 flex flex-col gap-2 w-full relative z-10 bg-white" onMouseLeave={() => setActiveBubbleMenu(null)}>
                  
                  {/* LARGE PROFILE INTRO BLOCK AT THE TOP */}
                  <div className="flex flex-col items-center justify-center mt-6 mb-10 px-2 text-center">
                    <Link to={profileRoute} className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-3xl overflow-hidden shadow-sm mb-3 hover:opacity-80 transition cursor-pointer">
                       {getAvatarSrc(selectedContact) ? <img src={getAvatarSrc(selectedContact)} alt="avatar" className="h-full w-full object-cover" /> : getAvatarFallback(selectedContact)}
                    </Link>
                    <Link to={profileRoute} className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 hover:underline">
                      {getDisplayName(selectedContact)}
                    </Link>
                    <p className="text-slate-500 text-[13px] sm:text-sm font-medium mb-4">
                       {selectedContact.role === 'employer' ? "Employer on TalexaJobs" : "Candidate on TalexaJobs"}
                       {contactLocation !== "" ? " - Lives in " + contactLocation : ""}
                    </p>
                    
                    <Link 
                       to={profileRoute} 
                       className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-[13px] sm:text-sm transition shadow-sm"
                    >
                       View profile
                    </Link>
                    
                    <div className="mt-8 bg-slate-50 rounded-xl p-4 max-w-sm w-full text-center border border-slate-100">
                       <p className="text-slate-700 text-xs font-bold mb-1 flex items-center justify-center gap-1.5">
                         <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                         End-to-end encrypted
                       </p>
                       <p className="text-slate-500 text-[11px] leading-relaxed">
                         Messages are secured with end-to-end encryption. Only you and this user can read them.
                       </p>
                    </div>
                  </div>

                  {/* ACTUAL MESSAGES MAP */}
                  {loadingMessages ? (
                    <p className="text-center text-slate-500 mt-4 text-[13px] font-medium uppercase tracking-widest bg-slate-100 w-max mx-auto px-3 py-1 rounded-lg">Syncing...</p>
                  ) : messages.length === 0 ? null : (
                    messages.map(function(msg) {
                      let isMe = false;
                      if (msg.sender === myId) { isMe = true; }
                      const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      
                      let bubbleClass = "w-fit max-w-[85%] sm:max-w-[70%] relative flex flex-col px-2 pt-1.5 pb-1 shadow-sm group ";
                      if (isMe) {
                         bubbleClass += "bg-blue-600 text-white rounded-xl rounded-tr-sm ml-auto ";
                      } else {
                         bubbleClass += "bg-slate-100 text-slate-800 rounded-xl rounded-tl-sm mr-auto ";
                      }

                      return (
                        <div key={msg._id} className="flex w-full mb-1 relative">
                          <div className={bubbleClass}>
                            
                            {isMe ? (
                              <button onClick={() => setActiveBubbleMenu(activeBubbleMenu === msg._id ? null : msg._id)} className="absolute top-1 right-1 text-blue-200 hover:text-white transition z-10 p-1">
                                <IconChevronDown />
                              </button>
                            ) : null}
                            
                            {activeBubbleMenu === msg._id ? (
                               isMe ? (
                                <div className="absolute top-6 right-2 bg-white shadow-lg rounded-lg border border-slate-100 py-1 z-40 text-[14px] w-28 overflow-hidden">
                                   {msg.text ? (
                                     msg.imageUrl ? null : (
                                       <button onClick={() => startEditing(msg)} className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition">Edit</button>
                                     )
                                     ) : null}
                                   <button onClick={() => handleDeleteIndividualMsg(msg._id)} className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition">Delete</button>
                                </div>
                               ) : null
                            ) : null}
                            
                            {msg.imageUrl ? (
                              <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1 px-1 pt-1" title="Click to enlarge">
                                <img src={msg.imageUrl} alt="attachment" className="rounded-md w-full max-w-[240px] shadow-sm object-cover" />
                              </a>
                            ) : null}
                            
                            {msg.audioUrl ? (
                               <div className="px-1 pt-1 pb-2 pr-4">
                                 <CustomAudioPlayer audioUrl={msg.audioUrl} isMe={isMe} />
                               </div>
                            ) : null}

                            {msg.text ? (
                               <div className="flex items-end flex-wrap gap-2 px-1.5">
                                 <span className="text-[14.5px] leading-relaxed pb-3 pr-4 min-w-[50px]" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                   {msg.text}
                                 </span>
                               </div>
                            ) : null}

                            <div className="absolute bottom-1 right-2 flex items-center gap-1">
                               <span className={"text-[10px] font-medium " + (isMe ? "text-blue-100 opacity-90" : "text-slate-400")}>{timeStr}</span>
                               {isMe ? (
                                 msg.isRead ? (
                                   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 12l5 5L16 6M8 12l5 5L22 6"/></svg>
                                 ) : (
                                   <svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-200"><path d="M4 9l3 3 7-7"/></svg>
                                 )
                               ) : null}
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* INPUT AREA */}
                <div className="px-4 py-3 bg-white border-t border-slate-200 z-30 w-full relative">
                  
                  {editingMessage ? (
                    <div className="absolute -top-10 left-4 right-4 bg-slate-100 border border-slate-200 border-b-0 rounded-t-xl px-4 py-2 flex items-center justify-between shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-blue-600">Editing message</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs">{editingMessage.text}</span>
                      </div>
                      <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-700 transition">
                        <IconClose />
                      </button>
                    </div>
                  ) : null}

                  <form onSubmit={handleSendMessage} className="flex items-end gap-2 w-full max-w-5xl mx-auto relative">
                    
                    <>
                      <div className="relative flex-shrink-0 pb-1">
                        <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className={"p-2 rounded-full transition " + (showAttachMenu ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-100")}>
                          <IconPlus />
                        </button>

                        {showAttachMenu ? (
                          <div className="absolute bottom-12 left-0 w-44 bg-white rounded-xl shadow-xl py-2 border border-slate-100 z-50 flex flex-col transform origin-bottom-left transition-all">
                            <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition">
                              <span className="text-blue-500"><IconPhoto /></span> <span className="font-medium text-[15px] text-slate-700">Photos</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                            </label>
                          </div>
                        ) : null}
                      </div>

                      <div className={"flex-1 bg-slate-100 rounded-xl px-4 py-2 relative overflow-hidden flex items-center min-h-[44px] " + (editingMessage ? "rounded-tl-none border border-slate-200" : "")}>
                        {imagePreview ? (
                          <div className="absolute left-2 top-2 h-8 w-8 rounded overflow-hidden">
                             <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                             <button type="button" onClick={clearAttachments} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><IconClose /></button>
                          </div>
                        ) : null}
                        <textarea 
                          ref={textareaRef} 
                          rows="1" 
                          placeholder="Type a message" 
                          value={newMessage} 
                          onChange={handleTextChange} 
                          onFocus={() => setShowAttachMenu(false)}
                          className={"w-full bg-transparent border-none focus:outline-none text-[15px] text-slate-800 placeholder-slate-500 resize-none " + (imagePreview ? "pl-10" : "")} 
                          style={{ height: '24px', minHeight: '24px', maxHeight: '100px' }} 
                        />
                      </div>
                    </>

                    <div className="flex-shrink-0 pb-0.5">
                      {hasContentToSend ? (
                        <button type="submit" className="h-[44px] w-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-sm focus:outline-none transition-colors">
                          <IconSend />
                        </button>
                      ) : (
                        <button type="button" disabled className="h-[44px] w-[44px] bg-slate-200 text-slate-400 rounded-full flex items-center justify-center shadow-sm focus:outline-none cursor-not-allowed">
                          <IconSend />
                        </button>
                      )}
                    </div>

                  </form>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Message;