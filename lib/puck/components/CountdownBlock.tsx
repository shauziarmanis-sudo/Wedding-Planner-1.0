"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass, getLayoutClasses } from "./shared";

export type CountdownProps = SharedStyleProps & {
  targetDate: string;
  heading: string;
};

export function CountdownBlock(props: CountdownProps) {
  const {
    targetDate,
    heading,
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
    contentAlignX,
    contentAlignY,
  } = props;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // initial call
    return () => clearInterval(timer);
  }, [targetDate]);

  const bgStyle = getSectionStyle(props);
  const animClass = getAccentAnimClass(accentAnimation);
  const layoutClass = getLayoutClasses(contentAlignX, contentAlignY);

  return (
    <section className="py-24 px-6 relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}

      <div className={`max-w-3xl mx-auto relative z-10 ${layoutClass}`}>
        <Clock className={`mb-4 ${animClass} ${contentAlignX === 'center' ? 'mx-auto' : contentAlignX === 'right' ? 'ml-auto' : ''}`} style={{ color: accentColor, width: accentSize, height: accentSize }} />
        <h2
          className="font-bold mb-10"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
        >
          {heading}
        </h2>

        <div className="flex justify-center gap-4 md:gap-8">
          {[
            { label: "Hari", value: timeLeft.days },
            { label: "Jam", value: timeLeft.hours },
            { label: "Menit", value: timeLeft.minutes },
            { label: "Detik", value: timeLeft.seconds },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl shadow-lg border mb-3 bg-white/90 backdrop-blur-sm"
                style={{ borderColor: `${accentColor}30` }}
              >
                <span className="font-bold" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.7 }}>
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>
              <span className="font-medium tracking-widest uppercase opacity-70" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize * 0.8 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
