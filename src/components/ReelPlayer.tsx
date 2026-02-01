import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticlesBg } from './ParticlesBg';

const MESSAGES = [
    "Hey you 💕",
    "Happy Birthday Mahathi Sree 🎉",
    "May God bless you 🌸",
    "And give u many happiness 💖",
    "Just saying… you’re pretty awesome ✨",
    "Sending good vibes and maybe a wink 😉",
    "Hope u have a great day today 💗"
];

const TypewriterLine = ({ text, delay }: { text: string; delay: number }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let timeout: any;
        const reveal = (index: number) => {
            if (index <= text.length) {
                setDisplayedText(text.slice(0, index));
                timeout = setTimeout(() => reveal(index + 1), 60);
            }
        };

        const startTimeout = setTimeout(() => reveal(0), delay);
        return () => {
            clearTimeout(startTimeout);
            clearTimeout(timeout);
        };
    }, [text, delay]);

    return (
        <p className="text-[clamp(0.85rem,2.2vw,1.25rem)] font-mono text-white tracking-wider drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            {displayedText}
        </p>
    );
};

export const ReelPlayer = () => {
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [isGrowthComplete, setIsGrowthComplete] = useState(false);

    useEffect(() => {
        if (!isGrowthComplete) return;

        const timers: any[] = [];
        MESSAGES.forEach((_, i) => {
            const delay = i === 0 ? 500 : 500 + i * 2200;
            timers.push(setTimeout(() => {
                setVisibleLines(i + 1);
            }, delay));
        });

        return () => timers.forEach(clearTimeout);
    }, [isGrowthComplete]);

    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
            {/* 1. Atmospheric Vignette (Masterpiece depth) */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />

            {/* 2. Particle Heart-Tree System */}
            <ParticlesBg onGrowthComplete={() => setIsGrowthComplete(true)} />

            {/* 3. Content Layer: Intimate Balance */}
            <div className="absolute inset-0 z-30 flex flex-col md:flex-row pointer-events-none">
                {/* Text Container: Staged for Vibrant Masterpiece 4.0 */}
                <div className="w-full md:w-[45%] h-full flex flex-col justify-center px-[8vw] md:pl-[8vw] md:pr-0 pt-[10vh] md:pt-0 opacity-[0.95]">
                    <div className="flex flex-col gap-4 md:gap-7 max-w-2xl text-left">
                        <AnimatePresence>
                            {isGrowthComplete && MESSAGES.map((line, i) => (
                                i < visibleLines && (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <TypewriterLine text={line} delay={0} />
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT SIDE (only takes space on MD+) */}
                <div className="hidden md:block w-1/2 h-full" />
            </div>

            {/* Footer Interaction Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: visibleLines >= MESSAGES.length ? 0.3 : 0 }}
                transition={{ duration: 1 }}
                className="absolute bottom-6 right-6 text-[10px] md:text-xs text-white/40 font-mono tracking-[0.4em] uppercase pointer-events-none text-right"
            >
                Tap the heart to scatter its love 💖
            </motion.div>
        </div>
    );
};
