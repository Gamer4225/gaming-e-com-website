// Icons.tsx - Inline SVG icons (always render; no emoji font dependency)
// GameVault brand uses official logo image (embedded data URL for single-file builds)

import type { CSSProperties } from "react";
import { GAMEVAULT_LOGO_DATA_URL } from "../../assets/logoData";

interface IconProps {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

const base = (size: number | string = 22): CSSProperties => ({
  width: size,
  height: size,
  display: "inline-block",
  verticalAlign: "middle",
  flexShrink: 0,
});

/**
 * Official GameVault logo — recolored to cyan/purple neon theme.
 * Transparent background, embedded as data URL for single-file builds.
 * Logo already includes the GameVault wordmark — use logo-only in UI.
 */
export function LogoIcon({ size = 28, className, style, title = "GameVault" }: IconProps) {
  const px = typeof size === "number" ? size : 28;
  return (
    <img
      src={GAMEVAULT_LOGO_DATA_URL}
      alt={title}
      width={px}
      height={px}
      className={className}
      style={{
        width: px,
        height: px,
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        objectFit: "contain",
        objectPosition: "center",
        ...style,
      }}
      draggable={false}
    />
  );
}

export function CpuIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3" />
    </svg>
  );
}

export function GpuIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="9" cy="12" r="2.5" />
      <path d="M14 9h5M14 12h5M14 15h3" />
      <path d="M5 6V4M9 6V4M5 18v2M9 18v2" />
    </svg>
  );
}

export function RamIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="10" rx="1.5" />
      <path d="M6 7V5M9 7V5M12 7V5M15 7V5M18 7V5" />
      <path d="M7 12h2M11 12h2M15 12h2" />
    </svg>
  );
}

export function SsdIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h4M7 12h6M7 15h3" />
      <circle cx="17" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LaptopIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 18h20" />
      <path d="M9 18l1 2h4l1-2" />
    </svg>
  );
}

/** Console tower / game system */
export function ConsoleIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Standing console body */}
      <rect x="6" y="3" width="12" height="18" rx="2" />
      {/* Disc slot */}
      <path d="M9 8h6" />
      {/* Status light */}
      <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" />
      {/* Base feet */}
      <path d="M8 21h8" />
    </svg>
  );
}

/** Gamepad / controller */
export function ControllerIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Gamepad body */}
      <path d="M6.5 9.5h11c2.2 0 3.5 1.6 3.5 3.4 0 2.1-1.5 3.6-3.3 3.6-.7 0-1.3-.3-1.8-.9L14.5 14h-5l-1.4 1.6c-.5.6-1.1.9-1.8.9C4.5 16.5 3 15 3 12.9 3 11.1 4.3 9.5 6.5 9.5z" />
      {/* D-pad */}
      <path d="M8 11.2v3.2M6.4 12.8h3.2" />
      {/* Action buttons */}
      <circle cx="15.2" cy="11.6" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="17.1" cy="13.3" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="15.2" cy="14.2" r="0.7" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="13.4" cy="13.3" r="0.7" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
  );
}

export function MonitorIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function KeyboardIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="11" rx="2" />
      <path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M8 14h8" />
    </svg>
  );
}

export function MouseIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <path d="M12 3v5M7 8h10" />
    </svg>
  );
}

export function HeadsetIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2" y="13" width="4" height="7" rx="1.5" />
      <rect x="18" y="13" width="4" height="7" rx="1.5" />
      <path d="M18 18h1a2 2 0 0 1 2 2" />
    </svg>
  );
}

/** Gaming chair with high back + armrests */
export function ChairIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* High backrest */}
      <path d="M8 3.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5V11H8V3.5z" />
      {/* Seat */}
      <path d="M6.5 11h11v2.8c0 .9-.7 1.7-1.6 1.7H8.1c-.9 0-1.6-.8-1.6-1.7V11z" />
      {/* Armrests */}
      <path d="M6.5 12.2H4.8c-.6 0-1.1.5-1.1 1.1V15" />
      <path d="M17.5 12.2h1.7c.6 0 1.1.5 1.1 1.1V15" />
      {/* Pillar + base */}
      <path d="M12 15.5v3.2" />
      <path d="M8.5 20.5h7" />
      <path d="M9.2 20.5l-1.4 2M14.8 20.5l1.4 2M12 20.5v2" />
    </svg>
  );
}

/** PC case / cabinet */
export function CabinetIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2.5" width="14" height="19" rx="1.8" />
      {/* tempered glass panel hint */}
      <rect x="7.2" y="5" width="6.5" height="11" rx="1" opacity="0.9" />
      {/* PSU vent lines */}
      <path d="M15.5 6.5h1.8M15.5 9h1.8M15.5 11.5h1.8" />
      {/* Power button */}
      <circle cx="16.4" cy="16.5" r="1.2" />
      {/* Front I/O */}
      <path d="M8 18.5h4" />
    </svg>
  );
}

export function HandheldIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <rect x="8" y="5" width="8" height="7" rx="1" />
      <circle cx="10" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="16" r="1" fill="currentColor" stroke="none" />
      <path d="M12 15v2" />
    </svg>
  );
}

export function DeskIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10h18" />
      <path d="M5 10v10M19 10v10" />
      <path d="M3 10l2-5h14l2 5" />
      <path d="M9 14h6" />
    </svg>
  );
}

export function TabletIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function PackageIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l9-5 9 5v9l-9 5-9-5V8z" />
      <path d="M12 13V3M3 8l9 5 9-5" />
    </svg>
  );
}

export function SearchIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function CartIcon({ size = 20, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.5L21 8H7" />
    </svg>
  );
}

export function SettingsIcon({ size = 20, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function TruckIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7v-6z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function ShieldIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function LockIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ReturnIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 1 1 0 12h-3" />
    </svg>
  );
}

export function ChatIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-0-0z" />
    </svg>
  );
}

export function BoltIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ ...base(size), ...style }} fill="currentColor" stroke="none">
      <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" opacity="0.95" />
    </svg>
  );
}

export function ComponentsGroupIcon({ size = 18, className, style }: IconProps) {
  return <CpuIcon size={size} className={className} style={style} />;
}

export function GamingGroupIcon({ size = 18, className, style }: IconProps) {
  return <ConsoleIcon size={size} className={className} style={style} />;
}

export function DisplaysGroupIcon({ size = 18, className, style }: IconProps) {
  return <MonitorIcon size={size} className={className} style={style} />;
}

export function AccessoriesGroupIcon({ size = 18, className, style }: IconProps) {
  return <HeadsetIcon size={size} className={className} style={style} />;
}

/** Map product category value → icon component */
export function CategoryIcon({
  category,
  size = 22,
  className,
  style,
}: { category: string } & IconProps) {
  const props = { size, className, style };
  switch (category) {
    case "CPU":
      return <CpuIcon {...props} />;
    case "GPU":
      return <GpuIcon {...props} />;
    case "RAM":
      return <RamIcon {...props} />;
    case "SSD":
      return <SsdIcon {...props} />;
    case "Gaming Laptop":
    case "Laptops":
      return <LaptopIcon {...props} />;
    case "Console":
    case "Consoles":
      return <ConsoleIcon {...props} />;
    case "Controller":
    case "Controllers":
      return <ControllerIcon {...props} />;
    case "Monitor":
    case "Monitors":
      return <MonitorIcon {...props} />;
    case "Gaming Keyboard":
    case "Keyboards":
      return <KeyboardIcon {...props} />;
    case "Gaming Mouse":
    case "Mouse":
      return <MouseIcon {...props} />;
    case "Gaming Headset":
    case "Headsets":
      return <HeadsetIcon {...props} />;
    case "Gaming Chair":
    case "Chairs":
      return <ChairIcon {...props} />;
    case "Handheld Gaming":
    case "Handhelds":
      return <HandheldIcon {...props} />;
    case "Gaming Desk":
      return <DeskIcon {...props} />;
    case "PC Cabinet":
    case "PC Cabinets":
    case "Cabinet":
      return <CabinetIcon {...props} />;
    case "Tablet":
    case "Tablets":
      return <TabletIcon {...props} />;
    case "All":
    default:
      return <PackageIcon {...props} />;
  }
}
