// BrandMarquee.tsx — continuous right→left circular logo strip
// Logos travel left, exit, and reappear from the right in an endless loop.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./BrandMarquee.css";

export interface BrandMarqueeItem {
  name: string;
  logo?: string;
  logoLightPlate?: boolean;
  onSelect?: () => void;
}

interface BrandMarqueeProps {
  items: BrandMarqueeItem[];
  /** Seconds for one full loop of the strip (lower = faster) */
  speed?: number;
  /** Pause scrolling while hovering a logo */
  pauseOnHover?: boolean;
}

function BrandMarquee({
  items,
  speed = 28,
  pauseOnHover = true,
}: BrandMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Duplicate list so the loop is seamless
  const loopItems = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const setup = () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }

      // Half of track width = one full set of brands
      const totalWidth = track.scrollWidth;
      const half = totalWidth / 2;
      if (half <= 0) return;

      gsap.set(track, { x: 0 });
      tweenRef.current = gsap.to(track, {
        x: -half,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    // Wait a frame so layout/images can measure
    const t = window.setTimeout(setup, 80);
    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };
  }, [items, speed]);

  const handleEnter = () => {
    if (pauseOnHover && tweenRef.current) tweenRef.current.pause();
  };

  const handleLeave = () => {
    if (pauseOnHover && tweenRef.current) tweenRef.current.resume();
  };

  if (items.length === 0) return null;

  return (
    <div
      className="brand-marquee"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      aria-label="Top brands scrolling showcase"
    >
      <div className="brand-marquee-fade brand-marquee-fade--left" aria-hidden="true" />
      <div className="brand-marquee-fade brand-marquee-fade--right" aria-hidden="true" />

      <div className="brand-marquee-viewport">
        <div className="brand-marquee-track" ref={trackRef}>
          {loopItems.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              className="brand-marquee-item"
              title={item.name}
              onClick={() => item.onSelect?.()}
            >
              <span
                className={`brand-marquee-logo-wrap ${
                  item.logoLightPlate ? "is-light" : ""
                }`}
              >
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={`${item.name} logo`}
                    className="brand-marquee-logo"
                    draggable={false}
                    loading="lazy"
                  />
                ) : (
                  <span className="brand-marquee-fallback">{item.name.slice(0, 2)}</span>
                )}
              </span>
              <span className="brand-marquee-name">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BrandMarquee;
