import type { Variants } from "framer-motion";

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.5,
        },
    },
    exit: { opacity: 0, transition: { duration: 0.5 } },
};

export const itemVariants: Variants = {
    hidden: {
        y: 50,
        opacity: 0,
        rotateX: -10,
    },
    visible: {
        y: 0,
        opacity: 1,
        rotateX: 0,
        transition: {
            type: "spring",
            damping: 12,
            stiffness: 100,
        }
    },
};

export const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 200 }
    },
};

export const scalePulseVariants: Variants = {
    initial: { scale: 1 },
    pulse: {
        scale: 1.05,
        boxShadow: "0 0 20px rgba(244, 208, 63, 0.5)",
        transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
        },
    },
};

export const glowVariants: Variants = {
    initial: { textShadow: "0px 0px 0px rgba(255,255,255,0)" },
    glow: {
        textShadow: "0px 0px 10px rgba(255,255,255,0.8), 0px 0px 20px rgba(244, 208, 63, 0.5)",
        transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
    }
};
