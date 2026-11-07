"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, ExternalLink, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeviceCapabilities } from "@/lib/device";
import { AuroraBackground } from "@/components/hero-aura";

export interface HeroImageItem {
  url: string;
  albumId?: string;
  sourceUrl?: string | null;
  title?: string;
}

export interface AnimatedMarqueeHeroProps {
  badgeText?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  images?: (string | HeroImageItem)[];
  singleRow?: boolean;
  className?: string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

/**
 * Individual Marquee Card with double-buffered image loading and smooth cross-fade
 */
interface MarqueeCardProps {
  item: HeroImageItem;
  singleRow?: boolean;
}

const MarqueeCard: React.FC<MarqueeCardProps> = ({ item, singleRow }) => {
  const { isLowPower } = useDeviceCapabilities();
  const [currentUrl, setCurrentUrl] = useState<string>(item.url);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // When item.url changes, preload and decode the new image in background
  useEffect(() => {
    if (item.url === currentUrl) return;

    let isCurrent = true;
    const preload = new Image();
    preload.src = item.url;

    const handleNewImageReady = async () => {
      try {
        if ("decode" in preload) await preload.decode();
      } catch {
        // decode fallback
      }
      if (!isCurrent) return;

      // Keep existing image visible underneath while new image fades in on top
      setPrevUrl(currentUrl);
      setCurrentUrl(item.url);
      setIsLoaded(false);

      requestAnimationFrame(() => {
        if (!isCurrent) return;
        setIsLoaded(true);
      });
    };

    if (preload.complete && preload.naturalWidth > 0) {
      handleNewImageReady();
    } else {
      preload.onload = handleNewImageReady;
      preload.onerror = () => {
        if (!isCurrent) return;
        setHasError(true);
      };
    }

    return () => {
      isCurrent = false;
    };
  }, [item.url, currentUrl]);

  // Clean up prevUrl after cross-fade completes
  useEffect(() => {
    if (!prevUrl) return;
    const timer = setTimeout(() => {
      setPrevUrl(null);
    }, 850);
    return () => clearTimeout(timer);
  }, [prevUrl]);

  // DOM image onload and initial cache-check with guaranteed hardware decode
  const handleImageReady = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    try {
      if ("decode" in target) {
        await target.decode();
      }
    } catch {
      // decode fallback
    }
    requestAnimationFrame(() => {
      setIsLoaded(true);
      setHasError(false);
    });
  };

  useEffect(() => {
    const domImg = imgRef.current;
    if (!domImg) return;
    if (domImg.complete && domImg.naturalWidth > 0) {
      if ("decode" in domImg) {
        domImg
          .decode()
          .then(() => {
            requestAnimationFrame(() => {
              setIsLoaded(true);
              setHasError(false);
            });
          })
          .catch(() => {
            setIsLoaded(true);
          });
      } else {
        requestAnimationFrame(() => {
          setIsLoaded(true);
        });
      }
    }
  }, [currentUrl]);

  const cardContent = (
    <div
      className={cn(
        "group/card relative shrink-0 overflow-hidden rounded-2xl border border-gray-200/90 bg-gray-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-brand-primary/40 transform-gpu",
        singleRow
          ? "h-56 w-80 sm:h-64 sm:w-96 md:h-72 md:w-[28rem]"
          : "h-44 w-64 sm:h-52 sm:w-76 md:h-56 md:w-84"
      )}
    >
      {/* 1. Skeleton Shimmer (visible only when no image has loaded yet) */}
      <AnimatePresence>
        {!isLoaded && !prevUrl && !hasError && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isLowPower ? 0.3 : 0.6, ease: "easeOut" }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-200/90 via-gray-100/70 to-gray-200/90 animate-pulse" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-hero-shimmer will-change-transform" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Previous Image Underlay (prevents popping when resource URL changes) */}
      {prevUrl && (
        <img
          src={prevUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-10 h-full w-full object-cover"
        />
      )}

      {/* 3. Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
          <ImageOff className="h-8 w-8 text-gray-400 mb-1" />
          <span className="text-xs font-medium text-gray-500">
            {item.title || "Photo unavailable"}
          </span>
        </div>
      ) : (
        /* 4. Active Image (Framer Motion managed opacity ensures smooth tween without CSS class conflict) */
        <motion.img
          ref={imgRef}
          key={currentUrl}
          src={currentUrl}
          alt={item.title || "Alumni moment"}
          loading="eager"
          decoding="async"
          onLoad={handleImageReady}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{
            duration: isLowPower ? 0.3 : 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-20 h-full w-full object-cover transform-gpu group-hover/card:scale-105 transition-transform duration-500 ease-out will-change-[opacity,transform]"
        />
      )}

      {/* Hover action overlay */}
      {item.sourceUrl ? (
        <div className="absolute inset-0 z-30 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm transition-colors hover:bg-white">
            <ExternalLink className="h-3 w-3 text-brand-primary" />
            <span>Original Album</span>
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
      )}
    </div>
  );

  if (item.sourceUrl) {
    return (
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-2xl block"
        title="Open source album in new tab"
      >
        {cardContent}
      </a>
    );
  }

  return <div className="rounded-2xl">{cardContent}</div>;
};

/**
 * Placeholder Skeleton Card matching live card dimensions
 */
const SkeletonCard: React.FC<{ singleRow?: boolean }> = ({ singleRow }) => (
  <div
    className={cn(
      "relative shrink-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-100 shadow-xs transform-gpu",
      singleRow
        ? "h-56 w-80 sm:h-64 sm:w-96 md:h-72 md:w-[28rem]"
        : "h-44 w-64 sm:h-52 sm:w-76 md:h-56 md:w-84"
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-gray-200/80 via-gray-100/60 to-gray-200/80 animate-pulse" />
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-hero-shimmer will-change-transform" />
    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 shadow-xs backdrop-blur-xs">
      <div className="h-3 w-3 rounded-full bg-gray-300/80 animate-pulse" />
      <div className="h-2.5 w-16 rounded-full bg-gray-300/80 animate-pulse" />
    </div>
  </div>
);

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  badgeText = "",
  title = "USJ-R SEA Alumni",
  description = "Build lasting relationships, advance your career, and give back to the community that shaped your future.",
  primaryCtaText = "Join the Community",
  primaryCtaLink = "/login",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "/about",
  images = [],
  singleRow,
  className,
  isLoading,
  emptyState,
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { isLowPower, isSmallScreen } = useDeviceCapabilities();
  const shouldSimplify = isLowPower || isSmallScreen;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Normalize items to HeroImageItem
  const normalizedImages: HeroImageItem[] = images.map((img) =>
    typeof img === "string" ? { url: img } : img
  );

  // Divide images across Row 1 and Row 2, or use single row
  const mid = Math.ceil(normalizedImages.length / 2);
  const row1 = singleRow ? normalizedImages : normalizedImages.slice(0, mid);
  const row2 = singleRow ? [] : normalizedImages.slice(mid);

  // Target a consistent number of visible items per marquee row:
  // Mobile screens (<768px): 4 items is plenty (4 * 272px = 1088px > 430px viewport).
  // Desktop screens (>=768px): need 6-8 items to ensure the track (>= 2880px) spans beyond 1920px/2560px displays without empty gaps.
  const targetItemsCount = isSmallScreen ? 4 : (singleRow ? 6 : 8);

  const ensureMinItems = (arr: HeroImageItem[], target = targetItemsCount): HeroImageItem[] => {
    if (arr.length === 0) return [];
    let res = [...arr];
    while (res.length < target) {
      res = [...res, ...arr];
    }
    // Cap track length to target to prevent ballooning DOM nodes and GPU memory
    if (res.length > target) {
      res = res.slice(0, target);
    }
    return res;
  };

  const row1Items = ensureMinItems(row1.length > 0 ? row1 : normalizedImages, targetItemsCount);
  const row2Items = !singleRow
    ? ensureMinItems(row2.length > 0 ? row2 : normalizedImages, targetItemsCount)
    : [];

  // Duplicate for seamless infinite CSS translation (-50% transform)
  const row1Loop = [...row1Items, ...row1Items];
  const row2Loop = [...row2Items, ...row2Items];

  // Dynamic animation duration based on card count so physical velocity (px/s) remains identical
  const row1DurationDesktop = Math.max(25, (row1Items.length || targetItemsCount) * 6.5);
  const row1DurationMobile = Math.max(30, (row1Items.length || targetItemsCount) * 8.5);

  const row2DurationDesktop = Math.max(28, (row2Items.length || targetItemsCount) * 7.0);
  const row2DurationMobile = Math.max(35, (row2Items.length || targetItemsCount) * 9.0);

  // Determine active visual state
  const isPlaceholder = isLoading !== undefined ? isLoading : !isMounted && normalizedImages.length === 0;
  const isEmpty = !isPlaceholder && normalizedImages.length === 0;

  const minHeightClass = singleRow
    ? "min-h-[224px] sm:min-h-[256px] md:min-h-[288px]"
    : "min-h-[368px] sm:min-h-[440px] md:min-h-[472px]";

  const renderSkeletonMarquee = () => {
    const skeletonCount = targetItemsCount;
    const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => i);
    const skeletonLoop = [...skeletonItems, ...skeletonItems];

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Row 1 Skeleton: Scrolling Left */}
        <div className="marquee-row overflow-hidden">
          <div className="flex w-max gap-4 sm:gap-6 animate-marquee-row1">
            {skeletonLoop.map((_, idx) => (
              <SkeletonCard key={`sk1-${idx}`} singleRow={singleRow} />
            ))}
          </div>
        </div>

        {/* Row 2 Skeleton: Scrolling Right */}
        {!singleRow && (
          <div className="marquee-row overflow-hidden">
            <div className="flex w-max gap-4 sm:gap-6 animate-marquee-row2">
              {skeletonLoop.map((_, idx) => (
                <SkeletonCard key={`sk2-${idx}`} singleRow={singleRow} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = () => {
    if (emptyState) return emptyState;

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-3xl border border-dashed border-brand-primary/25 bg-amber-50/40 p-8 text-center backdrop-blur-sm sm:p-12">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary shadow-xs ring-1 ring-brand-primary/20">
          <Sparkles className="h-7 w-7 text-brand-primary" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
          Campus Moments Coming Soon
        </h3>
        <p className="mt-2 max-w-md text-sm text-gray-600 sm:text-base">
          Our alumni community gallery is being updated with fresh photos and event highlights.
        </p>
      </div>
    );
  };

  const renderHydratedMarquee = () => {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Row 1: Scrolling Left */}
        <div className="marquee-row overflow-hidden">
          <div className="flex w-max gap-4 sm:gap-6 animate-marquee-row1">
            {row1Loop.map((item, idx) => (
              <MarqueeCard
                key={`r1-${idx}`}
                item={item}
                singleRow={singleRow}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right (rendered if not singleRow) */}
        {!singleRow && (
          <div className="marquee-row overflow-hidden">
            <div className="flex w-max gap-4 sm:gap-6 animate-marquee-row2">
              {row2Loop.map((item, idx) => (
                <MarqueeCard
                  key={`r2-${idx}`}
                  item={item}
                  singleRow={singleRow}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      className={cn(
        "relative w-full overflow-x-clip bg-gradient-to-b from-gray-50/70 via-white to-gray-50/40 py-16 md:py-24",
        className
      )}
    >
      <style>{`
        @keyframes marquee-scroll-left {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-scroll-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        @keyframes hero-shimmer {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(100%, 0, 0); }
        }
        .animate-hero-shimmer {
          animation: hero-shimmer 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform;
        }
        .animate-marquee-row1 {
          animation: marquee-scroll-left var(--duration-row1-mobile, 45s) linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        .animate-marquee-row2 {
          animation: marquee-scroll-right var(--duration-row2-mobile, 48s) linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        @media (min-width: 768px) {
          .animate-marquee-row1 {
            animation-duration: var(--duration-row1-desktop, 35s);
          }
          .animate-marquee-row2 {
            animation-duration: var(--duration-row2-desktop, 38s);
          }
        }
        @media (hover: hover) and (pointer: fine) {
          .marquee-row:hover .animate-marquee-row1,
          .marquee-row:hover .animate-marquee-row2 {
            animation-play-state: paused;
          }
        }
      `}</style>

      {/* Aurora Ambient Background Effect */}
      <AuroraBackground className="!overflow-x-clip" blobContainerClassName="!overflow-x-clip" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
        {/* University Badge */}
        {badgeText && (
          <motion.div
            initial={shouldSimplify ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldSimplify ? { duration: 0 } : { duration: 0.4 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-primary backdrop-blur-sm md:text-sm"
          >
            <span className="relative flex h-2 w-2">
              {!shouldSimplify && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
            </span>
            <span>{badgeText}</span>
          </motion.div>
        )}

        {/* Main Title */}
        <motion.h1
          initial={shouldSimplify ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldSimplify ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={shouldSimplify ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldSimplify ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
          className="mt-5 max-w-2xl text-base text-gray-600 sm:text-lg md:text-xl"
        >
          {description}
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={shouldSimplify ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldSimplify ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10"
        >
          <Link
            to={primaryCtaLink}
            className="group inline-flex items-center gap-2.5 rounded-full bg-brand-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all duration-200 hover:bg-brand-primary-hover hover:shadow-xl hover:shadow-brand-primary/35 active:scale-95"
          >
            <span>{primaryCtaText}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            to={secondaryCtaLink}
            className="group inline-flex items-center gap-2.5 rounded-full border-2 border-brand-secondary bg-white/90 px-8 py-3.5 text-base font-semibold text-brand-secondary shadow-sm transition-all duration-200 hover:bg-brand-secondary hover:text-white active:scale-95"
          >
            <span>{secondaryCtaText}</span>
            <Sparkles className="h-4 w-4 text-brand-accent transition-transform duration-200 group-hover:rotate-12" />
          </Link>
        </motion.div>
      </div>

      {/* Showcase area with smooth state transitions */}
      <div
        className={cn(
          "relative mt-12 w-full overflow-hidden md:mt-16",
          minHeightClass
        )}
        style={
          {
            "--duration-row1-desktop": `${row1DurationDesktop}s`,
            "--duration-row1-mobile": `${row1DurationMobile}s`,
            "--duration-row2-desktop": `${row2DurationDesktop}s`,
            "--duration-row2-mobile": `${row2DurationMobile}s`,
          } as React.CSSProperties
        }
      >
        {/* Universal edge gradient fades (zero compositor overhead, 100% reliable across all browsers & GPUs) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 sm:w-16 md:w-28 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 sm:w-16 md:w-28 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent" />
        <div className="grid grid-cols-1 grid-rows-1 [&>*]:col-start-1 [&>*]:row-start-1">
          <AnimatePresence>
            {isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={cn("flex w-full items-center justify-center py-4", minHeightClass)}
              >
                {renderEmptyState()}
              </motion.div>
            ) : isPlaceholder ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {renderSkeletonMarquee()}
              </motion.div>
            ) : (
              <motion.div
                key="hydrated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {renderHydratedMarquee()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AnimatedMarqueeHero;
