"use client";

import { Image as ImageIcon } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass } from "./shared";

export type GalleryProps = SharedStyleProps & {
  heading: string;
  images: { url: string; alt: string }[];
  layout: "grid" | "masonry" | "carousel";
};

export function GalleryBlock(props: GalleryProps) {
  const {
    heading,
    images,
    layout,
    accentColor,
    backgroundColor,
    textColor,
    headingFont,
    bodyFont,
    headingSize,
    bodySize,
    backgroundImageUrl,
    overlayOpacity,
    accentSize,
    accentAnimation,
  } = props;

  const bgStyle = getSectionStyle(props);
  const animClass = getAccentAnimClass(accentAnimation);

  if (!images || images.length === 0) {
    return (
      <section className="py-20 px-6 text-center relative" style={bgStyle}>
        {backgroundImageUrl && (
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
          />
        )}
        <div className="relative z-10">
          <h2 className="font-bold mb-8" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}>
            {heading}
          </h2>
          <div className="p-10 border-2 border-dashed rounded-xl max-w-2xl mx-auto" style={{ borderColor: `${accentColor}50` }}>
            <ImageIcon className={`mx-auto mb-3 opacity-50 ${animClass}`} style={{ color: accentColor, width: accentSize, height: accentSize }} />
            <p className="opacity-70" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>Belum ada foto di galeri</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}
      <div className="relative z-10 max-w-5xl mx-auto">
        <h2
          className="font-bold text-center mb-12"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
        >
          {heading}
        </h2>

        {layout === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {images.map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md group relative">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {layout === "masonry" && (
          <div className="columns-2 md:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {images.map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-md group relative break-inside-avoid">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {layout === "carousel" && (
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory no-scrollbar">
            {images.map((img, i) => (
              <div key={i} className="shrink-0 w-72 md:w-96 aspect-[4/5] rounded-3xl overflow-hidden shadow-lg snap-center relative group">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
