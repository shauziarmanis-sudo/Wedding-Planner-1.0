"use client";

import { SharedStyleProps, getSectionStyle, getAccentAnimClass } from "./shared";

export type VideoGalleryProps = SharedStyleProps & {
  heading: string;
  videoUrl: string;
};

export function VideoGalleryBlock(props: VideoGalleryProps) {
  const {
    heading,
    videoUrl,
    accentColor,
    backgroundColor,
    textColor,
    headingFont,
    bodyFont,
    headingSize,
    bodySize,
    backgroundImageUrl,
    overlayOpacity,
    accentAnimation,
  } = props;

  const bgStyle = getSectionStyle(props);
  const animClass = getAccentAnimClass(accentAnimation);

  // Extract YouTube ID safely
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYoutubeId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : "";

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
          className="font-bold text-center mb-12"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
        >
          {heading}
        </h2>

        <div className="max-w-4xl mx-auto">
          {embedUrl ? (
            <div className={`aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 ${animClass}`} style={{ borderColor: `${accentColor}30` }}>
              <iframe
                src={embedUrl}
                title="Video Invitation"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-dashed flex items-center justify-center bg-gray-50/80 backdrop-blur-sm" style={{ borderColor: `${accentColor}30` }}>
              <div className="text-center p-6">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <p className="font-medium" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>URL Video belum diisi atau tidak valid</p>
                <p className="text-sm opacity-50 mt-2" style={{ color: textColor }}>Masukkan link YouTube yang benar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
