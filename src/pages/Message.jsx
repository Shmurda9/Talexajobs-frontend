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
const IconMenu = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>);
const IconBlock = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>);
const IconUnblock = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const IconDelete = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const IconPlus = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>);
const IconPhoto = () => (<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const IconFile = () => (<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>);
const IconSend = () => (<svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>);
const IconMic = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>);
const IconTrash = () => (<svg className="w-5 h-5 text-slate-400 hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
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

  return (
    <div className={"flex items-center gap-3 w-56 sm:w-64 pt-1 pb-3 " + (isMe ? "text-white" : "text-slate-700")}>
      <button onClick={togglePlay} type="button" className="flex-shrink-0 hover:scale-110 transition-transform focus:outline-none">
        {isPlaying ? <IconPause /> : <IconPlay />}
      </button>
      <div className={"flex-1 h-1.5 rounded-full relative overflow-hidden " + (isMe ? "bg-blue-400" : "bg-slate-200")}>
        <div className={"absolute top-0 left-0 h-full rounded-full transition-all " + (isMe ? "bg-white" : "bg-blue-600")} style={{ width: progress + '%' }}></div>
      </div>
      <div className={"h-10 w-10 rounded-full flex-shrink-0 overflow-hidden border flex items-center justify-center " + (isMe ? "bg-blue-500 border-blue-400 text-blue-100" : "bg-slate-100 border-slate-200 text-slate-400")}>
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
  
  // Audio & Timer States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null); 
  const [audioBlob, setAudioBlob] = useState(null); 
  
  // Edit & Menu States
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeBubbleMenu, setActiveBubbleMenu] = useState(null);
  
  // Dynamic Block State
  const [isBlocked, setIsBlocked] = useState(false);

  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null); 
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
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
      const res = await axios.get('https://talexajobs.onrender.com/api/messages/inbox', {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      if (res.data.success) {
        // 🚨 PREVENT DUPLICATE CONTACTS IN SIDEBAR
        const uniqueContacts = res.data.contacts.filter((v,i,a)=>a.findIndex(t=>(t._id===v._id))===i);
        setContacts(uniqueContacts);
      }
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
    if (location.state && location.state.prefilledContact) {
      setSelectedContact(location.state.prefilledContact);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (selectedContact) {
      setIsBlocked(selectedContact.isBlocked || false); 
    }
  }, [selectedContact]);

  useEffect(() => {
    if (myId) {
      const newSocket = io("https://talexajobs.onrender.com", { transports: ['websocket', 'polling'] });
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
        // 🚨 PREVENT DUPLICATE MESSAGES FROM SOCKET
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
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
      cancelEditing();
      try {
        await axios.put('https://talexajobs.onrender.com/api/messages/read/' + selectedContact._id, {}, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        const res = await axios.get('https://talexajobs.onrender.com/api/messages/history/' + selectedContact._id, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        if (res.data.success) {
          // 🚨 PREVENT DUPLICATE MESSAGES IN HISTORY
          const uniqueMsgs = res.data.messages.filter((v,i,a)=>a.findIndex(t=>(t._id===v._id))===i);
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
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    audioChunksRef.current = []; 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    let zeroPrefix = "";
    if (s < 10) {
        zeroPrefix = "0";
    }
    return m + ":" + zeroPrefix + s;
  };

  const startRecording = async () => {
    try {
      clearAttachments(); 
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; 
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      toast.error("Microphone access denied by your browser.");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; 
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerRef.current);

      mediaRecorderRef.current.onstop = async () => {
        // 🚨 THE FIX: Automatically detect what format the device supports (PC = webm, Mobile/iOS = mp4/m4a)
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const newAudioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // 🚨 Set the correct file extension so Cloudinary doesn't get confused
        let fileExtension = 'webm';
        if (mimeType.includes('mp4') || mimeType.includes('m4a') || mimeType.includes('aac')) {
          fileExtension = 'm4a';
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        setIsRecording(false);
        setRecordingDuration(0);

        try {
          const formData = new FormData();
          formData.append('receiverId', selectedContact._id);
          // Attach the file with the device-correct extension
          formData.append('audio', newAudioBlob, `voicenote.${fileExtension}`); 

          const res = await axios.post('https://talexajobs.onrender.com/api/messages/send', formData, {
            headers: { token: token, Authorization: "Bearer " + token, 'Content-Type': 'multipart/form-data'}
          });

          if (res.data.success) {
            setMessages(prev => {
              if (prev.some(m => m._id === res.data.message._id)) return prev;
              return [...prev, res.data.message];
            });
            fetchInbox();
          }
        } catch (error) {
          console.error("Audio send error:", error.response?.data || error.message);
          toast.error("Failed to send voice note.");
        }
      };
      
      mediaRecorderRef.current.stop(); 
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

  const startEditing = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.text);
    setActiveBubbleMenu(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '24px';
  };

  const handleDeleteIndividualMsg = async (msgId) => {
    setActiveBubbleMenu(null);
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete('https://talexajobs.onrender.com/api/messages/' + msgId, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      setMessages(prev => prev.filter(m => m._id !== msgId));
      toast.success("Message deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete message. Backend route might be missing.");
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

    if (editingMessage) {
      try {
        const textToUpdate = newMessage;
        cancelEditing(); 
        
        const res = await axios.put('https://talexajobs.onrender.com/api/messages/' + editingMessage._id, { text: textToUpdate }, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        
        if (res.data.success) {
          setMessages(prev => prev.map(m => m._id === editingMessage._id ? res.data.message : m));
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to edit. Backend route might be missing.");
      }
      return;
    }

    const cachedText = newMessage;
    const cachedImage = selectedImage;
    const cachedAudio = audioBlob;

    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '24px'; 
    clearAttachments();

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedContact._id);
      if (cachedText.trim() !== '') formData.append('text', cachedText);
      if (cachedImage !== null) formData.append('image', cachedImage);
      if (cachedAudio !== null) formData.append('audio', cachedAudio, 'attached_audio.mp3');

      const res = await axios.post('https://talexajobs.onrender.com/api/messages/send', formData, {
        headers: { token: token, Authorization: "Bearer " + token, 'Content-Type': 'multipart/form-data'}
      });
      
      if (res.data.success) {
        // 🚨 PREVENT DUPLICATES ON SEND
        setMessages(prev => {
          if (prev.some(m => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        fetchInbox(); 
      }
    } catch (error) {
      console.error("Send Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to send file.");
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
      if (cleanPath.startsWith('/')) return "https://talexajobs.onrender.com" + cleanPath;
      return "https://talexajobs.onrender.com/" + cleanPath;
    }
    return null;
  };

  let hasContentToSend = false;
  if (newMessage.trim() !== '') hasContentToSend = true;
  if (selectedImage !== null) hasContentToSend = true;
  if (audioBlob !== null) hasContentToSend = true;

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
                  if (selectedContact && selectedContact._id === contact._id) isSelected = true;
                  const avatarSrc = getAvatarSrc(contact);

                  return (
                    <button key={contact._id} onClick={() => setSelectedContact(contact)} className={"w-full text-left flex items-center gap-3 px-4 py-3 transition border-b border-slate-50 " + (isSelected ? "bg-slate-100" : "hover:bg-slate-50")}>
                      <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 flex-shrink-0 overflow-hidden">
                        {avatarSrc ? <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" /> : getAvatarFallback(contact)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                           <p className="font-bold text-slate-900 truncate text-[15px]">{getDisplayName(contact)}</p>
                        </div>
                        <p className="text-[12px] text-slate-500 truncate">{contact.role === 'employer' ? 'Employer' : 'Candidate'}</p>
                      </div>
                      
                      {contact.unreadCount > 0 && (
                        <div className="bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full flex-shrink-0 shadow-sm">
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
          <div className={"w-full md:w-2/3 flex flex-col bg-[#f8f9fa] h-full relative " + (!selectedContact ? "hidden md:flex" : "flex")}>
            
            {!selectedContact ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center z-10">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                  <IconEmpty />
                </div>
                <h3 className="font-extrabold text-xl text-slate-700 mb-1">TalexaJobs Web</h3>
                <p className="font-medium text-sm text-slate-500">Select a conversation to start messaging securely.</p>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}
                <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between relative z-30 w-full shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden cursor-pointer">
                    <button onClick={() => setSelectedContact(null)} className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition flex-shrink-0 mr-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden flex-shrink-0">
                       {getAvatarSrc(selectedContact) ? <img src={getAvatarSrc(selectedContact)} alt="avatar" className="h-full w-full object-cover" /> : getAvatarFallback(selectedContact)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 text-[15px] truncate leading-tight">{getDisplayName(selectedContact)}</p>
                      <Link to={selectedContact.role === 'employer' ? "/employer/" + selectedContact._id : "/candidate/" + selectedContact._id} className="text-[12px] text-blue-600 hover:text-blue-800 transition font-bold block truncate">Tap to view profile</Link>
                    </div>
                  </div>
                  
                  <div className="relative flex-shrink-0">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition focus:outline-none">
                      <IconMenu />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-[60] border border-slate-100">
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
                    )}
                  </div>
                </div>

                {/* MESSAGES DISPLAY AREA */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 flex flex-col gap-2 w-full relative z-10" onMouseLeave={() => setActiveBubbleMenu(null)}>
                  {loadingMessages ? (
                    <p className="text-center text-slate-500 mt-4 text-[13px] font-medium uppercase tracking-widest bg-slate-100 w-max mx-auto px-3 py-1 rounded-lg">Syncing...</p>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-6">
                       <p className="text-center text-slate-500 text-[13px] bg-slate-100 px-4 py-2 rounded-lg w-max">
                         Messages are end-to-end encrypted.
                       </p>
                    </div>
                  ) : (
                    messages.map(function(msg) {
                      let isMe = msg.sender === myId;
                      const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      
                      let bubbleClass = "w-fit max-w-[85%] sm:max-w-[70%] relative flex flex-col px-2 pt-1.5 pb-1 shadow-sm group ";
                      if (isMe) {
                         bubbleClass += "bg-blue-600 text-white rounded-xl rounded-tr-sm ml-auto ";
                      } else {
                         bubbleClass += "bg-white text-slate-800 border border-slate-200 rounded-xl rounded-tl-sm mr-auto ";
                      }

                      return (
                        <div key={msg._id} className="flex w-full mb-1 relative">
                          <div className={bubbleClass}>
                            
                            {isMe && (
                              <button onClick={() => setActiveBubbleMenu(activeBubbleMenu === msg._id ? null : msg._id)} className="absolute top-1 right-1 text-blue-200 hover:text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition z-10">
                                <IconChevronDown />
                              </button>
                            )}
                            
                            {activeBubbleMenu === msg._id && isMe && (
                              <div className="absolute top-6 right-2 bg-white shadow-lg rounded-lg border border-slate-100 py-1 z-40 text-[14px] w-28 overflow-hidden">
                                 {msg.text && !msg.audioUrl && !msg.imageUrl && (
                                   <button onClick={() => startEditing(msg)} className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition">Edit</button>
                                 )}
                                 <button onClick={() => handleDeleteIndividualMsg(msg._id)} className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition">Delete</button>
                              </div>
                            )}
                            
                            {msg.imageUrl && (
                              <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1 px-1 pt-1" title="Click to enlarge">
                                <img src={msg.imageUrl} alt="attachment" className="rounded-md w-full max-w-[240px] shadow-sm object-cover" />
                              </a>
                            )}
                            
                            {msg.audioUrl && (
                               <div className="px-1 pt-1 pb-2 pr-4">
                                 <CustomAudioPlayer audioUrl={msg.audioUrl} isMe={isMe} />
                               </div>
                            )}

                            {msg.text && (
                               <div className="flex items-end flex-wrap gap-2 px-1.5">
                                 <span className="text-[14.5px] leading-relaxed pb-3 pr-4 min-w-[50px]" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                   {msg.text}
                                 </span>
                               </div>
                            )}

                            <div className="absolute bottom-1 right-2 flex items-center gap-1">
                               <span className={"text-[10px] font-medium " + (isMe ? "text-blue-100 opacity-90" : "text-slate-400")}>{timeStr}</span>
                               {isMe && (
                                 <svg viewBox="0 0 16 15" width="14" height="13" className="text-blue-200"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879a.32.32 0 01-.484.033l-.358-.325a.319.319 0 00-.484.032l-.378.483a.418.418 0 00.036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 00-.064-.512zm-4.1 0l-.478-.372a.365.365 0 00-.51.063L4.566 9.879a.32.32 0 01-.484.033L1.891 7.769a.366.366 0 00-.515.006l-.423.433a.364.364 0 00.006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 00-.063-.51z"></path></svg>
                                 )}
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* INPUT AREA */}
                <div className="px-4 py-3 bg-white border-t border-slate-200 z-30 w-full relative">
                  
                  {editingMessage && (
                    <div className="absolute -top-10 left-4 right-4 bg-slate-100 border border-slate-200 border-b-0 rounded-t-xl px-4 py-2 flex items-center justify-between shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-blue-600">Editing message</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs">{editingMessage.text}</span>
                      </div>
                      <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-700 transition">
                        <IconClose />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-end gap-2 w-full max-w-5xl mx-auto relative">
                    
                    {!isRecording && (
                      <>
                        <div className="relative flex-shrink-0 pb-1">
                          <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className={"p-2 rounded-full transition " + (showAttachMenu ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-100")}>
                            <IconPlus />
                          </button>

                          {showAttachMenu && (
                            <div className="absolute bottom-12 left-0 w-44 bg-white rounded-xl shadow-xl py-2 border border-slate-100 z-50 flex flex-col transform origin-bottom-left transition-all">
                              <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition">
                                <span className="text-blue-500"><IconPhoto /></span> <span className="font-medium text-[15px] text-slate-700">Photos</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                              </label>
                              <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition">
                                <span className="text-purple-500"><IconFile /></span> <span className="font-medium text-[15px] text-slate-700">Document</span>
                                <input type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
                              </label>
                            </div>
                          )}
                        </div>

                        <div className={"flex-1 bg-slate-100 rounded-xl px-4 py-2 relative overflow-hidden flex items-center min-h-[44px] " + (editingMessage ? "rounded-tl-none border border-slate-200" : "")}>
                          {imagePreview && (
                            <div className="absolute left-2 top-2 h-8 w-8 rounded overflow-hidden">
                               <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                               <button type="button" onClick={clearAttachments} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><IconClose /></button>
                            </div>
                          )}
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
                    )}

                    {isRecording && (
                      <div className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-full px-5 py-2 h-[44px] mb-0.5">
                         <button type="button" onClick={cancelRecording} className="text-slate-400 hover:text-rose-500 transition focus:outline-none">
                           <IconTrash />
                         </button>
                         <div className="flex items-center gap-2">
                           <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                           <span className="font-medium text-[15px] text-slate-700 font-mono tracking-wider">{formatTime(recordingDuration)}</span>
                         </div>
                         <div className="w-5"></div> 
                      </div>
                    )}
                    
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