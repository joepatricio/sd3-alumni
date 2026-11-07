import CuratedHero, { type CuratedHeroProps } from './CuratedHero';

export function Hero(props: CuratedHeroProps) {
  return <CuratedHero {...props} />;
}

export default Hero;
