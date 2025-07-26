interface ButtonProps {
    showBorder?: boolean;
}

export function Button({ showBorder = true }: ButtonProps){
    return <div>
        <button className={`w-16 h-16 rounded-full overflow-hidden p-0 cursor-pointer flex items-center justify-center ${
            showBorder ? 'border-4 border-white/40' : ''
        }`}>
            <video
                src="/perplexity.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-full scale-[2.2] object-center"
            />
        </button>
    </div>
}