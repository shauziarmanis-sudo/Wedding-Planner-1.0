"use client";

import { Calendar, Clock, Heart, MapPin, ExternalLink } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass } from "./shared";

export type EventDetailsProps = SharedStyleProps & {
  sectionTitle: string;
  akadLabel: string;
  akadTime: string;
  akadDate: string;
  resepsiLabel: string;
  resepsiTime: string;
  resepsiDate: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
};

export function EventDetailsBlock(props: EventDetailsProps) {
  const {
    sectionTitle,
    akadLabel,
    akadTime,
    akadDate,
    resepsiLabel,
    resepsiTime,
    resepsiDate,
    venueName,
    venueAddress,
    mapsUrl,
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

      <div className="max-w-4xl mx-auto relative z-10">
        <h2
          className="font-bold text-center mb-14"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
        >
          {sectionTitle}
        </h2>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Akad Card */}
          <div
            className="rounded-2xl p-8 text-center shadow-lg border bg-white/90"
            style={{ borderColor: `${accentColor}30` }}
          >
            <div
              className={`rounded-full flex items-center justify-center mx-auto mb-4 ${animClass}`}
              style={{ backgroundColor: `${accentColor}15`, width: accentSize * 2, height: accentSize * 2 }}
            >
              <Calendar style={{ color: accentColor, width: accentSize, height: accentSize }} />
            </div>
            <h3 className="font-bold mb-3" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.6 }}>{akadLabel}</h3>
            <p className="opacity-70 mb-1" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>{akadDate}</p>
            <div className="flex items-center justify-center gap-2">
              <Clock className="opacity-60" style={{ color: accentColor, width: bodySize, height: bodySize }} />
              <span className="font-semibold" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>{akadTime}</span>
            </div>
          </div>

          {/* Resepsi Card */}
          <div
            className="rounded-2xl p-8 text-center shadow-lg border bg-white/90"
            style={{ borderColor: `${accentColor}30` }}
          >
            <div
              className={`rounded-full flex items-center justify-center mx-auto mb-4 ${animClass}`}
              style={{ backgroundColor: `${accentColor}15`, width: accentSize * 2, height: accentSize * 2 }}
            >
              <Heart style={{ color: accentColor, width: accentSize, height: accentSize }} />
            </div>
            <h3 className="font-bold mb-3" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.6 }}>{resepsiLabel}</h3>
            <p className="opacity-70 mb-1" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>{resepsiDate}</p>
            <div className="flex items-center justify-center gap-2">
              <Clock className="opacity-60" style={{ color: accentColor, width: bodySize, height: bodySize }} />
              <span className="font-semibold" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>{resepsiTime}</span>
            </div>
          </div>
        </div>

        {/* Venue + Lihat Lokasi Button */}
        <div className="max-w-3xl mx-auto text-center">
          <MapPin className={`mx-auto mb-3 ${animClass}`} style={{ color: accentColor, width: accentSize, height: accentSize }} />
          <p className="font-bold mb-1" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.5 }}>{venueName}</p>
          <p className="opacity-60 mb-6" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>{venueAddress}</p>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: accentColor, color: "#fff", fontFamily: bodyFont, fontSize: bodySize }}
            >
              <MapPin style={{ width: bodySize, height: bodySize }} />
              Lihat Lokasi
              <ExternalLink className="opacity-70" style={{ width: bodySize * 0.8, height: bodySize * 0.8 }} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
