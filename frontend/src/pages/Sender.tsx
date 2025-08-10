import { useEffect, useRef} from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Timer } from "../components/Timer";
import { Feature } from "../assets/icons/Feature";
import { Notification } from "../components/Notification";
import { detectNetworkError, getOptimalTimeout, checkBackendStatus } from "../utils/networkUtils";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { useState } from "react";
import {
    setContent,
    setCode,
    setCopied,
    setErrorMessage,
    setTimeLeft,
    setIsTimerActive,
    setShowNotification,
    setNotificationMessage,
    setNotificationType,
    setTextareaHeight,
    setPreviousSessionData,
    setIsPayloadTooLarge,
    setIsRateLimited,
    setRateLimitCooldown,
    setIsRateLimitNotificationActive,
} from "../store/senderSlice";

const backend_url = import.meta.env.VITE_BACKEND_URI;

// Maximum payload size in characters (matching backend limit)
const MAX_PAYLOAD_SIZE = 10000;

export function Sender(){
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const {
        content,
        code,
        copied,
        errorMessage,
        timeLeft,
        isTimerActive,

        showNotification,
        notificationMessage,
        notificationType,
        textareaHeight,
        previousSessionData,
        isPayloadTooLarge,
        isRateLimited,
        rateLimitCooldown,
        isRateLimitNotificationActive,
    } = useSelector((state: RootState) => state.sender);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rateLimitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [imageKey, setImageKey] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    function handleSelectedFile(file: File | null) {
        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }
        if (!file.type.startsWith("image/")) {
            setNotificationMessage("Please select a valid image file");
            setNotificationType("warning");
            setShowNotification(true);
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }
        setSelectedFile(file);
        setUploadProgress(0);
        setImageKey(null);
        const url = URL.createObjectURL(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
    }

    // Rate limiting cooldown timer
    useEffect(() => {
        if (isRateLimited && rateLimitCooldown > 0) {
            let prev = rateLimitCooldown;
            rateLimitTimerRef.current = setInterval(() => {
                if (prev <= 1) {
                    dispatch(setIsRateLimited(false));
                    dispatch(setIsRateLimitNotificationActive(false));
                    // Clear localStorage when timer finishes
                    localStorage.removeItem('senderRateLimit');
                    prev = 0;
                    dispatch(setRateLimitCooldown(0));
                }
                else {
                    const newValue = prev - 1;
                    // Update localStorage with new countdown value
                    localStorage.setItem('senderRateLimit', JSON.stringify({
                        timestamp: Date.now(),
                        cooldown: prev
                    }));
                    prev = newValue;
                    dispatch(setRateLimitCooldown(newValue));
                }
            }, 1000);

            return () => {
                if (rateLimitTimerRef.current) {
                    clearInterval(rateLimitTimerRef.current);
                }
            };
        }
    }, [isRateLimited, rateLimitCooldown, dispatch]);

    // Check for existing rate limit on component mount
    useEffect(() => {
        const savedRateLimit = localStorage.getItem('senderRateLimit');
        if (savedRateLimit) {
            try {
                const { timestamp, cooldown } = JSON.parse(savedRateLimit);
                const elapsed = Math.floor((Date.now() - timestamp) / 1000);
                const remaining = Math.max(0, cooldown - elapsed);
                
                if (remaining > 0) {
                    dispatch(setIsRateLimited(true));
                    dispatch(setRateLimitCooldown(remaining));
                } else {
                    // Clear expired rate limit
                    localStorage.removeItem('senderRateLimit');
                }
            } catch {
                // Clear invalid localStorage data
                localStorage.removeItem('senderRateLimit');
            }
        }
    }, [dispatch]);

    // Check payload size whenever content changes
    useEffect(() => {
        const isTooLarge = content.length > MAX_PAYLOAD_SIZE;
        dispatch(setIsPayloadTooLarge(isTooLarge));
        
        // Show notification when payload becomes too large (only once) - but not during rate limiting
        if (isTooLarge && !showNotification && !isRateLimited && !isRateLimitNotificationActive) {
            dispatch(setNotificationMessage("Content Limit Exceeded\nPlease reduce your content to proceed"));
            dispatch(setNotificationType("warning"));
            dispatch(setShowNotification(true));
        }
    }, [content, showNotification, isRateLimited, isRateLimitNotificationActive, dispatch]);

    // Timer effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        
        if (isTimerActive && timeLeft !== null && timeLeft > 0) {
            let prev = timeLeft;
            interval = setInterval(() => {
                if (prev !== null && prev > 0) {
                    prev = prev - 1;
                    dispatch(setTimeLeft(prev));
                } else {
                    dispatch(setIsTimerActive(false));
                    dispatch(setCode(null));
                    prev = 0;
                    dispatch(setTimeLeft(null));
                }
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isTimerActive, timeLeft, dispatch]);

    // Backend health check on component mount
    useEffect(() => {
        const checkBackendHealth = async () => {
            try {
                await axios.get(`${backend_url}/api/v1/user/health`, { timeout: getOptimalTimeout() });
            } catch (error) {
                const errorInfo = detectNetworkError(error);
                
                // If it's a connection issue, try to determine if it's backend down or network issue
                if (errorInfo.isMobileNetworkIssue && !errorInfo.message.includes("Backend Is Down")) {
                    const isNetworkIssue = await checkBackendStatus();
                    if (!isNetworkIssue) {
                        // If we can reach internet but not backend, it's backend down
                        dispatch(setNotificationMessage("Backend Is Down\nWe are on it, please try again later"));
                        dispatch(setNotificationType("error"));
                    } else {
                        // It's a network issue
                        dispatch(setNotificationMessage(errorInfo.message));
                        dispatch(setNotificationType(errorInfo.type));
                    }
                } else {
                    dispatch(setNotificationMessage(errorInfo.message));
                    dispatch(setNotificationType(errorInfo.type));
                }
                // Only show notification if not in rate limit mode
                if (!isRateLimitNotificationActive) {
                    dispatch(setShowNotification(true));
                }
            }
        };

        // Only run health check if not rate limited
        if (!isRateLimited && !isRateLimitNotificationActive) {
            checkBackendHealth();
        }
    }, [isRateLimited, isRateLimitNotificationActive, dispatch]);

    const startTimer = (seconds: number = 120) => {
        dispatch(setTimeLeft(seconds));
        dispatch(setIsTimerActive(true));
    };

    const clearContent = () => {
        if (!isRateLimited && !isRateLimitNotificationActive) {
            dispatch(setNotificationMessage("Ctrl + A and Backspace"));
            dispatch(setNotificationType("guide"));
            dispatch(setShowNotification(true));
        }
    };

    // Removed unused icon-click handler after replacing toolbar icons with mode buttons


    // useEffect(() => {
    //     console.log(content);
    // }, [content]) 
    //  used only for debugging not for production

    // Auto-resize textarea based on content with smooth animations
    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            
            // Calculate the natural height
            const naturalHeight = textarea.scrollHeight;
            const minHeight = 48; // Minimum height
            const maxHeight = 200; // Maximum height before scrollbar
            
            // Determine the target height
            let targetHeight: number;
            let needsScrollbar: boolean;
            
            if (naturalHeight <= minHeight) {
                targetHeight = minHeight;
                needsScrollbar = false;
            } else if (naturalHeight > maxHeight) {
                targetHeight = maxHeight;
                needsScrollbar = true;
            } else {
                targetHeight = naturalHeight;
                needsScrollbar = false;
            }
            
            // Update the height state for smooth animation
            dispatch(setTextareaHeight(targetHeight));
            
            // Update classes for scrollbar
            if (needsScrollbar) {
                textarea.classList.add('overflow-y-auto');
                textarea.classList.remove('overflow-y-hidden');
            } else {
                textarea.classList.add('overflow-y-hidden');
                textarea.classList.remove('overflow-y-auto');
            }
        }
    }, [content, dispatch]);

    async function SaveContent() {
        if (textareaRef.current) {
            const value = textareaRef.current.value.trim();
            
            // Check if the content is empty or only whitespace
            if (!value) {
                dispatch(setErrorMessage("Please enter some content before sending!"));
                textareaRef.current.focus();
                return;
            }
            
            // Check if payload is too large
            if (value.length > MAX_PAYLOAD_SIZE) {
                dispatch(setNotificationMessage("Too much data! Please reduce your content."));
                dispatch(setNotificationType("warning"));
                dispatch(setShowNotification(true));
                return;
            }
            
            dispatch(setErrorMessage("")); // Clear any previous error message
            dispatch(setContent(value));
            
            // Check if there's already an active session
            const hasActiveSession = isTimerActive && timeLeft !== null && timeLeft > 0;
            const previousCode = code;
            const previousTimeLeft = timeLeft;
            
            try {
                const response = await axios.post(`${backend_url}/api/v1/user/send`, {
                    content: value
                }, { timeout: getOptimalTimeout() });
                
                const newCode = response.data?.code || null;
                
                // Show notification immediately if there was a previous active session (but not during rate limiting)
                if (hasActiveSession && previousCode && previousTimeLeft && !isRateLimited && !isRateLimitNotificationActive) {
                    const formatTime = (seconds: number): string => {
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };
                    
                    dispatch(setPreviousSessionData({ code: previousCode, timeLeft: previousTimeLeft }));
                    dispatch(setNotificationMessage(`Previous session: ${previousCode} (${formatTime(previousTimeLeft)} left)`));
                    dispatch(setNotificationType("guide"));
                    dispatch(setShowNotification(true));
                }
                
                // Start new session after showing notification (text: 2 minutes)
                startTimer(120);
                dispatch(setCode(newCode));
            } catch (error) {
                console.error("Failed to send content:", error);
                
                const errorInfo = detectNetworkError(error);
                
                // Check if it's a rate limiting error
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response?.status === 429) {
                    const retrySeconds = errorInfo.retryAfter || 90; // Use backend retry time or default to 90 seconds
                    dispatch(setIsRateLimited(true));
                    dispatch(setRateLimitCooldown(retrySeconds));
                    dispatch(setIsRateLimitNotificationActive(true));
                    // Save rate limit state to localStorage
                    localStorage.setItem('senderRateLimit', JSON.stringify({
                        timestamp: Date.now(),
                        cooldown: retrySeconds
                    }));
                    // Clear ALL existing notifications including previous session data
                    dispatch(setShowNotification(false));
                    dispatch(setPreviousSessionData(null));
                    // Clear any existing timers
                    if (autoDismissTimerRef.current) {
                        clearTimeout(autoDismissTimerRef.current);
                        autoDismissTimerRef.current = null;
                    }
                    // Clear any existing intervals for previous session countdown
                    if (rateLimitTimerRef.current) {
                        clearInterval(rateLimitTimerRef.current);
                        rateLimitTimerRef.current = null;
                    }
                    setTimeout(() => {
                        dispatch(setNotificationMessage(errorInfo.message));
                        dispatch(setNotificationType(errorInfo.type));
                        dispatch(setShowNotification(true));
                    }, 100);
                    return;
                }
                
                // If it's a connection issue, try to determine if it's backend down or network issue
                if (errorInfo.isMobileNetworkIssue && !errorInfo.message.includes("Backend Is Down")) {
                    const isNetworkIssue = await checkBackendStatus();
                    if (!isNetworkIssue) {
                        // If we can reach internet but not backend, it's backend down
                        dispatch(setNotificationMessage("Backend Is Down\nWe are on it, please try again later"));
                        dispatch(setNotificationType("error"));
                    } else {
                        // It's a network issue
                        dispatch(setNotificationMessage(errorInfo.message));
                        dispatch(setNotificationType(errorInfo.type));
                    }
                } else {
                    dispatch(setNotificationMessage(errorInfo.message));
                    dispatch(setNotificationType(errorInfo.type));
                }
                dispatch(setShowNotification(true));
            }
        }
    }

    async function UploadImage() {
        try {
            if (!selectedFile) {
                setNotificationMessage("Please choose an image to upload");
                setNotificationType("warning");
                setShowNotification(true);
                return;
            }
            if (isRateLimited || isRateLimitNotificationActive) {
                return;
            }
            setIsUploading(true);
            setUploadProgress(0);
            setImageKey(null);

            const params = new URLSearchParams({
                filename: selectedFile.name,
                contentType: selectedFile.type || 'application/octet-stream'
            });

            const { data } = await axios.get(`${backend_url}/api/v1/images/upload-url?${params.toString()}`, { timeout: getOptimalTimeout() });
            const { uploadUrl, key } = data as { uploadUrl: string; key: string };

            await axios.put(uploadUrl, selectedFile, {
                headers: { 'Content-Type': selectedFile.type || 'application/octet-stream' },
                onUploadProgress: (evt) => {
                    if (evt.total) {
                        const pct = Math.round((evt.loaded * 100) / evt.total);
                        setUploadProgress(pct);
                    }
                }
            });

            setImageKey(key);
            // Generate a 4-digit OTP for the image, reuse existing /send
            try {
                const resp = await axios.post(`${backend_url}/api/v1/user/send`, { content: key }, { timeout: getOptimalTimeout() });
                const newCode = resp.data?.code || null;
                if (newCode) {
                    // Image OTP valid for ~5 minutes to match S3 temp object lifetime
                    startTimer(300);
                    dispatch(setCode(newCode));
                }
            } catch (sendErr) {
                console.error('Failed to generate OTP for image key:', sendErr);
            }

            setNotificationMessage("Image uploaded successfully\nShare within ~5 minutes to your peers");
            setNotificationType("success");
            setShowNotification(true);
        } catch (error) {
            console.error('Image upload failed:', error);
            setNotificationMessage("Failed to upload image. Please try again.");
            setNotificationType("error");
            setShowNotification(true);
        } finally {
            setIsUploading(false);
        }
    }

    const handleModeChange = (newMode: 'text' | 'image') => {
        setMode(newMode);
        // reset state when switching modes
        if (newMode === 'text') {
            setSelectedFile(null);
            setUploadProgress(0);
            setImageKey(null);
        } else {
            setCode(null);
        }
    };

    const handleCloseNotification = () => {
        // Don't allow closing rate limit notifications
        if (isRateLimited || isRateLimitNotificationActive) {
            return;
        }
        
        // Clear the auto-dismiss timer if it exists
        if (autoDismissTimerRef.current) {
            clearTimeout(autoDismissTimerRef.current);
            autoDismissTimerRef.current = null;
        }
        dispatch(setShowNotification(false));
    };

    // Real-time countdown for previous session notification (but not during rate limiting)
    useEffect(() => {
        // Block any previous session notifications when rate limited
        if (isRateLimited || isRateLimitNotificationActive) {
            dispatch(setPreviousSessionData(null));
            return;
        }
        
        if (showNotification && previousSessionData && previousSessionData.timeLeft > 0 && !isRateLimited && !isRateLimitNotificationActive) {
            let prev = previousSessionData;
            const interval = setInterval(() => {
                // Double-check rate limiting status before updating
                if (isRateLimited || isRateLimitNotificationActive) {
                    dispatch(setPreviousSessionData(null));
                    dispatch(setShowNotification(false));
                    clearInterval(interval);
                    return;
                }
                
                if (prev && prev.timeLeft > 0) {
                    const newTimeLeft = prev.timeLeft - 1;
                        
                    // Update notification message with real-time countdown
                    const formatTime = (seconds: number): string => {
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };
                    
                    dispatch(setNotificationMessage(`Previous session: ${prev.code} (${formatTime(newTimeLeft)} left)`));
                        
                    // Dismiss notification when timer reaches zero
                    if (newTimeLeft <= 0) {
                        dispatch(setShowNotification(false));
                        dispatch(setPreviousSessionData(null));
                        clearInterval(interval);
                    }
                    else {
                        dispatch(setPreviousSessionData({ ...prev, timeLeft: newTimeLeft }));
                        prev = { ...prev, timeLeft: newTimeLeft };
                    }
                }
                else {
                    dispatch(setPreviousSessionData(prev));
                };
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [showNotification, previousSessionData, isRateLimited, isRateLimitNotificationActive, dispatch]);

    // Session timer effect - handles the countdown for the active session
    useEffect(() => {
        if (isTimerActive && timeLeft !== null && timeLeft > 0) {
            let prev = timeLeft;
            const timer = setInterval(() => {
                if (prev !== null && prev > 0) {
                    prev = prev - 1;
                } else {
                    dispatch(setIsTimerActive(false));
                    prev = 0;
                }
                dispatch(setTimeLeft(prev));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isTimerActive, timeLeft, dispatch]);

    // Auto-dismiss other notifications after 3 seconds (but not during rate limiting)
    useEffect(() => {
        // Block auto-dismiss when rate limited
        if (isRateLimited || isRateLimitNotificationActive) {
            if (autoDismissTimerRef.current) {
                clearTimeout(autoDismissTimerRef.current);
                autoDismissTimerRef.current = null;
            }
            return;
        }
        
        if (showNotification && !previousSessionData && !isRateLimited && !isRateLimitNotificationActive) {
            // Clear any existing timer
            if (autoDismissTimerRef.current) {
                clearTimeout(autoDismissTimerRef.current);
            }
            
            // Set new timer and store reference
            autoDismissTimerRef.current = setTimeout(() => {
                // Double-check rate limiting status before dismissing
                if (!isRateLimited && !isRateLimitNotificationActive) {
                    dispatch(setShowNotification(false));
                }
                autoDismissTimerRef.current = null;
            }, 3000);

            return () => {
                if (autoDismissTimerRef.current) {
                    clearTimeout(autoDismissTimerRef.current);
                    autoDismissTimerRef.current = null;
                }
            };
        }
    }, [showNotification, previousSessionData, isRateLimited, isRateLimitNotificationActive, dispatch]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#191A1A] px-4 sm:px-0">
            {/* Navigation button to receive page */}
            <motion.button
                onClick={() => navigate('/receive')}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-lg text-white text-sm font-medium cursor-pointer backdrop-blur-sm"
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    delay: 0.2
                }}
                whileHover={{ 
                    scale: 1.1, 
                    boxShadow: "0 10px 25px rgba(0, 216, 255, 0.3)",
                    borderColor: "rgba(0, 216, 255, 0.8)"
                }}
                whileTap={{ 
                    scale: 0.95, 
                    y: 0,
                    transition: { duration: 0.1 }
                }}
                title="Go to Receive Page"
            >
                <motion.svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 20,
                        delay: 0.4
                    }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </motion.svg>
                <motion.span 
                    className="hidden sm:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25,
                        delay: 0.6
                    }}
                    whileHover={{ 
                        color: "rgb(0, 216, 255)"
                    }}
                >
                    Receive
                </motion.span>
            </motion.button>
            
            <div className="flex flex-col w-full max-w-[36rem] mt-4 relative z-10">
                {/* Textarea container */}
                <div className="flex flex-col w-full bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden relative border border-neutral-600">
                    {/* Hint section mounted on top */}
                    <div className="absolute -top-2 left-2 right-2 sm:left-4 sm:right-4 z-20">
                        <div className={`flex items-center gap-2 backdrop-blur-sm border rounded-md px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg transition-all duration-500 ease-in-out bg-[#2A2A2A]/90 border-white/10`}>
                            <div className="text-cyan-400/80 flex-shrink-0">
                                <Feature />
                            </div>
                            <span className="text-white text-xs sm:text-sm leading-relaxed">
                                <span className="hidden sm:inline">
                                    <b>Files and Code sharing</b> with multi-language support will be available in <b className="text-[#09B1CB]"> V2</b>
                                </span>
                                <span className="sm:hidden">
                                    <b>Files and Code sharing</b> will soon be in <b className="text-[#09B1CB]"> V2 (beta)</b>
                                </span>
                            </span>
                        </div>
                    </div>
                    
                    
                    {/* Input area with subtle transition between modes */}
                    <AnimatePresence mode="wait">
                    {mode === 'text' ? (
                    <motion.div
                        key="text-mode"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="flex-4 p-3 sm:p-4 pt-6 sm:pt-8 pb-2 mt-6 sm:mt-8"
                    >
                        <motion.textarea
                            id="content-textarea"
                            name="content"
                            className={`w-full min-w-0 resize-none focus:outline-none border-none bg-transparent pt-2 pl-2 text-left placeholder:text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cyan-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-cyan-300 [&::-webkit-scrollbar-thumb]:cursor-pointer [&::selection]:bg-cyan-400/30 [&::selection]:text-[#00d8ff] [&::-moz-selection]:bg-cyan-400/30 [&::-moz-selection]:text-[#00d8ff] text-sm sm:text-base ${
                                errorMessage ? 'text-red-400 placeholder-red-400' : isRateLimited ? 'text-gray-500 placeholder-gray-500' : 'text-white placeholder-gray-400'
                            }`}
                            disabled={isRateLimited}
                            style={{ height: textareaHeight }}
                            animate={{
                                height: textareaHeight
                            }}
                            transition={{ 
                                duration: 0.4,
                                ease: "easeInOut",
                                type: "spring",
                                stiffness: 100,
                                damping: 20
                            }}
                            ref={textareaRef}
                            placeholder={errorMessage || (window.innerWidth >= 640 ? 
`Paste your message or code — we'll generate an OTP to share it.
                                
public class Example {
    public static void main( String[] args ) {
        System.out.println("Example for sharing a Java-Program");
    }
}` : 
`Paste your message or code — 
we'll generate an OTP to share it.
                                
public class Example {
    public static void main( String[] args ) {
        System.out.println(" Example Java-Code ");
    }
}`)}
                            value={content}
                            spellCheck={false}
                            onChange={e => {
                                dispatch(setContent(e.target.value));
                                if (errorMessage) dispatch(setErrorMessage("")); // Clear error when user starts typing
                            }}
                            onKeyDown={e => {
                                // Check if it's mobile device
                                const isMobile = window.innerWidth < 768; // md breakpoint
                                
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    if (isMobile) {
                                        // On mobile, allow Enter to create new line
                                        // Only button click will generate OTP
                                        return;
                                    } else {
                                        // On desktop, Enter generates OTP
                                        e.preventDefault();
                                        if (!isPayloadTooLarge && !isRateLimited) {
                                            SaveContent();
                                        }
                                    }
                                }
                            }}
                            rows={1}
                        ></motion.textarea>
                    </motion.div>
                    ) : (
                        <motion.div
                            key="image-mode"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="flex-4 p-3 sm:p-4 pt-6 sm:pt-8 pb-2 mt-6 sm:mt-8"
                        >
                            <div className="flex flex-col gap-3">
                                {/* Dropzone */}
                                <div
                                    className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-6 cursor-pointer ${
                                        isDragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/15 bg-white/5'
                                    }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                                    onDragLeave={() => setIsDragActive(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragActive(false);
                                        const file = e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null;
                                        handleSelectedFile(file);
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 19V6M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="text-white text-sm font-medium">Drag and drop an image</div>
                                    <div>
                                        <button className="mt-1 px-3 py-1 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm">Or select file</button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                            handleSelectedFile(file);
                                        }}
                                        disabled={isUploading || isRateLimited}
                                    />
                                </div>

                                {/* Selection details */}
                                {selectedFile && (
                                    <div className="flex items-center gap-3 text-xs text-gray-300">
                                        {previewUrl && (
                                            <img src={previewUrl} alt="preview" className="w-10 h-10 object-cover rounded" />
                                        )}
                                        <div className="break-all">
                                            {selectedFile.name} {selectedFile.type ? `(${selectedFile.type})` : ''} - {(selectedFile.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                )}
                                {isUploading && (
                                    <div className="w-full bg-white/10 rounded h-2 overflow-hidden">
                                        <motion.div
                                            className="bg-cyan-500 h-2"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                                        />
                                    </div>
                                )}
                                {imageKey && (
                                    <div className="text-xs text-green-400 break-all">Key: {imageKey}</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    
                    {/* Bottom section with interactive icons */}
                    <div className="flex flex-col">
                        {/* Character counter */}
                        <div className="flex justify-end px-3 sm:px-4 pt-2 pb-1">
                            {mode === 'text' ? (
                            <span className={`text-xs ${
                                content.length > MAX_PAYLOAD_SIZE 
                                    ? 'text-red-400' 
                                    : content.length > MAX_PAYLOAD_SIZE * 0.8 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-400'
                            }`}>
                                {content.length}/{MAX_PAYLOAD_SIZE}
                            </span>
                            ) : (
                                <span className="text-xs text-gray-400">Image uploads expire automatically in ~5 minutes</span>
                            )}
                        </div>
                        
                        {/* Controls row */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-t border-white/10 bg-[#2A2A2A]">
                            {/* Left side - GitHub logo and OTP box */}
                            <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* GitHub Logo */}
                            <a
                                href="https://github.com/rshdhere/copy-paste.space"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-cyan-400/30 bg-cyan-400/10 cursor-pointer transition-colors hover:bg-[#09B1CB]/20"
                                title="give us a star"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                                </svg>
                            </a>
                            
                            {/* OTP Box (used for both Text and Image modes) */}
                            <motion.div 
                                className="flex items-center space-x-1.5 sm:space-x-2 bg-transparent rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 border border-gray-400/30 cursor-pointer hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 300, 
                                    damping: 25,
                                    delay: 0.1
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.span 
                                    className="text-white text-xs sm:text-sm font-mono"
                                    key={code || "otp"}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 400, 
                                        damping: 20,
                                        duration: 0.3
                                    }}
                                >
                                    {code || "OTP"}
                                </motion.span>
                                <motion.button 
                                    onClick={() => {
                                        if (code) {
                                            navigator.clipboard.writeText(code);
                                            dispatch(setCopied(true));
                                            setTimeout(() => dispatch(setCopied(false)), 2000);
                                        }
                                    }}
                                    className={`transition-colors cursor-pointer p-0.5 sm:p-1 rounded-lg hover:bg-white/5 ${
                                        code ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500'
                                    }`}
                                    title={code ? "Copy to clipboard" : "no otp yet"}
                                    disabled={!code}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.svg 
                                                key="check"
                                                className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                                initial={{ scale: 0, rotate: -90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 90 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </motion.svg>
                                        ) : (
                                            <motion.svg 
                                                key="copy"
                                                className="w-3 h-3 sm:w-4 sm:h-4" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                                initial={{ scale: 0, rotate: 90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: -90 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </motion.svg>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </motion.div>
                        </div>
                        
                        {/* Right side - additional tools */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Clear button - hidden on mobile */}
                            <motion.svg 
                                onClick={clearContent}
                                className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                whileHover={{ 
                                    scale: 1.1, 
                                    rotate: 5
                                }}
                                whileTap={{ 
                                    scale: 0.9, 
                                    rotate: -5
                                }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 400, 
                                    damping: 15
                                }}
                            >
                                <title>Clear content</title>
                                <motion.path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                                <motion.path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="m5.082 11.09 8.828 8.828"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
                                />
                            </motion.svg>
                            {/* Mode switch buttons */}
                            <button
                                type="button"
                                onClick={() => handleModeChange('text')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${mode === 'text' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-transparent border-white/15 text-gray-300 hover:bg-white/5'}`}
                                title="Text"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 6h16M8 6v12m8-12v12M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="hidden sm:inline">Text</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange('image')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${mode === 'image' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-transparent border-white/15 text-gray-300 hover:bg-white/5'}`}
                                title="Image"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                                    <path d="M8 13l3-3 5 6" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="8" cy="9" r="1.5" />
                                </svg>
                                <span className="hidden sm:inline">Image</span>
                            </button>
                            {/* Send button */}
                            <div onClick={(!isRateLimited && (mode === 'text' ? !isPayloadTooLarge : !!selectedFile) && !isUploading) ? (mode === 'text' ? SaveContent : UploadImage) : undefined} className={(isRateLimited || (mode === 'text' ? isPayloadTooLarge : !selectedFile) || isUploading) ? "cursor-not-allowed" : "cursor-pointer"}>
                                <Button disabled={isRateLimited || (mode === 'text' ? isPayloadTooLarge : !selectedFile) || isUploading} rateLimitCooldown={rateLimitCooldown}/>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                
                {/* Timer display outside textarea */}
                <Timer isActive={isTimerActive} timeLeft={timeLeft} />
            </div>
            
            {/* Notification component */}
            <Notification
                isVisible={showNotification}
                message={notificationMessage}
                type={notificationType}
                onClose={handleCloseNotification}
            />
        </div>
    );
}