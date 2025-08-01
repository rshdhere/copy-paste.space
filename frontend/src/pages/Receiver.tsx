import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";
import { ProgressRing } from "../components/ProgressRing";
import { Feature } from "../assets/icons/Feature";
import { Notification } from "../components/Notification";
import { detectNetworkError, getOptimalTimeout, checkBackendStatus } from "../utils/networkUtils";
const backend_url = import.meta.env.VITE_BACKEND_URI;

export function Receiver(){

    const [otp, setOtp] = useState('');
    const [receivedContent, setReceivedContent] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [placeholder, setPlaceholder] = useState('');
    const [animationState, setAnimationState] = useState<'expanding' | 'expanded' | 'complete'>('expanding');
    const [notification, setNotification] = useState<{ isVisible: boolean; message: string; type: "error" | "warning" | "success" | "guide" }>({
        isVisible: false,
        message: "",
        type: "error"
    });
    const otpRef = useRef<HTMLInputElement>(null);
    const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // useEffect(() => {
    //     console.log(otp)
    // }, [otp])
    //  used only for debugging not for production

    useEffect(() => {
        const updatePlaceholder = () => {
            if (window.innerWidth < 640) { // sm breakpoint
                setPlaceholder('enter the one-time-password');
            } else {
                setPlaceholder('enter the verification-code / one-time-password');
            }
        };

        updatePlaceholder();
        window.addEventListener('resize', updatePlaceholder);
        
        return () => window.removeEventListener('resize', updatePlaceholder);
    }, []);

    // Animation sequence
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setAnimationState('expanded');
        }, 600);

        const timer2 = setTimeout(() => {
            setAnimationState('complete');
        }, 1200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

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
                        setNotification({
                            isVisible: true,
                            message: "Backend Is Down\nWe are on it, please try again later",
                            type: "error"
                        });
                    } else {
                        // It's a network issue
                        setNotification({
                            isVisible: true,
                            message: errorInfo.message,
                            type: errorInfo.type
                        });
                    }
                } else {
                    setNotification({
                        isVisible: true,
                        message: errorInfo.message,
                        type: errorInfo.type
                    });
                }
            }
        };

        checkBackendHealth();
    }, []);

    async function OTPChecker(){
        if(otpRef.current){
            const value = otpRef.current.value.toUpperCase().trim();
            
            // Check if the OTP is empty or only whitespace
            if (!value) {
                setNotification({
                    isVisible: true,
                    message: "Please enter an OTP to receive content!",
                    type: "error"
                });
                otpRef.current.focus();
                return;
            }
            
            setOtp(value);
            
            try{
                const response = await axios.get(`${backend_url}/api/v1/user/receive`, {
                    params: { userCode: value },
                    timeout: getOptimalTimeout()
                });
                // otpRef.current.value = "";
                // setOtp("");
                const dataArr = response.data?.data;
                if (Array.isArray(dataArr) && dataArr.length > 0) {
                    setReceivedContent(dataArr[0].content);
                } else {
                    setNotification({
                        isVisible: true,
                        message: "Wrong OTP",
                        type: "error"
                    });
                    setReceivedContent(null); // Clear any previous content
                }
            } catch(error) {
                console.error("Failed to fetch content:", error);
                
                // Check if it's a 404 error (wrong OTP or expired session)
                const axiosError = error as { response?: { status?: number; data?: unknown } };
                if (axiosError.response?.status === 404) {
                    setNotification({
                        isVisible: true,
                        message: "Wrong OTP\nCode doesn't match or session expired",
                        type: "error"
                    });
                } else {
                    const errorInfo = detectNetworkError(error);
                    
                    // If it's a connection issue, try to determine if it's backend down or network issue
                    if (errorInfo.isMobileNetworkIssue && !errorInfo.message.includes("Backend Is Down")) {
                        const isNetworkIssue = await checkBackendStatus();
                        if (!isNetworkIssue) {
                            // If we can reach internet but not backend, it's backend down
                            setNotification({
                                isVisible: true,
                                message: "Backend Is Down\nWe are on it, please try again later",
                                type: "error"
                            });
                        } else {
                            // It's a network issue
                            setNotification({
                                isVisible: true,
                                message: errorInfo.message,
                                type: errorInfo.type
                            });
                        }
                    } else {
                        setNotification({
                            isVisible: true,
                            message: errorInfo.message,
                            type: errorInfo.type
                        });
                    }
                }
                setReceivedContent(null); // Clear any previous content
            }
        }
    }

    // Auto-dismiss notifications after 3 seconds
    useEffect(() => {
        if (notification.isVisible) {
            // Clear any existing timer
            if (autoDismissTimerRef.current) {
                clearTimeout(autoDismissTimerRef.current);
            }
            
            // Set new timer and store reference
            autoDismissTimerRef.current = setTimeout(() => {
                setNotification(prev => ({ ...prev, isVisible: false }));
                autoDismissTimerRef.current = null;
            }, 3000);

            return () => {
                if (autoDismissTimerRef.current) {
                    clearTimeout(autoDismissTimerRef.current);
                    autoDismissTimerRef.current = null;
                }
            };
        }
    }, [notification.isVisible]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#191A1A] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center w-full max-w-[36rem] mt-4 relative z-10">
                {/* Content container - starts expanding immediately */}
                <div 
                    className="flex flex-col bg-[#2A2A2A] rounded-full shadow-lg overflow-hidden relative border border-neutral-600"
                    style={{
                        transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        width: animationState === 'expanding' ? '64px' : '100%',
                        height: animationState === 'expanding' ? '64px' : 'auto',
                        transform: animationState === 'expanding' ? 'scale(0.95)' : 'scale(1)',
                        opacity: animationState === 'expanding' ? 0.8 : 1,
                        margin: '0 auto',
                        zIndex: 10
                    }}
                >
                    
                    {/* OTP input and Button in same capsule */}
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full relative">
                            <input 
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-center border-transparent rounded-l-lg bg-transparent transition-all duration-100 ease-out focus:outline-none placeholder:text-center text-base sm:text-lg font-satoshi placeholder:font-satoshi text-white placeholder-gray-400 [&::selection]:bg-cyan-400/30 [&::selection]:text-[#00d8ff] [&::-moz-selection]:bg-cyan-400/30 [&::-moz-selection]:text-[#00d8ff]"
                                type="text" 
                                maxLength={4} 
                                ref={otpRef}
                                placeholder={placeholder}
                                spellCheck={false}
                                onChange={e => {
                                    setOtp(e.target.value);
                                    if (notification.isVisible) {
                                        setNotification(prev => ({ ...prev, isVisible: false }));
                                    }
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        OTPChecker();
                                    }
                                }}
                                style={{
                                    opacity: animationState === 'expanding' ? 0 : 1,
                                    transition: 'opacity 0.4s ease-in-out'
                                }}
                            />
                            <div onClick={OTPChecker} className="cursor-pointer relative">
                                <Button showBorder={false}/>
                                {/* Progress Ring as button border */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <ProgressRing 
                                        value={otp} 
                                        maxLength={4} 
                                        size={64} 
                                        strokeWidth={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Hint section - separate standalone element */}
                {animationState === 'complete' && (
                    <div 
                        className="w-full flex justify-center -mt-2"
                        style={{
                            animation: 'slideInFromBottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            opacity: 0,
                            transform: 'translateY(20px)',
                            animationFillMode: 'forwards',
                            zIndex: 5
                        }}
                    >
                        <div className="flex items-center gap-2 bg-[#2A2A2A] border border-white/10 rounded-b-lg px-3 sm:px-4 py-2 sm:py-3 shadow-lg" style={{ width: 'calc(100% - 2rem)' }}>
                            <div className="text-cyan-400/80 flex-shrink-0">
                                <Feature />
                            </div>
                            <span className="text-white text-xs sm:text-sm leading-relaxed font-satoshi">
                                <b>Files and Code sharing</b>
                                <span className="hidden sm:inline"> with multi-language support</span> will soon be in <b className="text-cyan-400"> V2</b>
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Notification component */}
                <Notification
                    isVisible={notification.isVisible}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => {
                        // Clear the auto-dismiss timer if it exists
                        if (autoDismissTimerRef.current) {
                            clearTimeout(autoDismissTimerRef.current);
                            autoDismissTimerRef.current = null;
                        }
                        setNotification(prev => ({ ...prev, isVisible: false }));
                    }}
                />
                

                
                {/* Received content display - outside the capsule */}
                {receivedContent && (
                    <div 
                        className="w-full mt-4 sm:mt-6"
                        style={{
                            animation: 'slideInFromBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            opacity: 0,
                            transform: 'translateY(30px)',
                            animationFillMode: 'forwards'
                        }}
                    >
                        <div 
                            className="bg-[#1A1A1A] rounded-lg border border-white/10 p-4 sm:p-6 min-h-64 sm:min-h-96"
                            style={{
                                animation: 'fadeInScale 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s',
                                opacity: 0,
                                transform: 'scale(0.95)',
                                animationFillMode: 'forwards'
                            }}
                        >
                            <div 
                                className="flex items-center justify-between mb-3 sm:mb-4"
                                style={{
                                    animation: 'slideInFromLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s',
                                    opacity: 0,
                                    transform: 'translateX(-20px)',
                                    animationFillMode: 'forwards'
                                }}
                            >
                                <span className="text-gray-400 text-xs sm:text-sm font-medium">Data Delivered Securely:</span>
                                <motion.button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(receivedContent);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer p-1.5 sm:p-2 rounded-lg hover:bg-white/5"
                                    title="Copy to clipboard"
                                    style={{
                                        animation: 'slideInFromRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s',
                                        opacity: 0,
                                        transform: 'translateX(20px)',
                                        animationFillMode: 'forwards'
                                    }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.svg 
                                                key="check"
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" 
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
                                                className="w-4 h-4 sm:w-5 sm:h-5" 
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
                            </div>
                            <textarea
                                className="w-full p-3 sm:p-4 border border-gray-400/30 rounded bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none focus:border-neutral-600 transition-colors h-48 sm:h-80 text-sm sm:text-base [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cyan-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-cyan-300 [&::-webkit-scrollbar-thumb]:cursor-pointer [&::selection]:bg-cyan-400/30 [&::selection]:text-[#00d8ff] [&::-moz-selection]:bg-cyan-400/30 [&::-moz-selection]:text-[#00d8ff]"
                                value={receivedContent}
                                readOnly
                                placeholder="Content will appear here..."
                                spellCheck={false}
                                style={{
                                    animation: 'fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s',
                                    opacity: 0,
                                    transform: 'translateY(20px)',
                                    animationFillMode: 'forwards'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}