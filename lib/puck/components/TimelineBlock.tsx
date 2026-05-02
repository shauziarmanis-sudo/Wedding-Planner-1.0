"use client";

import { Heart } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass } from "./shared";

export type TimelineProps = SharedStyleProps & {
  heading: string;
  stories: { year: string; title: string; description: string }[];
};

export function TimelineBlock(props: TimelineProps) {
  const {
    heading,
    stories,
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

  return (
    <section className="py-24 px-6 relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}
      <div className="relative z-10">
        <h2
          className="font-bold text-center mb-16"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
        >
          {heading}
        </h2>

        <div className="max-w-3xl mx-auto">
          {stories.map((story, index) => (
            <div key={index} className="flex flex-col md:flex-row mb-12 last:mb-0 relative group">
              {/* Timeline Line (Desktop) */}
              <div
                className="hidden md:block absolute left-1/2 top-0 bottom-[-3rem] w-px opacity-20 group-last:bottom-0"
                style={{ backgroundColor: accentColor }}
              />

              {/* Year Bubble (Desktop Middle) */}
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-0 w-24 flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 z-10 shadow-lg border-2 bg-white/90 ${animClass}`}
                  style={{ borderColor: accentColor }}
                >
                  <Heart className="opacity-60" style={{ color: accentColor, width: accentSize * 0.8, height: accentSize * 0.8 }} />
                </div>
                <span className="font-bold" style={{ color: accentColor, fontFamily: headingFont, fontSize: headingSize * 0.5 }}>{story.year}</span>
              </div>

              {/* Content */}
              <div className={`w-full md:w-[calc(50%-4rem)] ${index % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto md:text-left"}`}>
                <div
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all"
                  style={{ borderColor: `${accentColor}20` }}
                >
                  <div className="md:hidden flex items-center gap-3 mb-4 border-b pb-4" style={{ borderColor: `${accentColor}20` }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
                      style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30` }}
                    >
                      <Heart className="w-5 h-5 opacity-60" style={{ color: accentColor }} />
                    </div>
                    <span className="font-bold text-xl" style={{ color: accentColor, fontFamily: headingFont }}>{story.year}</span>
                  </div>

                  <h3 className="font-bold mb-3" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.6 }}>{story.title}</h3>
                  <p className="opacity-70 leading-relaxed" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
                    {story.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
