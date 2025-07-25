import { useEffect, useRef, useState } from "react";
import axios from "axios";
const backend_url = import.meta.env.VITE_BACKEND_URI;

export function Sender(){

    const [content, setContent] = useState("");
    const [code, setCode] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        console.log(content);
    }, [content])

    async function SaveContent() {
        if (textareaRef.current) {
            const value = textareaRef.current.value;
            setContent(value);
            try {
                const response = await axios.post(`${backend_url}/api/v1/user/send`, {
                    content: value
                });
                textareaRef.current.value = "";
                setContent(""); // Clear state as well
                setCode(response.data?.code || null); // Set the code from backend response
            } catch (error) {
                console.error("Failed to send content:", error);
            }
        }
    }
    return (
        <div>
            <div>
                <div className="flex flex-col items-center pt-40">
                    <textarea className="border h-140 w-200" ref={textareaRef} name="" id=""></textarea>
                    <div className="mt-4 flex items-center gap-4">
                        <button className="py-2 px-4 bg-blue-300 cursor-pointer" onClick={SaveContent} >send</button>
                        {code && (
                            <span className="ml-2 px-3 py-1 border rounded bg-gray-100 text-sm font-mono">{code}</span>
                        )}
                    </div>
                </div>
            </div>

            
        </div>
    );
}