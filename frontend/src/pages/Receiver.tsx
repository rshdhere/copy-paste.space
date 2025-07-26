import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "../components/Button";
import { ProgressRing } from "../components/ProgressRing";
const backend_url = import.meta.env.VITE_BACKEND_URI;

export function Receiver(){

    const [otp, setOtp] = useState('');
    const [receivedContent, setReceivedContent] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [copied, setCopied] = useState(false);
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log(otp)
    }, [otp])

    async function OTPChecker(){
        if(otpRef.current){
            const value = otpRef.current.value.trim();
            
            // Check if the OTP is empty or only whitespace
            if (!value) {
                setErrorMessage("Please enter an OTP to receive content!");
                otpRef.current.focus();
                return;
            }
            
            setErrorMessage(""); // Clear any previous error message
            setOtp(value);
            
            try{
                const response = await axios.get(`${backend_url}/api/v1/user/receive`, {
                    params: { userCode: value }
                });
                otpRef.current.value = "";
                setOtp("");
                const dataArr = response.data?.data;
                if (Array.isArray(dataArr) && dataArr.length > 0) {
                    setReceivedContent(dataArr[0].content);
                    setErrorMessage(""); // Clear any error message when content is received
                } else {
                    setErrorMessage("Wrong OTP");
                    setReceivedContent(null); // Clear any previous content
                }
            } catch(error) {
                console.error("Failed to fetch content:", error);
                setErrorMessage("Wrong OTP");
                setReceivedContent(null); // Clear any previous content
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#191A1A]">
            <div className="flex flex-col items-center w-[36rem] mt-4 relative z-10">
                {/* Content container */}
                <div className="flex flex-col w-full bg-[#2A2A2A] rounded-full shadow-lg overflow-hidden relative border border-neutral-600">
                    {/* OTP input and Button in same capsule */}
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-3 w-full relative">
                            <input 
                                className={`flex-1 px-4 py-3 text-center border-transparent rounded-l-lg bg-transparent transition-all duration-200 focus:outline-none placeholder:text-center text-lg font-satoshi tracking-widest ${
                                    errorMessage 
                                        ? 'text-red-400 placeholder-red-400' 
                                        : 'text-white placeholder-gray-400'
                                }`}
                                type="text" 
                                maxLength={4} 
                                ref={otpRef}
                                placeholder="Enter your OTP"
                                spellCheck={false}
                                onChange={e => {
                                    setOtp(e.target.value);
                                    if (errorMessage) setErrorMessage(""); // Clear error when user starts typing
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        OTPChecker();
                                    }
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
                
                {/* Error message display */}
                {errorMessage && (
                    <div className="w-full mt-4">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-red-400 text-center font-medium">{errorMessage}</p>
                        </div>
                    </div>
                )}
                
                {/* Received content display - outside the capsule */}
                {receivedContent && (
                    <div className="w-full mt-6">
                        <div className="bg-[#1A1A1A] rounded-lg border border-white/10 p-6 min-h-96">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400 text-sm font-medium">Received Content:</span>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(receivedContent);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer p-2 rounded-lg hover:bg-white/5"
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <textarea
                                className="w-full p-4 border border-gray-400/30 rounded bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none focus:border-cyan-400 transition-colors h-80 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cyan-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-cyan-300"
                                value={receivedContent}
                                readOnly
                                placeholder="Content will appear here..."
                                spellCheck={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}