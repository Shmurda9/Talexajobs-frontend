import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// --- SAFE ICON COMPONENTS (Prevents clipboard truncation) ---
const IconPlay = () => (<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>);
const IconPause = () => (<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>);
const IconEmpty = () => (<svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const IconClose = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>);
const IconMenu = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>);
const IconBlock = () => (<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>);
const IconDelete = () => (<svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const IconPlus = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>);
const IconPhoto = () => (<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const IconFile = () => (<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>);
const IconSend = () => (<svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>);
const IconMic = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>);
const IconStop = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>);

// --- PREMIUM AUDIO PLAYER ---
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

  let boxClass = "flex items-center gap-3 w-48 sm:w-60 px-2 py-1 ";
  if (isMe) boxClass += "text-white";
  else boxClass += "text-slate-700";

  return (
    <div className={boxClass}>
      <button onClick={togglePlay} type="button" className="flex-shrink-0 hover:scale-110 transition-transform focus:outline-none">
        {isPlaying ? <IconPause /> : <IconPlay />}
      </button>
      <div className="flex-1 h-1.5 bg-black/20 rounded-full relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-current rounded-full transition-all" style={{ width: progress + '%' }}></div>
      </div>
    </div>
  );
};

// --- MAIN CHAT COMPONENT ---
function Message() {
  const navigate = useNavigate();
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
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const textareaRef = useRef(null); 
  const [socket, setSocket] = useState(null); 

  const token = localStorage.getItem('token');
  let myId = null;
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.id) myId = decoded.id;
      else if (decoded._id) myId = decoded._id;
      else if (decoded.userId) myId = decoded.userId;
    } catch (e) {
      console.error("Token error", e);
    }
  }

  const fetchInbox = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/messages/inbox', {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      if (res.data.success) setContacts(res.data.contacts);
    } catch (error) {
      console.error("Could not load inbox", error);
    } finally {
      setLoadingContacts(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchInbox();
  }, [token, navigate, fetchInbox]);

  useEffect(() => {
    if (myId) {
      const newSocket = io("http://localhost:5000", { transports: ['websocket', 'polling'] });
      setSocket(newSocket);
      newSocket.emit("addUser", myId);
      return () => newSocket.disconnect();
    }
  }, [myId]);

  useEffect(() => {
    if (!socket) return;
    const handleIncomingMessage = (message) => {
      let isCurrentChat = false;
      if (selectedContact) {
        if (message.sender === selectedContact._id) isCurrentChat = true;
        if (message.receiver === selectedContact._id) isCurrentChat = true;
      }

      if (isCurrentChat) {
        setMessages(prev => [...prev, message]);
        axios.put('http://localhost:5000/api/messages/read/' + selectedContact._id, {}, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
      } else {
        toast.success("New message received!");
        fetchInbox(); 
      }
    };

    socket.on("getMessage", handleIncomingMessage);
    return () => socket.off("getMessage", handleIncomingMessage);
  }, [socket, selectedContact, fetchInbox, token]);

  useEffect(() => {
    if (!selectedContact) return;
    const fetchHistoryAndMarkRead = async () => {
      setLoadingMessages(true);
      setShowMenu(false); 
      setShowAttachMenu(false);
      clearAttachments();
      try {
        await axios.put('http://localhost:5000/api/messages/read/' + selectedContact._id, {}, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        const res = await axios.get('http://localhost:5000/api/messages/history/' + selectedContact._id, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        if (res.data.success) {
          setMessages(res.data.messages);
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
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    audioChunksRef.current = []; 
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        clearAttachments(); 
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const newAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(newAudioBlob);
          setAudioPreviewUrl(URL.createObjectURL(newAudioBlob));
          stream.getTracks().forEach(track => track.stop()); 
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        toast.error("Microphone access denied.");
      }
    }
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

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      clearAttachments();
      setAudioBlob(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      setShowAttachMenu(false);
    }
  };

  const handleTextChange = (e) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; 
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'; 
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    let okToSend = false;
    if (newMessage.trim() !== '') okToSend = true;
    if (selectedImage !== null) okToSend = true;
    if (audioBlob !== null) okToSend = true;
    
    if (!okToSend) return;
    if (!selectedContact) return;
    
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedContact._id);
      if (newMessage.trim() !== '') formData.append('text', newMessage);
      if (selectedImage !== null) formData.append('image', selectedImage);
      if (audioBlob !== null) formData.append('audio', audioBlob, 'voicenote.webm');

      const res = await axios.post('http://localhost:5000/api/messages/send', formData, {
        headers: { 
          token: token, 
          Authorization: "Bearer " + token,
          'Content-Type': 'multipart/form-data'}
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        setNewMessage('');
        if (textareaRef.current) textareaRef.current.style.height = '24px'; 
        clearAttachments();
        fetchInbox(); 
      }
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await axios.delete('http://localhost:5000/api/messages/conversation/' + selectedContact._id, {
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

  const handleBlockUser = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/messages/block/' + selectedContact._id, {}, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      toast.success(res.data.message);
      setShowMenu(false);
    } catch (error) {
      toast.error("Failed to block user.");
    }
  };

  const getDisplayName = (user) => {
    if (!user) return "Deleted User";
    if (user.fullName) return user.fullName;
    if (user.employerInfo && user.employerInfo.companyName) return user.employerInfo.companyName;
    return "User";
  };
  const getAvatarFallback = (user) => {
    if (!user) return "U";
    return getDisplayName(user).charAt(0).toUpperCase();
  };
  const getAvatarSrc = (user) => {
    if (!user) return null;
    let url = user.profilePictureUrl;
    if (!url && user.employerInfo) url = user.employerInfo.logoUrl;
    if (url) {
      const cleanPath = url.replace(/\\/g, '/');
      if (cleanPath.startsWith('http')) return cleanPath;
      if (cleanPath.startsWith('/')) return "http://localhost:5000" + cleanPath;
      return "http://localhost:5000/" + cleanPath;
    }
    return null;
  };

  let hasContentToSend = false;
  if (newMessage.trim() !== '') hasContentToSend = true;
  if (selectedImage !== null) hasContentToSend = true;
  if (audioBlob !== null) hasContentToSend = true;

  let showPreviews = false;
  if (imagePreview !== null) showPreviews = true;
  if (audioPreviewUrl !== null) showPreviews = true;

  return (
    <div className="bg-slate-50 py-0 sm:py-6 font-sans flex justify-center overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="w-full max-w-7xl px-0 sm:px-6 lg:px-8 h-full">
        <div className="bg-white sm:border border-slate-200 sm:rounded-2xl shadow-sm flex h-full overflow-hidden">
          
          {/* SIDEBAR */}
          <div className={"w-full md:w-1/3 border-r border-slate-200 flex flex-col h-full " + (selectedContact ? "hidden md:flex" : "flex")}>
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-extrabold text-slate-800">Inbox</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              {loadingContacts ? (
                <p className="text-center text-slate-400 mt-10 text-sm font-medium animate-pulse">Loading inbox...</p>
              ) : contacts.length === 0 ? (
                <p className="text-center text-slate-400 mt-10 text-sm font-medium">No messages yet.</p>
              ) : (
                contacts.map(function(contact) {
                  let isSelected = false;
                  if (selectedContact && selectedContact._id === contact._id) isSelected = true;
                  const avatarSrc = getAvatarSrc(contact);

                  return (
                    <button key={contact._id} onClick={() => setSelectedContact(contact)} className={"w-full text-left flex items-center gap-3 p-3 rounded-xl transition mb-1 " + (isSelected ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50 border border-transparent")}>
                      <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 flex-shrink-0 overflow-hidden shadow-sm">
                        {avatarSrc ? <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" /> : getAvatarFallback(contact)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="font-bold text-slate-900 truncate">{getDisplayName(contact)}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-0.5 capitalize">{contact.role}</p>
                      </div>
                      
                      {contact.unreadCount > 0 && (
                        <div className="bg-rose-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full flex-shrink-0 shadow-sm">
                          {contact.unreadCount}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className={"w-full md:w-2/3 flex flex-col bg-slate-50 relative h-full " + (!selectedContact ? "hidden md:flex" : "flex")}>
            {!selectedContact ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <IconEmpty />
                </div>
                <h3 className="font-extrabold text-xl text-slate-700 mb-1">Your Messages</h3>
                <p className="font-medium text-sm">Select a conversation from the sidebar to start chatting.</p>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}
                <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10 w-full overflow-hidden">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={() => setSelectedContact(null)} className="md:hidden p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden shadow-sm flex-shrink-0">
                       {getAvatarSrc(selectedContact) ? <img src={getAvatarSrc(selectedContact)} alt="avatar" className="h-full w-full object-cover" /> : getAvatarFallback(selectedContact)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-extrabold text-slate-900 text-sm sm:text-base truncate">{getDisplayName(selectedContact)}</p>
                      <Link to={selectedContact.role === 'employer' ? "/employer/" + selectedContact._id : "/candidate/" + selectedContact._id} className="text-xs text-blue-600 hover:text-blue-800 font-bold transition block truncate">View Profile &rarr;</Link>
                    </div>
                  </div>
                  
                  <div className="relative flex-shrink-0">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition">
                      <IconMenu />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 overflow-hidden">
                        <button onClick={handleBlockUser} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition border-b border-slate-100 flex items-center gap-2">
                          <IconBlock /> Block / Unblock
                        </button>
                        <button onClick={handleDeleteChat} className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2">
                          <IconDelete /> Delete Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* MESSAGES DISPLAY AREA */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 flex flex-col gap-5 w-full">
                  {loadingMessages ? (
                    <p className="text-center text-slate-400 mt-10 text-sm font-medium animate-pulse">Syncing messages...</p>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <p className="font-bold text-slate-600">No messages yet</p>
                      <p className="text-sm mt-1">Send a message to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(function(msg) {
                      let isMe = msg.sender === myId;
                      
                      return (
                        <div key={msg._id} className={"flex w-full " + (isMe ? "justify-end" : "justify-start")}>
                          <div className={"flex flex-col max-w-[92%] sm:max-w-[75%] overflow-hidden " + (isMe ? "items-end" : "items-start")}>
                            
                            {msg.imageUrl && (
                              <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1.5 w-full max-w-[240px] sm:max-w-xs" title="Click to enlarge">
                                <img src={msg.imageUrl} alt="attachment" className="rounded-2xl w-full shadow-sm object-cover hover:opacity-90 transition" />
                              </a>
                            )}
                            
                            {(msg.audioUrl || msg.text) && (
                              <div className={"w-fit max-w-full rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm flex flex-col gap-2 " + (isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm")}>
                                {msg.audioUrl && <CustomAudioPlayer audioUrl={msg.audioUrl} isMe={isMe} />}
                                {msg.text && (
                                  <p className="text-[15px] leading-relaxed" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                                    {msg.text}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            <p className="text-[10px] mt-1 font-semibold text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ATTACHMENT PREVIEW AREA */}
                {showPreviews && (
                  <div className="bg-white border-t border-slate-200 p-3 flex items-center gap-4 shadow-inner w-full">
                    {imagePreview && (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        <button onClick={clearAttachments} className="absolute top-0 right-0 bg-slate-900/50 text-white p-0.5 hover:bg-rose-500 transition"><IconClose /></button>
                      </div>
                    )}
                    {audioPreviewUrl && (
                      <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl flex-1 overflow-hidden">
                        <audio controls src={audioPreviewUrl} className="h-8 flex-1" />
                        <button onClick={clearAttachments} className="text-slate-400 hover:text-rose-500 p-1 transition flex-shrink-0"><IconClose /></button>
                      </div>
                    )}
                  </div>
                )}

                {/* INPUT AREA */}
                <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] relative w-full">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2 w-full max-w-4xl mx-auto">
                    
                    <div className="relative flex-shrink-0">
                      <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className={"h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition " + (showAttachMenu ? "bg-slate-200 text-slate-800" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700")}>
                        <IconPlus />
                      </button>

                      {showAttachMenu && (
                        <div className="absolute bottom-14 left-0 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 flex flex-col">
                          <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition">
                            <IconPhoto /> <span className="font-semibold text-sm text-slate-700">Photos</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                          </label>
                          <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition">
                            <IconFile /> <span className="font-semibold text-sm text-slate-700">Files</span>
                            <input type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex items-center bg-slate-100 border border-slate-200 rounded-3xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all shadow-inner relative overflow-hidden">
                      <textarea ref={textareaRef} rows="1" placeholder="Type a message..." value={newMessage} onChange={handleTextChange} onFocus={() => setShowAttachMenu(false)} className="w-full bg-transparent border-none focus:outline-none text-[15px] text-slate-800 placeholder-slate-400 resize-none" style={{ height: '24px', minHeight: '24px', maxHeight: '100px' }} />
                    </div>
                    
                    <div className="flex-shrink-0">
                      {hasContentToSend ? (
                        <button type="submit" disabled={isSending} className="h-11 w-11 sm:h-12 sm:w-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition shadow-md focus:outline-none">
                          {isSending ? <span className="text-xs font-bold">...</span> : <IconSend />}
                        </button>
                      ) : (
                        <button type="button" onClick={toggleRecording} className={"h-11 w-11 sm:h-12 sm:w-12 text-white rounded-full flex items-center justify-center transition shadow-md focus:outline-none " + (isRecording ? "bg-rose-500 animate-pulse scale-110" : "bg-slate-800 hover:bg-slate-700")} title={isRecording ? "Click to stop" : "Click to record"}>
                          {isRecording ? <IconStop /> : <IconMic />}
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
          