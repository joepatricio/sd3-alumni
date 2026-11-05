"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuroraHeroProps {
    children: React.ReactNode;
    className?: string;
    blobContainerClassName?: string;
}

/**
 * Injects the CSS keyframes for the aurora animation.
 */
const AuroraAnimation = () => (
    <style>
        {`
      @keyframes aurora-1 {
        0% { transform: translate(0%, 0%) scale(1); }
        25% { transform: translate(8%, -15%) scale(1.2); }
        50% { transform: translate(-8%, 15%) scale(0.8); }
        75% { transform: translate(5%, -8%) scale(1.1); }
        100% { transform: translate(0%, 0%) scale(1); }
      }
      @keyframes aurora-2 {
        0% { transform: translate(0%, 0%) scale(1); }
        25% { transform: translate(-8%, 15%) scale(1.00); }
        50% { transform: translate(8%, -15%) scale(0.90); }
        75% { transform: translate(-4%, 8%) scale(1.2); }
        100% { transform: translate(0%, 0%) scale(1); }
      }
      @keyframes aurora-3 {
        0% { transform: translate(0%, 0%) scale(1); }
        33% { transform: translate(-6%, -10%) scale(1.15); }
        66% { transform: translate(6%, 10%) scale(0.85); }
        100% { transform: translate(0%, 0%) scale(1); }
      }
      @keyframes aurora-4 {
        0% { transform: translate(0%, 0%) scale(1); }
        50% { transform: translate(6%, -15%) scale(1.25); }
        100% { transform: translate(0%, 0%) scale(1); }
      }
    `}
    </style>
);

export const AuroraHero = ({ children, className, blobContainerClassName }: AuroraHeroProps) => {
    return (
        <div className="h-full w-full overflow-x-clip">
            <AuroraAnimation />
            <div
                className={cn(
                    "relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background antialiased",
                    className
                )}
            >
                {/* The Aurora Background */}
                <div
                    className={cn(
                        "absolute inset-0 z-0 overflow-hidden pointer-events-none",
                        blobContainerClassName
                    )}
                >
                    {/* Top Left Blob 1 (Brand Primary / Amber Gold) */}
                    <div className="absolute -top-1/4 left-1/4 h-96 w-96 animate-[aurora-1_20s_ease-in-out_infinite] rounded-full bg-brand-primary/30 opacity-25 blur-3xl filter dark:opacity-50" />
                    {/* Bottom Right Blob 2 (Brand Secondary / Emerald Forest) */}
                    <div className="absolute -bottom-1/4 right-1/4 h-[30rem] w-[30rem] animate-[aurora-2_22s_ease-in-out_infinite] rounded-full bg-brand-secondary/30 opacity-20 blur-3xl filter dark:opacity-30" />
                    {/* Upper Right Blob 3 (Brand Accent / Warm Gold) */}
                    <div className="absolute top-1/6 right-1/12 h-80 w-80 animate-[aurora-3_25s_ease-in-out_infinite] rounded-full bg-brand-accent/25 opacity-25 blur-3xl filter dark:opacity-40" />
                    {/* Center Lower Blob 4 (Extended reaching search area - Brand Primary) */}
                    <div className="absolute top-2/3 left-1/3 h-[28rem] w-[28rem] -translate-x-1/2 animate-[aurora-4_18s_ease-in-out_infinite] rounded-full bg-brand-primary/25 opacity-25 blur-3xl filter" />
                    {/* Mid Left Blob 5 (Spanning lower left toward search - Brand Secondary) */}
                    <div className="absolute top-1/2 -left-12 h-96 w-96 animate-[aurora-1_24s_ease-in-out_infinite] rounded-full bg-brand-secondary/25 opacity-20 blur-3xl filter" />
                    {/* Lower Right Blob 6 (Spanning lower right toward search - Brand Accent) */}
                    <div className="absolute top-3/4 -right-12 h-96 w-96 animate-[aurora-3_20s_ease-in-out_infinite] rounded-full bg-brand-accent/20 opacity-20 blur-3xl filter" />
                </div>

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