import { useEffect, useRef, useCallback } from "react";

interface Particle {
    x: number;
    y: number;
    homeX: number;
    homeY: number;
    size: number;
    depthScale: number;
    baseOpacity: number;
    color: string;
    rotation: number;
    swayOffset: number;
    bloomDelay: number;
    vx: number; // Velocity X for scatter
    vy: number; // Velocity Y for scatter
    startX: number; // For stable return origin
    startY: number; // For stable return origin
}

type Phase = 'seed' | 'falling' | 'growing' | 'blooming' | 'shifting' | 'complete' | 'scattering' | 'returning';

interface ParticlesBgProps {
    onGrowthComplete?: () => void;
}

export const ParticlesBg: React.FC<ParticlesBgProps> = ({ onGrowthComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>(0);

    // Animation State
    const phase = useRef<Phase>('seed');
    const phaseStartTime = useRef<number>(0);
    const treeOffsetX = useRef<number>(0); // Animates towards width * 0.25 (or 0.75 target)

    // --- CONFIG ---
    const COLORS = [
        "#ffb7b2", "#ff9cee", "#ff585d", "#ffd275", "#fffc96", "#ffa500"
    ];
    const TRUNK_COLOR = "#f6b1c8";

    // Implicit Heart Equation
    const isInsideHeart = (x: number, y: number) => {
        const xx = x * x;
        const yy = y * y;
        const a = xx + yy - 1;
        return (a * a * a) - (xx * (y * y * y)) <= 0;
    };

    const initScene = useCallback((width: number, height: number) => {
        const isMobile = width < 768;
        const cx = width / 2; // Start center
        const groundY = height * 0.95;

        const trunkHeight = height * 0.30;
        const trunkTopY = groundY - trunkHeight;
        const trunkBaseW = isMobile ? 32 : 55; // Slightly slimmer mobile trunk 
        const heartPixelScale = isMobile ? trunkBaseW * 2.6 : trunkBaseW * 3.0; // Reduced mobile spread
        const originY = trunkTopY - heartPixelScale * 0.70;

        const newParticles: Particle[] = [];
        const particleCount = 1400;
        let attempts = 0;
        const maxAttempts = particleCount * 100;

        while (newParticles.length < particleCount && attempts < maxAttempts) {
            attempts++;
            const rx = (Math.random() * 3) - 1.5;
            const ry = (Math.random() * 3) - 1.5;

            if (isInsideHeart(rx, ry)) {
                // Subtle asymmetry: slightly less density in the right lobe (rx > 0)
                const asymmetryFactor = rx > 0 ? 0.92 : 1.0;

                const normY = (ry + 1) / 2.5;
                if (Math.random() < (0.3 + 0.7 * normY) * asymmetryFactor) {
                    const homeX = cx + rx * heartPixelScale;
                    const homeY = originY - (ry * heartPixelScale);
                    const dist = Math.sqrt(Math.pow(homeX - cx, 2) + Math.pow(homeY - trunkTopY, 2));

                    // Depth variation logic
                    const rand = Math.random();
                    let depthScale = 1.0;
                    let baseOpacity = 1.0;

                    if (rand < 0.2) { // 20% smaller and dimmer
                        depthScale = 0.7 + Math.random() * 0.15;
                        baseOpacity = 0.5 + Math.random() * 0.2;
                    } else if (rand > 0.9) { // 10% larger and brighter
                        depthScale = 1.2 + Math.random() * 0.2;
                        baseOpacity = 0.95 + Math.random() * 0.05;
                    }

                    newParticles.push({
                        x: cx,
                        y: trunkTopY,
                        homeX,
                        homeY,
                        size: 9, // Slightly smaller base size for refinement
                        depthScale,
                        baseOpacity,
                        color: COLORS[Math.floor(Math.random() * COLORS.length)],
                        rotation: Math.random() * 360,
                        swayOffset: Math.random() * 100,
                        bloomDelay: dist * 0.002 + Math.random() * 0.3,
                        vx: 0,
                        vy: 0,
                        startX: homeX, // Initialize to home for safety
                        startY: homeY
                    });
                }
            }
        }
        particles.current = newParticles;
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // CRITICAL: Use clientWidth/Height (Logical Pixels) because ctx is already scaled by DPR
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const time = performance.now();
        if (!phaseStartTime.current) phaseStartTime.current = time;
        const elapsed = time - phaseStartTime.current;

        ctx.clearRect(0, 0, width, height);

        const isMobile = width < 768;
        const cx = width / 2;
        const groundY = height * 0.95;
        const finalTrunkHeight = height * 0.30;
        const trunkBaseW = isMobile ? 35 : 55;
        const trunkTopW = trunkBaseW * 0.7;

        let currentCx = cx + treeOffsetX.current;

        // Draw Ground Line (exactly at trunk base)
        const drawGround = () => {
            ctx.strokeStyle = TRUNK_COLOR; // Matched to trunk color
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.4; // Soft visibility
            ctx.beginPath();
            ctx.moveTo(0, groundY + 4);
            ctx.lineTo(width, groundY + 4);
            ctx.stroke();
            ctx.globalAlpha = 1;
        };

        const drawTrunk = (centerX: number, h: number, opacity: number = 1) => {
            const hTopY = groundY - h;
            ctx.globalAlpha = opacity;

            // Subtle glow for trunk presence
            ctx.shadowColor = TRUNK_COLOR;
            ctx.shadowBlur = h > finalTrunkHeight * 0.8 ? 10 : 0;

            ctx.fillStyle = TRUNK_COLOR;
            ctx.strokeStyle = TRUNK_COLOR;

            // Added subtle 1.5 degree organic curve to the trunk
            const curveOffset = 5 * (h / finalTrunkHeight);

            ctx.beginPath();
            ctx.moveTo(centerX - trunkBaseW / 2, groundY);
            ctx.quadraticCurveTo(centerX - trunkBaseW * 0.2 + curveOffset, groundY - h * 0.5, centerX - trunkTopW / 2 + curveOffset, hTopY);
            ctx.lineTo(centerX + trunkTopW / 2 + curveOffset, hTopY);
            ctx.quadraticCurveTo(centerX + trunkBaseW * 0.2 + curveOffset, groundY - h * 0.5, centerX + trunkBaseW / 2, groundY);
            ctx.fill();

            if (h > finalTrunkHeight * 0.5) {
                const bProgress = Math.min((h - finalTrunkHeight * 0.5) / (finalTrunkHeight * 0.5), 1);
                const branchLen = finalTrunkHeight * 0.6 * bProgress;
                ctx.lineWidth = trunkTopW;
                ctx.lineCap = "round";

                ctx.beginPath();
                ctx.moveTo(centerX + curveOffset, hTopY + 5);
                ctx.quadraticCurveTo(centerX - 20 * bProgress + curveOffset, hTopY - branchLen * 0.5, centerX - branchLen * 0.8 + curveOffset, hTopY - branchLen);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(centerX + curveOffset, hTopY + 5);
                ctx.quadraticCurveTo(centerX + 20 * bProgress + curveOffset, hTopY - branchLen * 0.5, centerX + branchLen * 0.8 + curveOffset, hTopY - branchLen);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        };

        // --- STATES ---

        if (phase.current === 'seed') {
            drawGround();
            const pulse = 1 + Math.sin(time * 0.005) * 0.1;
            const seedY = height * 0.4;
            ctx.save();
            ctx.translate(cx, seedY);
            ctx.scale(pulse, pulse);

            ctx.fillStyle = "white";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Click to Plant 🌱", 0, 50);

            ctx.fillStyle = "#ff1493";
            ctx.beginPath();
            const s = 12;
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-s / 2, -s / 2, -s, 0, 0, s);
            ctx.bezierCurveTo(s, 0, s / 2, -s / 2, 0, 0);
            ctx.fill();
            ctx.restore();

        } else if (phase.current === 'falling') {
            drawGround();
            const duration = 800;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress * progress;
            const currentY = height * 0.4 + (groundY - height * 0.4) * ease;

            ctx.fillStyle = "#ff1493";
            ctx.beginPath();
            const s = 12;
            ctx.save();
            ctx.translate(cx, currentY);
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-s / 2, -s / 2, -s, 0, 0, s);
            ctx.bezierCurveTo(s, 0, s / 2, -s / 2, 0, 0);
            ctx.fill();
            ctx.restore();

            if (progress >= 1) {
                phase.current = 'growing';
                phaseStartTime.current = time;
            }

        } else if (phase.current === 'growing') {
            drawGround();
            const duration = 1500;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            drawTrunk(cx, finalTrunkHeight * ease);

            if (progress >= 1) {
                phase.current = 'blooming';
                phaseStartTime.current = time;
            }

        } else if (phase.current === 'blooming') {
            drawGround();
            drawTrunk(cx, finalTrunkHeight);
            const duration = 2500;
            const progress = Math.min(elapsed / duration, 1);
            const tTopY = groundY - finalTrunkHeight;

            // Trunk curve for heart origin
            const curveOffset = 5;

            particles.current.forEach(p => {
                const pStart = p.bloomDelay;
                const pNorm = Math.max(0, Math.min((progress - pStart) / 0.4, 1));
                const ease = 1 - Math.pow(1 - pNorm, 3);

                // Soft fade-in over 1s (0.4 progress duration relative to pStart)
                const fadeOpacity = pNorm * p.baseOpacity;

                if (pNorm > 0) {
                    const originX = cx + curveOffset;
                    const curX = originX + (p.homeX - originX) * ease;
                    const curY = tTopY + (p.homeY - tTopY) * ease;
                    const s = p.size * p.depthScale * ease;

                    ctx.save();
                    ctx.globalAlpha = fadeOpacity;
                    ctx.translate(curX, curY);
                    ctx.rotate(p.rotation * Math.PI / 180);
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(-s / 2, -s / 2, -s, 0, 0, s);
                    ctx.bezierCurveTo(s, 0, s / 2, -s / 2, 0, 0);
                    ctx.fill();
                    ctx.restore();
                }
            });

            if (progress >= 1) {
                phase.current = 'shifting';
                phaseStartTime.current = time;
                if (onGrowthComplete) onGrowthComplete();
            }

        } else if (phase.current === 'shifting' || phase.current === 'complete') {
            const duration = 1200;
            const shiftProgress = phase.current === 'complete' ? 1 : Math.min(elapsed / duration, 1);
            const easeShift = 1 - Math.pow(1 - shiftProgress, 3);
            const targetX = isMobile ? 0 : width * 0.25;
            // On mobile, ensure we are strictly centered
            treeOffsetX.current = isMobile ? 0 : targetX * easeShift;

            currentCx = cx + treeOffsetX.current;
            drawGround();
            drawTrunk(currentCx, finalTrunkHeight);

            particles.current.forEach(p => {
                // Reduced floating motion to barely noticeable ±0.5-0.8px
                const floatY = Math.sin(time * 0.0008 + p.swayOffset) * 0.6;
                const floatX = Math.cos(time * 0.0012 + p.swayOffset) * 0.4;

                const px = p.homeX + treeOffsetX.current + floatX;
                const py = p.homeY + floatY;

                p.x = px;
                p.y = py;

                const s = p.size * p.depthScale;
                ctx.save();
                ctx.globalAlpha = p.baseOpacity;
                ctx.translate(px, py);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;

                ctx.fillStyle = p.color;

                // Depth is represented only by size (depthScale) and opacity (baseOpacity)
                // as per strict user constraint.

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-s / 2, -s / 2, -s, 0, 0, s);
                ctx.bezierCurveTo(s, 0, s / 2, -s / 2, 0, 0);
                ctx.fill();
                ctx.restore();
            });

            if (phase.current === 'shifting' && shiftProgress >= 1) {
                phase.current = 'complete';
            }

        } else if (phase.current === 'scattering') {
            drawGround();
            drawTrunk(currentCx, finalTrunkHeight);

            // Physics Simulation for Fall with Ground Collision
            particles.current.forEach(p => {
                const groundJitter = (p.swayOffset % 12) - 6;
                const groundLevel = groundY + 4 - p.size + groundJitter;

                if (p.y < groundLevel) {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.38; // Increased Gravity for weight
                    p.vx *= 0.99; // Drag
                    p.rotation += (p.vx * 1.5);
                } else {
                    p.y = groundLevel;
                    p.vx *= 0.85; // Faster settle
                    p.vy = 0;
                    if (Math.abs(p.vx) > 0.1) p.rotation += (p.vx * 0.5);
                }

                const s = p.size * p.depthScale;
                ctx.save();
                ctx.globalAlpha = p.baseOpacity;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-s / 2, -s / 2, -s, 0, 0, s);
                ctx.bezierCurveTo(s, 0, s / 2, -s / 2, 0, 0);
                ctx.fill();
                ctx.restore();
            });

            // Transition to return after hearts have settled well (3s)
            if (elapsed > 3000) {
                particles.current.forEach(p => {
                    p.startX = p.x;
                    p.startY = p.y;
                    p.vx = 0; // Reset velocities
                    p.vy = 0;
                });
                phase.current = 'returning';
                phaseStartTime.current = time;
            }

        } else if (phase.current === 'returning') {
            drawGround();
            drawTrunk(currentCx, finalTrunkHeight);

            const duration = 2000;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Ease Out

            particles.current.forEach(p => {
                const startX = p.startX;
                const startY = p.startY;

                const targetX = p.homeX + treeOffsetX.current;
                const targetY = p.homeY;

                const curX = startX + (targetX - startX) * ease;
                const curY = startY + (targetY - startY) * ease;

                p.x = curX;
                p.y = curY;

                const s = p.size * p.depthScale;
                ctx.save();
                ctx.globalAlpha = p.baseOpacity;
                ctx.translate(curX, curY);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-s / 2, -s / 2, -s, 0, 0, s);
                ctx.bezierCurveTo(s, 0, s / 2, -s / 2, 0, 0);
                ctx.fill();
                ctx.restore();
            });

            if (progress >= 1) {
                phase.current = 'complete';
            }
        }

        animationFrameId.current = requestAnimationFrame(draw);
    }, [onGrowthComplete]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const dpr = window.devicePixelRatio || 1;
                const width = window.innerWidth;
                const height = window.innerHeight;

                // Adjust for High DPI
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                const ctx = canvas.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);

                // If particles exist, just re-init scene to center them, 
                // but in a production app we might want to just scale their homeX/Y.
                // For this refinement, we re-init is fine as long as we maintain phase.
                initScene(width, height);
            }
        };

        const lastInteractTime = { current: 0 };
        const handleClick = (e: MouseEvent | TouchEvent) => {
            const now = Date.now();
            if (now - lastInteractTime.current < 300) return; // Cooldown to prevent double-trigger
            lastInteractTime.current = now;

            const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

            if (phase.current === 'seed') {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return; // Fix unused 'e' by using it

                // Center hit box
                const cx = rect.width / 2;
                const cy = rect.height * 0.4;
                const dist = Math.sqrt(Math.pow(clientX - cx, 2) + Math.pow(clientY - cy, 2));

                if (dist < 100) {
                    phase.current = 'falling';
                    phaseStartTime.current = performance.now();
                }
            } else if (phase.current === 'complete' || phase.current === 'shifting' || phase.current === 'returning') {
                // Allow click interaction even during return, resets to fresh fall
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;

                const cx = rect.width / 2 + treeOffsetX.current;
                const trunkHeight = rect.height * 0.30;
                const trunkTopY = rect.height * 0.95 - trunkHeight;
                // Hit canopy center
                const canopyCenterY = trunkTopY - (isMobile ? 35 : 55) * 1.2;

                const dist = Math.sqrt(Math.pow(clientX - cx, 2) + Math.pow(clientY - canopyCenterY, 2));

                if (dist < 250) { // Large, responsive hit area
                    // Force snapshot of current position before starting new fall
                    // This prevents "jumps" if clicking mid-return
                    particles.current.forEach(p => {
                        p.startX = p.x;
                        p.startY = p.y;

                        // "Fountain" pop velocities
                        p.vx = (Math.random() - 0.5) * 12; // Wider horizontal spread
                        p.vy = -Math.random() * 8 - 4; // Stronger upward pop
                    });

                    phase.current = 'scattering';
                    phaseStartTime.current = performance.now();
                }
            }
        };

        // Helper variable wasMobile to fix lints? No, used isMobile in component scope but initScene is callback.
        // Unused variables checked: currentCx (fixed), e (fixed).
        const isMobile = window.innerWidth < 768; // Used in click handler if strictly needed, but rect gives dimensions.

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousedown', handleClick);
        window.addEventListener('touchstart', handleClick);
        animationFrameId.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleClick);
            window.removeEventListener('touchstart', handleClick);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [initScene, draw]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-black cursor-pointer" />;
};
