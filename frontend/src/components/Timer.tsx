interface TimerProps {
    isActive: boolean;
    timeLeft: number | null;
}

export function Timer({ isActive, timeLeft }: TimerProps) {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isActive || timeLeft === null || timeLeft === 0) {
        return null;
    }

    return (
        <div className="w-full mt-0 flex justify-end pr-2">
            <div className={`flex items-center gap-3 backdrop-blur-sm border-l border-r border-b rounded-b-3xl px-6 py-2 shadow-lg ${
                timeLeft <= 10 
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/30 animate-pulse' 
                    : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/30'
            }`}>
                <span className={`text-xs ${
                    timeLeft <= 10 ? 'text-red-400/70' : 'text-cyan-400/70'
                }`}>
                    session expires in
                </span>
                <span className={`text-sm font-mono font-bold ${
                    timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'
                }`}>
                    {formatTime(timeLeft)}
                </span>
            </div>
        </div>
    );
} 