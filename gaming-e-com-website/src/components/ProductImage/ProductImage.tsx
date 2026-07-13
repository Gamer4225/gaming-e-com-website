// ProductImage.tsx - Product photo with graceful error fallback
import { useEffect, useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#12121e"/>
      <rect x="40" y="40" width="320" height="320" rx="24" fill="#18182a" stroke="#1e1e35" stroke-width="2"/>
      <path d="M140 220 L180 170 L220 210 L250 180 L280 220 Z" fill="none" stroke="#00bfff" stroke-width="4" opacity="0.5"/>
      <circle cx="170" cy="150" r="14" fill="none" stroke="#8a2be2" stroke-width="3" opacity="0.6"/>
      <text x="200" y="280" text-anchor="middle" fill="#5a5a72" font-family="system-ui,sans-serif" font-size="16">Image unavailable</text>
    </svg>`
  );

function ProductImage({ src, alt, className, loading = "lazy" }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      src={failed ? FALLBACK : src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

export default ProductImage;
