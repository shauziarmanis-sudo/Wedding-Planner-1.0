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
export function getAccentAnimClass(animation: string): string {
  switch (animation) {
    case "pulse":
      return "animate-pulse";
    case "bounce":
      return "animate-bounce";
    case "spin":
      return "animate-spin";
    case "fadeInUp":
      return "animate-fadeInUp";
    default:
      return "";
  }
}
