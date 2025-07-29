import { motion, AnimatePresence } from "framer-motion";

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

    return (
        <AnimatePresence>
            {isActive && timeLeft !== null && timeLeft > 0 && (
                <motion.div 
                    className="w-full mt-0 flex justify-end pr-2"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25,
                        duration: 0.4
                    }}
                >
                    <motion.div 
                        className={`flex items-center gap-3 backdrop-blur-sm border-l border-r border-b rounded-b-3xl px-6 py-2 shadow-lg ${
                            timeLeft <= 10 
                                ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/30' 
                                : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={timeLeft <= 10 ? {
                            scale: [1, 1.05, 1],
                            transition: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        } : {}}
                    >
                        <motion.span 
                            className={`text-xs ${
                                timeLeft <= 10 ? 'text-red-400/70' : 'text-cyan-400/70'
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            session expires in
                        </motion.span>
                        <span 
                            className={`text-sm font-mono font-bold ${
                                timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'
                            }`}
                        >
                            {formatTime(timeLeft)}
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 