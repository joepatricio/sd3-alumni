"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useDeviceCapabilities } from "@/lib/device";

interface AuroraHeroProps {
    children?: React.ReactNode;
    className?: string;
    blobContainerClassName?: string;
}

/**
 * Aurora Background Blobs with hardware-accelerated animated keyframes.
 * On mobile devices, tablets, or hardware-constrained environments, automatically
 * simplifies blob layers from 6 to 2 and uses blur-2xl to prevent GPU fill-rate throttling.
 */
export const AuroraBackground = ({ className, blobContainerClassName }: { className?: string; blobContainerClassName?: string }) => {
    const { isLowPower, isSmallScreen } = useDeviceCapabilities();
    const shouldSimplify = isLowPower || isSmallScreen;

    return (
        <div className={cn("pointer-events-none absolute inset-0 overflow-visible", className)}>
            <style>{`
                @keyframes aurora-1 {
                    0%, 100% { transform: translate3d(0%, 0%, 0) scale(1); }
                    33% { transform: translate3d(6%, -6%, 0) scale(1.06); }
                    66% { transform: translate3d(-6%, 6%, 0) scale(0.95); }
                }
                @keyframes aurora-2 {
                    0%, 100% { transform: translate3d(0%, 0%, 0) scale(1); }
                    33% { transform: translate3d(-6%, 6%, 0) scale(1.05); }
                    66% { transform: translate3d(6%, -5%, 0) scale(0.95); }
                }
                @keyframes aurora-3 {
                    0%, 100% { transform: translate3d(0%, 0%, 0) scale(1); }
                    50% { transform: translate3d(5%, 6%, 0) scale(1.04); }
                }
                @keyframes aurora-4 {
                    0%, 100% { transform: translate3d(0%, 0%, 0) scale(1); }
                    50% { transform: translate3d(-5%, -5%, 0) scale(1.05); }
                }
                .aurora-blob {
                    transform: translate3d(0, 0, 0);
                    will-change: transform;
                    backface-visibility: hidden;
                }
                @media (prefers-reduced-motion: reduce) {
                    .aurora-blob {
                        animation: none !important;
                    }
                }
            `}</style>
            <div
                className={cn(
                    "absolute inset-0 z-0 overflow-visible pointer-events-none",
                    blobContainerClassName
                )}
            >
                {/* Top Left Blob 1 (Brand Primary / Amber Gold) */}
                <div
                    className={cn(
                        "aurora-blob absolute -top-1/4 left-1/4 rounded-full bg-brand-primary/45 opacity-40 filter dark:opacity-60",
                        shouldSimplify
                            ? "h-64 w-64 sm:h-80 sm:w-80 blur-2xl animate-[aurora-1_22s_ease-in-out_infinite]"
                            : "h-96 w-96 blur-3xl animate-[aurora-1_20s_ease-in-out_infinite]"
                    )}
                />

                {/* Bottom Right Blob 2 (Brand Secondary / Emerald Forest) */}
                <div
                    className={cn(
                        "aurora-blob absolute -bottom-1/4 right-1/4 rounded-full bg-brand-secondary/45 opacity-35 filter dark:opacity-50",
                        shouldSimplify
                            ? "h-72 w-72 sm:h-96 sm:w-96 blur-2xl animate-[aurora-2_24s_ease-in-out_infinite]"
                            : "h-[30rem] w-[30rem] blur-3xl animate-[aurora-2_22s_ease-in-out_infinite]"
                    )}
                />

                {/* Blobs 3-6: High-depth ambiance rendered only on capable non-mobile desktop devices */}
                {!shouldSimplify && (
                    <>
                        {/* Upper Right Blob 3 (Brand Accent / Warm Gold) */}
                        <div className="aurora-blob absolute top-1/6 right-1/12 h-80 w-80 animate-[aurora-3_26s_ease-in-out_infinite] rounded-full bg-brand-accent/40 opacity-40 blur-3xl filter dark:opacity-55" />

                        {/* Center Lower Blob 4 (Extended reaching search area - Brand Primary) */}
                        <div className="aurora-blob absolute top-2/3 left-1/3 h-[30rem] w-[30rem] -translate-x-1/2 animate-[aurora-4_20s_ease-in-out_infinite] rounded-full bg-brand-primary/40 opacity-40 blur-3xl filter" />

                        {/* Mid Left Blob 5 (Spanning lower left toward search - Brand Secondary) */}
                        <div className="aurora-blob absolute top-1/2 -left-12 h-96 w-96 animate-[aurora-1_26s_ease-in-out_infinite] rounded-full bg-brand-secondary/40 opacity-35 blur-3xl filter" />

                        {/* Lower Right Blob 6 (Spanning lower right toward search - Brand Accent) */}
                        <div className="aurora-blob absolute top-3/4 -right-12 h-96 w-96 animate-[aurora-3_22s_ease-in-out_infinite] rounded-full bg-brand-accent/35 opacity-35 blur-3xl filter" />
                    </>
                )}
            </div>
        </div>
    );
};

export const AuroraHero = ({ children, className, blobContainerClassName }: AuroraHeroProps) => {
    return (
        <div className="h-full w-full overflow-x-clip">
            <div
                className={cn(
                    "relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background antialiased",
                    className
                )}
            >
                <AuroraBackground blobContainerClassName={blobContainerClassName} />

                {/* Content */}
                <div className="relative z-10 w-full">{children}</div>
            </div>
        </div>
    );
};

/*
Implementation example
demo.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { AuroraHero } from "@/components/ui/hero-2"; // Adjust the import path as needed

export default function AuroraHeroDemo() {
    return (
        <AuroraHero>
            <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl"
            >
                Experience the Aurora
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.5,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="mx-auto mt-4 max-w-lg text-center text-base text-muted-foreground"
            >
                A stunning, animated background that brings your hero sections to
                life, adapting beautifully to both light and dark themes.
            </motion.p>
        </AuroraHero>
    );
}
*/