"use client";

import { SharedStyleProps, getSectionStyle, getContentStyle, renderAccentContainer, getLayoutClasses } from "./shared";

export type QuoteProps = SharedStyleProps & {
  quote: string;
  author: string;
};

export function QuoteBlock(props: QuoteProps) {
  const {
    quote,
    author,
    textColor,
    headingFont,
    bodyFont,
    headingSize,
    bodySize,
    backgroundImageUrl,
    overlayOpacity,
    contentAlignX,
    contentAlignY,
  } = props;

  const bgStyle = getSectionStyle(props);
  const layoutClass = getLayoutClasses(contentAlignX, contentAlignY);
  const contentStyle = getContentStyle(props);

  return (
    <section className="py-24 px-6 relative flex justify-center items-center" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}

      <div className={`max-w-2xl mx-auto relative z-10 flex flex-col ${layoutClass}`} style={contentStyle}>
        {renderAccentContainer(props)}
        <p
          className="italic"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.7 }}
        >
          &quot;{quote}&quot;
        </p>
        <p className="font-bold tracking-widest uppercase opacity-80" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
          {author}
        </p>
      </div>
    </section>
  );
}
