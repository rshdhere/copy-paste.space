interface ButtonProps {
    showBorder?: boolean;
    disabled?: boolean;
    rateLimitCooldown?: number;
}

export function Button({ showBorder = true, disabled = false, rateLimitCooldown = 0 }: ButtonProps){
    return <div>
        <button 
            className={`w-16 h-16 rounded-full overflow-hidden p-0 flex items-center justify-center transition-all duration-200 relative ${
                showBorder ? 'border-4 border-white/40' : ''
            } ${
                disabled 
                    ? 'cursor-not-allowed opacity-50 grayscale' 
                    : 'cursor-pointer hover:scale-105 active:scale-95'
            }`}
            disabled={disabled}
        >
            <video
                src="/boring.mp4"
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover rounded-full scale-[2.2] object-center ${
                    disabled ? 'grayscale' : ''
                }`}
            />
            {/* Rate limit timer overlay */}
            {rateLimitCooldown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <span className="text-white text-xs font-bold">
                        {rateLimitCooldown}s
                    </span>
                </div>
            )}
        </button>
    </div>
}