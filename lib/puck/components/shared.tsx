// ── Shared style types for all Puck blocks ──────────────────────

export type SharedStyleProps = {
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  headingSize: number;
  bodySize: number;
  backgroundImageUrl?: string;
  overlayOpacity: number;
  accentSize: number;
  accentAnimation: "none" | "pulse" | "bounce" | "spin" | "fadeInUp";
  contentAlignX: "left" | "center" | "right";
  contentAlignY: "top" | "center" | "bottom";
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  bgZoom: number;
  bgPosX: number;
  bgPosY: number;
  lineHeight: number;
  elementSpacing: number;
  accentType: "heart" | "leaf" | "flower" | "ring" | "star" | "none";
  enableAccent: boolean;
  accentSpacing: number;
};

export const defaultStyleProps: SharedStyleProps = {
  accentColor: "#c8a060",
  backgroundColor: "#faf8f5",
  textColor: "#2d2d2d",
  headingFont: "'Great Vibes', cursive",
  bodyFont: "'Cormorant Garamond', serif",
  headingSize: 40,
  bodySize: 16,
  backgroundImageUrl: "",
  overlayOpacity: 40,
  accentSize: 24,
  accentAnimation: "pulse",
  contentAlignX: "center",
  contentAlignY: "center",
  paddingTop: 96,
  paddingBottom: 96,
  paddingLeft: 24,
  paddingRight: 24,
  bgZoom: 0,
  bgPosX: 50,
  bgPosY: 50,
  lineHeight: 1.6,
  elementSpacing: 24,
  accentType: "heart",
  enableAccent: true,
  accentSpacing: 24,
};

/** Returns layout flex classes for alignment */
export function getLayoutClasses(alignX: string, alignY: string): string {
  let classes = "flex flex-col w-full h-full ";
  // Y Alignment (justify because it's flex-col)
  if (alignY === "top") classes += "justify-start ";
  else if (alignY === "bottom") classes += "justify-end ";
  else classes += "justify-center ";
  
  // X Alignment (items because it's flex-col)
  if (alignX === "left") classes += "items-start text-left ";
  else if (alignX === "right") classes += "items-end text-right ";
  else classes += "items-center text-center ";

  return classes;
}

export function getContentStyle(props: Partial<SharedStyleProps>) {
  return {
    gap: props.elementSpacing !== undefined ? `${props.elementSpacing}px` : "24px",
    lineHeight: props.lineHeight !== undefined ? props.lineHeight : 1.6,
  };
}

/** Returns background and padding style object */
export function getSectionStyle(props: Partial<SharedStyleProps>) {
  const baseStyle: any = {
    backgroundColor: props.backgroundColor || "#faf8f5",
    paddingTop: props.paddingTop !== undefined ? `${props.paddingTop}px` : undefined,
    paddingBottom: props.paddingBottom !== undefined ? `${props.paddingBottom}px` : undefined,
    paddingLeft: props.paddingLeft !== undefined ? `${props.paddingLeft}px` : undefined,
    paddingRight: props.paddingRight !== undefined ? `${props.paddingRight}px` : undefined,
  };

  if (props.backgroundImageUrl) {
    baseStyle.backgroundImage = `url(${props.backgroundImageUrl})`;
    // If bgZoom is 0 or undefined, use cover. Otherwise use percentage.
    baseStyle.backgroundSize = props.bgZoom && props.bgZoom > 0 ? `${props.bgZoom}%` : "cover";
    // Default to center (50% 50%) if undefined
    const posX = props.bgPosX !== undefined ? props.bgPosX : 50;
    const posY = props.bgPosY !== undefined ? props.bgPosY : 50;
    baseStyle.backgroundPosition = `${posX}% ${posY}%`;
  }
  
  return baseStyle;
}

/** Returns CSS animation class name for accent elements */
export function getAccentAnimClass(anim?: string) {
  switch (anim) {
    case "pulse":
      return "animate-pulse";
    case "bounce":
      return "animate-bounce";
    case "spin":
      return "animate-spin-slow";
    case "fadeInUp":
      return "animate-fade-in-up";
    default:
      return "";
  }
}

/** Render appropriate SVG Accent */
export function renderAccent(props: Partial<SharedStyleProps>) {
  if (props.enableAccent === false) return null;
  if (props.accentType === "none") return null;

  const size = props.accentSize || 24;
  const color = props.accentColor || "#c8a060";
  const opacity = 0.6;
  const style = { color, width: size, height: size, opacity };

  switch (props.accentType) {
    case "leaf":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 2c-3.4 0-6.8 1.4-9.2 3.8-4.9 4.9-5.1 12.7-5.1 12.7s7.8-.2 12.7-5.1C18.3 11 19.8 7.6 19.8 4.2 19.8 3 18.7 2 17.5 2zM15 8l-6 6-1.4-1.4 6-6L15 8z" />
        </svg>
      );
    case "flower":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c-1.6 0-3 1.4-3 3 0 .4.1.8.2 1.2-1.9-.3-3.7.8-4.3 2.5-.5 1.5 0 3.3 1.2 4.3H6c-1.6 0-3 1.4-3 3s1.4 3 3 3h.2c-1.1 1.2-1.6 3-.8 4.5.6 1.1 1.8 1.8 3.1 1.8 1.5 0 2.9-1 3.5-2.4v.1c0 1.6 1.4 3 3 3s3-1.4 3-3v-.1c.6 1.4 2 2.4 3.5 2.4 1.3 0 2.5-.7 3.1-1.8.8-1.5.3-3.3-.8-4.5h.2c1.6 0 3-1.4 3-3s-1.4-3-3-3h-.1c1.2-1 1.7-2.8 1.2-4.3-.6-1.7-2.4-2.8-4.3-2.5.1-.4.2-.8.2-1.2 0-1.6-1.4-3-3-3zm0 13c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
        </svg>
      );
    case "ring":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="12" r="5" />
          <circle cx="16" cy="12" r="5" />
        </svg>
      );
    case "star":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    case "heart":
    default:
      return (
        <svg style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
  }
}

/** Render the full Accent Container with lines */
export function renderAccentContainer(props: Partial<SharedStyleProps>) {
  if (props.enableAccent === false) return null;
  if (props.accentType === "none") return null;
  const animClass = getAccentAnimClass(props.accentAnimation);
  const color = props.accentColor || "#c8a060";
  const marginY = props.accentSpacing !== undefined ? props.accentSpacing : 24;
  const justify = props.contentAlignX === 'left' ? 'justify-start' : props.contentAlignX === 'right' ? 'justify-end' : 'justify-center';

  return (
    <div 
      className={`flex items-center gap-4 ${animClass} ${justify}`} 
      style={{ marginTop: marginY, marginBottom: marginY }}
    >
      <div className="h-px w-16 opacity-40" style={{ backgroundColor: color }} />
      {renderAccent(props)}
      <div className="h-px w-16 opacity-40" style={{ backgroundColor: color }} />
    </div>
  );
}

