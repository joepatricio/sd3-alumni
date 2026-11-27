import React, { useEffect, useState } from "react";
import { api } from "@/app/views/api";
import { AnimatedMarqueeHero, type HeroImageItem, type AnimatedMarqueeHeroProps } from "@/components/hero-3";

const FALLBACK_HERO_IMAGES: HeroImageItem[] = [
  { url: "/images/albums/default/otog.jpg", title: "One Team One Goal!" },            // url: https://www.facebook.com/usjrsea/posts/pfbid0xaZPKpWK2eiqw3pXhwCQ6fmEG3zPcdkX4VXji9hyCmRsb2AqyCuYMrZt1sUBW1mil
  { url: "/images/albums/default/enrollment.jpg", title: "SEA Enrollment" },          // url: https://www.facebook.com/photo.php?fbid=1458623676287498
  { url: "/images/albums/default/masters.jpg", title: "SEA Graduate School" },        // url: https://www.facebook.com/photo.php?fbid=1351069143709619
  { url: "/images/albums/default/specialcourse.jpg", title: "SEA Diploma Program" },  // url: https://www.facebook.com/photo.php?fbid=1445758110907388
  { url: "/images/albums/default/research.jpg", title: "Featured Research" },         // url: https://www.facebook.com/usjrsea/posts/pfbid02PFRtqB3UXd7iYuyPWSfomj5urnGJKfDQoxeFi29xGBgQoDfuBsaP5cePKkqPDmCcl
  { url: "/images/albums/default/research2.jpg", title: "Featured Research" },        // url: https://www.facebook.com/usjrsea/posts/pfbid02PFRtqB3UXd7iYuyPWSfomj5urnGJKfDQoxeFi29xGBgQoDfuBsaP5cePKkqPDmCcl
  { url: "/images/albums/default/deans.jpg", title: "SEA Deans" },                    // url: https://www.facebook.com/usjrsea/posts/pfbid02Mg2CrmyDKecUX41NCnZCamum2gLZjpGdbSrn92NhVvTvNaV7PWKZPvD99twcBsBUl
  { url: "/images/albums/default/civil.jpg", title: "Civil Engineering" },            // url: https://www.facebook.com/photo.php?fbid=1515931363890062
  { url: "/images/albums/default/ece.jpg", title: "Electronics Engineering" },        // url: https://www.facebook.com/usjrsea/posts/pfbid02SVbhQNTA7M78gZXCNWLx3zAB8sfLXWEgm3Ag4RuCG8GMsRA4QgkTZHhV2iVhGfL2l
  { url: "/images/albums/default/electrical.jpg", title: "Electrical Engineering" },  // url: https://www.facebook.com/photo.php?fbid=1526920069457858
  { url: "/images/albums/default/mayor.jpg", title: "icRS 2026" },                    // url: https://www.facebook.com/usjrsea/posts/pfbid026i24tjhNoTDaQK136oRFASrv1CUSHqA98rVAzg71m1wtBZDDAyB9fVQGJ41No8gtl
  { url: "/images/albums/default/homecoming.jpg", title: "SEA Alumni Homecoming" },   // url: https://www.facebook.com/photo.php?fbid=1288661879950346
];

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
