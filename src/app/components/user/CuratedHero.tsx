import React, { useEffect, useState } from "react";
import { api } from "@/app/views/api";
import { AnimatedMarqueeHero, type HeroImageItem, type AnimatedMarqueeHeroProps } from "@/components/hero-3";

const FALLBACK_HERO_IMAGES: HeroImageItem[] = [
  { url: "/images/albums/default/otog.jpg", title: "One Team One Goal!" },
  { url: "/images/albums/default/enrollment.jpg", title: "SEA Enrollment" },
  { url: "/images/albums/default/masters.jpg", title: "SEA Graduate School" },
  { url: "/images/albums/default/specialcourse.jpg", title: "SEA Diploma Program" },
  { url: "/images/albums/default/research.jpg", title: "Featured Research" },
  { url: "/images/albums/default/research2.jpg", title: "Featured Research" },
  { url: "/images/albums/default/deans.jpg", title: "SEA Deans" },
  { url: "/images/albums/default/civil.jpg", title: "Civil Engineering" },
  { url: "/images/albums/default/ece.jpg", title: "Electronics Engineering" },
  { url: "/images/albums/default/electrical.jpg", title: "Electrical Engineering" },
  { url: "/images/albums/default/mayor.jpg", title: "icRS 2026" },
  { url: "/images/albums/default/homecoming.jpg", title: "SEA Alumni Homecoming" },
];

// const FALLBACK_HERO_IMAGES: HeroImageItem[] = [
//   { url: "/images/main.jpg", title: "USJ-R Campus" },
//   { url: "/images/donate-hero.avif", title: "Giving Back" },
//   { url: "/images/events-reunion.jpg", title: "Grand Alumni Reunion" },
//   { url: "/images/events-networking.jpg", title: "Professional Networking" },
//   { url: "/images/events-conference.jpeg", title: "Engineering Conference" },
//   { url: "/images/events-sports.jpg", title: "Sports Festival" },
//   { url: "/images/events-workshop.jpg", title: "Technical Workshop" },
//   { url: "/images/events-virtual.jpg", title: "Global Virtual Meetup" },
//   { url: "/images/bulletin-success.jpg", title: "Alumni Milestone" },
//   { url: "/images/bulletin-careers.jpg", title: "Industry Opportunities" },
//   { url: "/images/bulletin-donations.jpg", title: "Scholarship Support" },
//   { url: "/images/bulletin-image.jpg", title: "Community Showcase" },
// ];

export type CuratedHeroProps = Partial<AnimatedMarqueeHeroProps>;

export const CuratedHero: React.FC<CuratedHeroProps> = ({
  className,
  badgeText,
  title,
  description,
  primaryCtaText,
  primaryCtaLink,
  secondaryCtaText,
  secondaryCtaLink,
  images: customImages,
  singleRow = false,
  isLoading: propIsLoading,
  ...restProps
}) => {
  // Unused because custom images are disabled, added a prefix so linter ignores this.
  // Please actually implement this, it's good.
  const [_images, setImages] = useState<HeroImageItem[]>(FALLBACK_HERO_IMAGES);
  const [isFetching, setIsFetching] = useState<boolean>(customImages === undefined);

  useEffect(() => {
    if (customImages !== undefined) {
      setIsFetching(false);
      return;
    }

    let isMounted = true;

    async function fetchHeroImages() {
      try {
        const response = await api.get("/hero/images");
        if (
          isMounted &&
          response.data?.success &&
          Array.isArray(response.data?.images) &&
          response.data.images.length > 0
        ) {
          setImages(response.data.images);
        }
      } catch (err) {
        console.warn("Could not load dynamic hero images, using fallback:", err);
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    fetchHeroImages();

    return () => {
      isMounted = false;
    };
  }, [customImages]);

  const activeLoading = propIsLoading !== undefined ? propIsLoading : isFetching;

  // Custom images are disabled for being "too complicated"...fine.
  // See also targetItemsCount in hero-3.tsx
  return (
    <AnimatedMarqueeHero
      className={className}
      badgeText={badgeText}
      title={title}
      description={description}
      primaryCtaText={primaryCtaText}
      primaryCtaLink={primaryCtaLink}
      secondaryCtaText={secondaryCtaText}
      secondaryCtaLink={secondaryCtaLink}
      // images={customImages !== undefined ? customImages : images}
      images={FALLBACK_HERO_IMAGES}
      singleRow={singleRow}
      isLoading={activeLoading}
      {...restProps}
    />
  );
};

export default CuratedHero;
