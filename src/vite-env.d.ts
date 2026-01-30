/// <reference types="vite/client" />

declare module 'react-confetti' {
    import React from 'react';

    export interface ConfettiProps {
        width?: number;
        height?: number;
        numberOfPieces?: number;
        friction?: number;
        wind?: number;
        gravity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        colors?: string[];
        opacity?: number;
        recycle?: boolean;
        run?: boolean;
        onConfettiComplete?: (confetti: unknown) => void;
        drawShape?: (ctx: CanvasRenderingContext2D) => void;
    }

    const Confetti: React.FC<ConfettiProps>;
    export default Confetti;
}

declare module 'vanilla-tilt' {
    export default class VanillaTilt {
        static init(element: HTMLElement, options?: any): void;
    }
}
