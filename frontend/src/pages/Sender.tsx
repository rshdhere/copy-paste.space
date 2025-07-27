import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "../components/Button";
import { Feature } from "../assets/icons/Feature";
const backend_url = import.meta.env.VITE_BACKEND_URI;

export function Sender(){

    const [content, setContent] = useState("");
    const [code, setCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        console.log(content);
    }, [content])

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            
            // Check if content exceeds max height before setting fixed height
            const needsScrollbar = textarea.scrollHeight > 200;
            
            if (needsScrollbar) {
                // Set fixed height and enable scrollbar
                textarea.style.height = '200px';
                textarea.classList.add('overflow-y-auto');
                textarea.classList.remove('overflow-y-hidden');
            } else {
                // Let it expand naturally
                textarea.style.height = `${textarea.scrollHeight}px`;
                textarea.classList.add('overflow-y-hidden');
                textarea.classList.remove('overflow-y-auto');
            }
        }
    }, [content]);

    async function SaveContent() {
        if (textareaRef.current) {
            const value = textareaRef.current.value.trim();
            
            // Check if the content is empty or only whitespace
            if (!value) {
                setErrorMessage("Please enter some content before sending!");
                textareaRef.current.focus();
                return;
            }
            
            setErrorMessage(""); // Clear any previous error message
            setContent(value);
            try {
                const response = await axios.post(`${backend_url}/api/v1/user/send`, {
                    content: value
                });
                // textareaRef.current.value = "";
                // setContent(""); // Clear state as well
                setCode(response.data?.code || null); // Set the code from backend response
            } catch (error) {
                console.error("Failed to send content:", error);
            }
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#191A1A] px-4 sm:px-0">
            <div className="flex w-full max-w-[36rem] mt-4 relative z-10">
                {/* Textarea container */}
                <div className="flex flex-col w-full bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden relative border border-neutral-600">
                    {/* Hint section mounted on top */}
                    <div className="absolute -top-2 left-2 right-2 sm:left-4 sm:right-4 z-20">
                        <div className="flex items-center gap-2 bg-[#2A2A2A]/90 backdrop-blur-sm border border-white/10 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg">
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
                    
                    {/* Text input area */}
                    <div className="flex-4 p-3 sm:p-4 pt-6 sm:pt-8 pb-2">
                        <textarea
                            className={`w-full min-w-0 resize-none focus:outline-none border-none bg-transparent transition-all duration-200 min-h-12 overflow-y-hidden pt-2 pl-2 text-left placeholder:text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cyan-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-cyan-300 [&::-webkit-scrollbar-thumb]:cursor-pointer [&::selection]:bg-cyan-400/30 [&::selection]:text-[#00d8ff] [&::-moz-selection]:bg-cyan-400/30 [&::-moz-selection]:text-[#00d8ff] text-sm sm:text-base ${
                                errorMessage ? 'text-red-400 placeholder-red-400' : 'text-white placeholder-gray-400'
                            }`}
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
                                setContent(e.target.value);
                                if (errorMessage) setErrorMessage(""); // Clear error when user starts typing
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    SaveContent();
                                }
                            }}
                            rows={1}
                        ></textarea>
                    </div>
                    
                    {/* Bottom section with interactive icons */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-t border-white/10 bg-[#2A2A2A]">
                        {/* Left side - GitHub logo and OTP box */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* GitHub Logo */}
                            <a
                                href="https://github.com/rshdhere/online-clipboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-cyan-400/30 bg-cyan-400/10 cursor-pointer transition-colors hover:bg-[#09B1CB]/20"
                                title="give us a star"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                                </svg>
                            </a>
                            
                            {/* OTP Box */}
                            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-transparent rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 border border-gray-400/30 cursor-pointer hover:bg-white/5 transition-colors">
                                <span className="text-white text-xs sm:text-sm font-mono">{code || "OTP"}</span>
                                <button 
                                    onClick={() => {
                                        if (code) {
                                            navigator.clipboard.writeText(code);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }
                                    }}
                                    className={`transition-colors cursor-pointer p-0.5 sm:p-1 rounded-lg hover:bg-white/5 ${
                                        code ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500'
                                    }`}
                                    title={code ? "Copy to clipboard" : "no otp yet"}
                                    disabled={!code}
                                >
                                    {copied ? (
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Right side - additional tools */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Chip/Processor icon */}
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            {/* Globe icon */}
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {/* Paperclip icon */}
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {/* Microphone icon */}
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            {/* Send button */}
                            <div onClick={SaveContent} className="cursor-pointer">
                                <Button/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}