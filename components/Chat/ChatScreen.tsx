
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { GLOBAL_CHAT_ID } from '../../constants';
import { Message, User, MessageAttachment } from '../../types';
import Header from '../common/Header';

// --- ICONS ---
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const UserGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
        <path d="M5.082 14.254a6.755 6.755 0 00-3.436 2.756C1.64 17.011 1.493 17.011 1.493 17.011c.612 1.637 1.838 3.012 3.43 3.963a.75.75 0 00.372.568 12.697 12.697 0 006.326 1.684v-.001a14.253 14.253 0 01-6.54-8.97zM22.463 17.011c0-.001-.146-.001-.153.001a6.755 6.755 0 00-3.436-2.756 14.254 14.254 0 01-6.54 8.97 12.697 12.697 0 006.326-1.684.75.75 0 003.43-3.963z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-gray-500 dark:text-gray-400">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

const PaperClipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const FileIcon = ({ className = "w-8 h-8 text-gray-500" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const DoubleCheckIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <div className="flex relative w-4 h-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`${className} absolute left-0`}>
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`${className} absolute left-1.5`}>
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    </div>
);

// --- UTILS ---
const decryptMessage = (content: string) => {
    if (content && content.startsWith('ENC::')) {
        try {
            // Decrypt: decode base64, then unescape unicode
            return decodeURIComponent(escape(window.atob(content.replace('ENC::', ''))));
        } catch (e) {
            return '*** Error Decrypting Message ***';
        }
    }
    return content;
};


// --- COMPONENTS ---

interface CameraModalProps {
    onCapture: (dataUrl: string) => void;
    onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            const constraints = [
                { video: { facingMode: 'environment' } },
                { video: { facingMode: 'user' } },
                { video: true }
            ];

            let lastError;
            for (const constraint of constraints) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                    return; // Successfully initialized
                } catch (err) {
                    lastError = err;
                    console.warn("Retrying camera with next constraint set due to error:", err);
                }
            }

            console.error("Error accessing camera after all attempts:", lastError);
            alert("Unable to access camera. Please ensure permissions are granted and a camera is connected.");
            onClose();
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between animate-fadeIn">
            <div className="p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={onClose} className="text-white p-2">
                    <CloseIcon />
                </button>
            </div>
            
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover" 
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="p-8 flex justify-center items-center z-10 bg-gradient-to-t from-black/50 to-transparent">
                <button 
                    onClick={handleCapture}
                    className="h-20 w-20 bg-white rounded-full border-4 border-gray-300 shadow-lg active:scale-90 transition-transform"
                />
            </div>
        </div>
    );
};


interface ChatItemProps {
    id: string;
    name: string;
    lastMessage?: string;
    time?: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    unreadCount?: number;
    profilePhoto?: string;
}

const ChatItem: React.FC<ChatItemProps> = ({ name, lastMessage, time, isActive, onClick, icon, unreadCount = 0, profilePhoto }) => (
    <div 
        onClick={onClick}
        className={`flex items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-700 ${isActive ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
    >
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 relative overflow-hidden">
            {profilePhoto ? (
                <img src={profilePhoto} alt={name} className="h-full w-full object-cover" />
            ) : (
                icon
            )}
        </div>
        <div className="ml-4 flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
            </div>
            <div className="flex justify-between items-center">
                <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {lastMessage || 'Click to start chatting'}
                </p>
                {unreadCount > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                        {unreadCount}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const StatusTicks: React.FC<{ message: Message }> = ({ message }) => {
    // Determine status
    // 2 Blue Ticks: Read by receiver
    // 2 Grey Ticks: Delivered (receiver in deliveredTo)
    // 1 Grey Tick: Sent
    
    // Check if it's a global chat message or DM
    const isGlobal = message.receiverId === GLOBAL_CHAT_ID;
    
    // For Global Chat, simplistic assumption: always show 2 Grey Ticks (Server Received)
    // Real "Read by All" is complex to track in UI for groups
    if (isGlobal) {
         return <DoubleCheckIcon className="w-4 h-3 text-gray-300" />;
    }

    // Direct Message Logic
    const isRead = message.readBy.includes(message.receiverId);
    const isDelivered = message.deliveredTo.includes(message.receiverId);

    if (isRead) {
        return <DoubleCheckIcon className="w-4 h-3 text-blue-300" />;
    } else if (isDelivered) {
        return <DoubleCheckIcon className="w-4 h-3 text-gray-300" />;
    } else {
        return <CheckIcon className="w-3 h-3 text-gray-300" />;
    }
};

const MessageBubble: React.FC<{ message: Message, isSelf: boolean, senderName: string }> = ({ message, isSelf, senderName }) => (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} mb-4`}>
        <div className={`max-w-[75%] md:max-w-[60%] rounded-lg px-2 py-2 shadow-sm relative text-sm ${
            isSelf 
            ? 'bg-green-600 text-white rounded-tr-none' 
            : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
        }`}>
            {!isSelf && <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1 px-2">{senderName}</p>}
            
            {message.attachment && (
                <div className="mb-2 rounded-lg overflow-hidden">
                    {message.attachment.type === 'image' ? (
                        <img 
                            src={message.attachment.url} 
                            alt="Attachment" 
                            className="max-w-full h-auto max-h-64 object-cover" 
                        />
                    ) : (
                         <div className="flex items-center gap-3 bg-black/10 dark:bg-white/10 p-3 rounded-lg">
                            <FileIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                            <a 
                                href={message.attachment.url} 
                                download={message.attachment.name || 'download'} 
                                className="underline text-inherit truncate max-w-[150px]"
                            >
                                {message.attachment.name || 'File Attachment'}
                            </a>
                        </div>
                    )}
                </div>
            )}

            {message.content && <p className="whitespace-pre-wrap leading-relaxed px-2 pb-1">{decryptMessage(message.content)}</p>}
            
            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 px-1 ${isSelf ? 'text-green-100' : 'text-gray-400'}`}>
                <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isSelf && <StatusTicks message={message} />}
            </div>
        </div>
    </div>
);

const ChatScreen: React.FC = () => {
    const { currentUser, users, messages, sendMessage, markAsRead, getUserById, typingUsers, sendTypingSignal } = useAppContext();
    const navigate = useNavigate();
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const handleResize = () => {
             if (window.innerWidth >= 768 && !activeChatId) {
                 setActiveChatId(GLOBAL_CHAT_ID);
             }
        };
        handleResize(); 
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeChatId]);

    useEffect(() => {
        if (activeChatId) {
            markAsRead(activeChatId);
        }
    }, [activeChatId, messages, markAsRead]);


    const sortedMessages = useMemo(() => {
        if (!activeChatId) return [];
        
        return messages.filter(m => {
            if (activeChatId === GLOBAL_CHAT_ID) {
                return m.receiverId === GLOBAL_CHAT_ID;
            } else {
                return (m.senderId === currentUser?.id && m.receiverId === activeChatId) ||
                       (m.senderId === activeChatId && m.receiverId === currentUser?.id);
            }
        }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, activeChatId, currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sortedMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((messageInput.trim() || attachment) && activeChatId) {
            sendMessage(activeChatId, messageInput, attachment || undefined);
            setMessageInput('');
            setAttachment(null);
            
            // Cancel typing status immediately on send
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            sendTypingSignal(activeChatId, false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        
        if (activeChatId) {
            sendTypingSignal(activeChatId, true);
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = window.setTimeout(() => {
                sendTypingSignal(activeChatId, false);
            }, 2000); // Stop typing status after 2 seconds of inactivity
        }
    };
    
    const activeChatName = useMemo(() => {
        if (activeChatId === GLOBAL_CHAT_ID) return 'Global Public Chat';
        const user = getUserById(activeChatId || '');
        return user ? user.name : 'Chat';
    }, [activeChatId, getUserById]);
    
    const activeChatPhoto = useMemo(() => {
        if (activeChatId === GLOBAL_CHAT_ID) return null;
        const user = getUserById(activeChatId || '');
        return user?.profilePhoto || null;
    }, [activeChatId, getUserById]);

    const getLastMessage = (contactId: string) => {
        const relevantMsgs = messages.filter(m => {
            if (contactId === GLOBAL_CHAT_ID) return m.receiverId === GLOBAL_CHAT_ID;
             return (m.senderId === currentUser?.id && m.receiverId === contactId) ||
                       (m.senderId === contactId && m.receiverId === currentUser?.id);
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        if (relevantMsgs.length === 0) return '';
        const last = relevantMsgs[0];
        
        if (last.attachment) {
            return last.attachment.type === 'image' ? '📷 Photo' : '📎 File';
        }

        const content = decryptMessage(last.content);
        return content.length > 30 ? content.substring(0, 30) + '...' : content;
    };
    
    const getUnreadCount = (contactId: string) => {
        if (!currentUser) return 0;
        return messages.filter(m => {
            const notReadByMe = !m.readBy.includes(currentUser.id);
            if (!notReadByMe) return false;
            if (contactId === GLOBAL_CHAT_ID) {
                return m.receiverId === GLOBAL_CHAT_ID;
            } else {
                return m.senderId === contactId && m.receiverId === currentUser.id;
            }
        }).length;
    };
    
    // Typing Indicator Logic
    const getTypingStatusText = () => {
        if (!activeChatId || !currentUser) return null;
        
        if (activeChatId === GLOBAL_CHAT_ID) {
             // In Global Chat, look for anyone typing to GLOBAL_CHAT_ID (excluding self)
             const typers = Object.entries(typingUsers)
                .filter(([userId, receiverId]) => receiverId === GLOBAL_CHAT_ID && userId !== currentUser.id)
                .map(([userId]) => getUserById(userId)?.name)
                .filter(name => name);
                
             if (typers.length > 0) {
                 if (typers.length === 1) return `${typers[0]} is typing...`;
                 if (typers.length === 2) return `${typers[0]} and ${typers[1]} are typing...`;
                 return `${typers.length} people are typing...`;
             }
        } else {
             // In DM, check if the person I am talking to (activeChatId) is typing to me (currentUser.id)
             const isPartnerTyping = typingUsers[activeChatId] === currentUser.id;
             if (isPartnerTyping) return "typing...";
        }
        return null;
    };
    
    const typingText = getTypingStatusText();
    
    const otherUsers = useMemo(() => users.filter(u => u.id !== currentUser?.id), [users, currentUser]);

    // Filtered lists for search
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return otherUsers;
        return otherUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [otherUsers, searchQuery]);

    const showGlobalChat = useMemo(() => {
        if (!searchQuery) return true;
        return 'Global Public Chat'.toLowerCase().includes(searchQuery.toLowerCase());
    }, [searchQuery]);

    // Attachment Handlers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const isImage = file.type.startsWith('image/');
                    setAttachment({
                        type: isImage ? 'image' : 'file',
                        url: event.target.result as string,
                        name: file.name
                    });
                }
            };
            reader.readAsDataURL(file);
            // Reset input value to allow selecting same file again
            e.target.value = '';
        }
    };

    const handleCameraCapture = (dataUrl: string) => {
        setAttachment({
            type: 'image',
            url: dataUrl,
            name: `Photo_${new Date().getTime()}.jpg`
        });
        setShowCamera(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden container mx-auto md:p-4 gap-4">
                
                {/* SIDEBAR */}
                <div className={`
                    w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-800 md:rounded-lg shadow-lg flex flex-col
                    ${activeChatId && 'hidden md:flex'} 
                `}>
                    <div className="flex flex-col border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 md:rounded-t-lg">
                        <div className="p-4 flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                                title="Back to Dashboard"
                            >
                                <BackIcon />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
                        </div>
                        <div className="px-3 pb-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition duration-150 ease-in-out"
                                    placeholder="Search or start new chat"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {showGlobalChat && (
                            <ChatItem 
                                id={GLOBAL_CHAT_ID}
                                name="Global Public Chat"
                                lastMessage={getLastMessage(GLOBAL_CHAT_ID)}
                                unreadCount={getUnreadCount(GLOBAL_CHAT_ID)}
                                isActive={activeChatId === GLOBAL_CHAT_ID}
                                onClick={() => setActiveChatId(GLOBAL_CHAT_ID)}
                                icon={<UserGroupIcon />}
                            />
                        )}
                        {(filteredUsers.length > 0) && (
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-900/50">
                                Direct Messages
                            </div>
                        )}
                        {filteredUsers.map(user => (
                            <ChatItem
                                key={user.id}
                                id={user.id}
                                name={user.name}
                                time=""
                                lastMessage={getLastMessage(user.id)}
                                unreadCount={getUnreadCount(user.id)}
                                isActive={activeChatId === user.id}
                                onClick={() => setActiveChatId(user.id)}
                                icon={<UserIcon />}
                                profilePhoto={user.profilePhoto}
                            />
                        ))}
                        {filteredUsers.length === 0 && !showGlobalChat && (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No contacts found.
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CHAT AREA */}
                <div className={`
                    flex-1 bg-white dark:bg-slate-800 md:rounded-lg shadow-lg flex flex-col relative
                    ${!activeChatId && 'hidden md:flex'}
                `}>
                    {activeChatId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 md:p-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center md:rounded-t-lg shadow-sm z-10">
                                <button 
                                    className="md:hidden mr-3 p-1 text-gray-600 dark:text-gray-300"
                                    onClick={() => setActiveChatId(null)}
                                >
                                    <BackIcon />
                                </button>
                                <div className="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-white mr-3 overflow-hidden">
                                    {activeChatPhoto ? (
                                        <img src={activeChatPhoto} alt={activeChatName} className="h-full w-full object-cover" />
                                    ) : (
                                        activeChatId === GLOBAL_CHAT_ID ? <UserGroupIcon /> : <UserIcon />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{activeChatName}</h3>
                                        {activeChatId !== GLOBAL_CHAT_ID && <LockIcon />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeChatId !== GLOBAL_CHAT_ID && (
                                            <>
                                                {typingText ? (
                                                     <p className="text-xs text-green-500 font-bold animate-pulse">{typingText}</p>
                                                ) : (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                        End-to-end encrypted <span className="text-gray-300 mx-1">•</span> <span className="text-green-500 font-medium">Online</span>
                                                    </p>
                                                )}
                                            </>
                                        )}
                                        {activeChatId === GLOBAL_CHAT_ID && typingText && (
                                            <p className="text-xs text-green-500 font-bold animate-pulse">{typingText}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div 
                                className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] dark:bg-[#0b141a]"
                                style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay', backgroundSize: '400px' }}
                            >
                                {activeChatId !== GLOBAL_CHAT_ID && (
                                    <div className="flex justify-center mb-6">
                                        <div className="bg-yellow-200/90 dark:bg-yellow-900/50 p-2 rounded-lg text-xs text-center text-gray-700 dark:text-gray-200 shadow-sm max-w-xs flex items-center justify-center gap-2">
                                            <LockIcon />
                                            Messages are E2EE.
                                        </div>
                                    </div>
                                )}
                                
                                {sortedMessages.length === 0 ? (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-lg text-center shadow">
                                            <p className="text-gray-600 dark:text-gray-300">No messages yet. Start the conversation!</p>
                                        </div>
                                    </div>
                                ) : (
                                    sortedMessages.map(msg => (
                                        <MessageBubble 
                                            key={msg.id} 
                                            message={msg} 
                                            isSelf={msg.senderId === currentUser?.id}
                                            senderName={getUserById(msg.senderId)?.name || 'Unknown'}
                                        />
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Attachment Preview Area */}
                            {attachment && (
                                <div className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t border-gray-300 dark:border-slate-700 flex items-center gap-4 animate-fade-in-up">
                                    <div className="relative flex-shrink-0 group">
                                        {attachment.type === 'image' ? (
                                            <img src={attachment.url} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-gray-300 dark:border-slate-600 shadow-sm" />
                                        ) : (
                                            <div className="h-16 w-16 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 shadow-sm">
                                                <FileIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setAttachment(null)}
                                            className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow-md hover:bg-gray-700 transition-colors z-10"
                                            title="Remove attachment"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {attachment.type === 'image' ? 'Send Photo' : 'Send File'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={attachment.name}>
                                            {attachment.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 md:rounded-b-lg flex items-center gap-2">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileSelect}
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    title="Attach File"
                                >
                                    <PaperClipIcon />
                                </button>
                                
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={handleInputChange}
                                        placeholder="Type a message..."
                                        className="w-full py-3 pl-4 pr-10 rounded-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowCamera(true)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
                                        title="Take Photo"
                                    >
                                        <CameraIcon />
                                    </button>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={!messageInput.trim() && !attachment}
                                    className="p-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                                >
                                    <SendIcon />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-10 bg-slate-50 dark:bg-slate-800 md:rounded-lg border-b-4 border-green-500">
                             <div className="mb-6 p-6 bg-green-100 dark:bg-slate-700 rounded-full text-green-600 dark:text-green-400">
                                <UserGroupIcon />
                             </div>
                            <h2 className="text-3xl font-light text-gray-700 dark:text-gray-200 mb-4">CIL VC Connect Messenger</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                Send and receive messages instantly. Select a chat from the left menu to start messaging.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Overlay */}
            {showCamera && (
                <CameraModal 
                    onCapture={handleCameraCapture} 
                    onClose={() => setShowCamera(false)} 
                />
            )}
        </div>
    );
};

export default ChatScreen;
