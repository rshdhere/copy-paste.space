import axios from "axios";
import { useEffect, useRef, useState } from "react";
const backend_url = import.meta.env.VITE_BACKEND_URI;


export function Receiver(){

    const [otp, setOtp] = useState('');
    const [receivedContent, setReceivedContent] = useState<string | null>(null);
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log(otp)
    }, [otp])

    async function OTPChecker(){
        if(otpRef.current){
            const value = otpRef.current.value;
            setOtp(value)
            try{
                const response = await axios.get(`${backend_url}/api/v1/user/receive`, {
                    params: { userCode: value }
                });
                otpRef.current.value = "";
                setOtp("");
                const dataArr = response.data?.data;
                if (Array.isArray(dataArr) && dataArr.length > 0) {
                    setReceivedContent(dataArr[0].content);
                } else {
                    setReceivedContent("Invalid OTP or Session Expired");
                }
            } catch(error) {
                console.error("Failed to send content:", error);
                setReceivedContent("Failed to fetch content.");
            }
        }
    }

    return <div>
        <div className="flex justify-center min-h-screen">
            <div className="flex flex-col justify-center items-center">
                <div className="flex">
                    <input 
                        className="w-32 px-3 py-2 text-center border border-gray-300 rounded" 
                        type="text" 
                        maxLength={4} 
                        ref={otpRef}
                        placeholder="otp here" />
                    <button className="px-4 py-2 bg-amber-100 cursor-pointer" onClick={OTPChecker}>confirm</button>
                </div>
                {receivedContent && (
                    <div className="mt-6 p-4 border rounded bg-gray-50 w-full text-center">
                        <strong>Received Content:</strong>
                        <textarea
                            className="w-full mt-2 p-2 border rounded bg-white text-black"
                            value={receivedContent}
                            readOnly
                            rows={4}
                        />
                    </div>
                )}
            </div>
        </div>
       
    </div>
}