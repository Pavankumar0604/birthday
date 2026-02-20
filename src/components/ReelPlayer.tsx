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
                timeout = setTimeout(() => reveal(index + 1), 50);
            }
        };

        const startTimeout = setTimeout(() => reveal(0), delay);
        return () => {
            clearTimeout(startTimeout);
            clearTimeout(timeout);
        };
    }, [text, delay]);

    return (
        <p className="text-xl md:text-lg font-bold font-sans text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-snug">
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
        <div className="relative w-full min-h-[100dvh] bg-black text-white font-sans overflow-hidden">
            {/* 1. Atmospheric Vignette - Dynamic for depth */}
            <div className="fixed inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.8)_120%)] mix-blend-multiply" />

            {/* 2. Particle Heart-Tree System */}
            <div className="fixed inset-0 z-0">
                <ParticlesBg onGrowthComplete={() => setIsGrowthComplete(true)} />
            </div>

            {/* 3. Content Layer */}
            {/* 
                Mobile: Glassmorphic Card at the top-left/center, leaving space for the tree below.
                Desktop: Classic split layout.
            */}
            <div className="relative z-30 w-full min-h-[100dvh] flex flex-col md:flex-row pointer-events-none">

                {/* TEXT CONTAINER */}
                <div className="
                    w-full md:w-[45%] 
                    flex flex-col justify-start md:justify-center 
                    items-center md:items-start
                    px-4 md:px-0
                    pt-[10vh] md:pt-0 pb-4
                    md:pl-[8vw] 
                    pointer-events-auto
                ">
                    {/* Clean Text Container - No Glass Card */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.0 }}
                        className="
                            relative
                            w-full
                            max-w-lg mx-auto md:max-w-2xl md:mx-0
                            text-center md:text-left
                            z-10
                        "
                    >
                        <div className="flex flex-col gap-4 md:gap-6">
                            <AnimatePresence>
                                {isGrowthComplete && MESSAGES.map((line, i) => (
                                    i < visibleLines && (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="md:py-0.5"
                                        >
                                            <TypewriterLine text={line} delay={0} />
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT SIDE SPACER (Desktop only) */}
                <div className="hidden md:block w-[55%]" />
            </div>

            {/* Footer Interaction Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: visibleLines >= MESSAGES.length ? 0.8 : 0 }}
                transition={{ duration: 1 }}
                className="
                    fixed bottom-8 left-0 right-0 md:left-auto md:right-8 
                    z-40 text-center md:text-right 
                    pointer-events-none
                "
            >
                <p className="
                    text-[10px] md:text-xs 
                    text-white/70 
                    font-mono tracking-[0.3em] uppercase 
                    bg-black/40 md:bg-transparent
                    backdrop-blur-sm md:backdrop-blur-none
                    py-2 px-4 md:p-0
                    inline-block rounded-full md:rounded-none
                    border border-white/10 md:border-none
                    shadow-lg md:shadow-none
                ">
                    Tap the heart to scatter its love 💖
                </p>
            </motion.div>
        </div>
    );
};
