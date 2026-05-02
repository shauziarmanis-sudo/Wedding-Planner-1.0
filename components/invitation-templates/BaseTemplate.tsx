"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { BaseTemplateProps, SectionKey, InvitationConfig, InvitationPhoto, EventItem, WishItem } from "@/types/invitation.types";
import { Calendar, MapPin, Clock, Heart, Users, Check, X, ChevronDown, Volume2, VolumeX, Send, Navigation, Gem, MessageSquare, Loader2, Copy, CheckCheck, Gift } from "lucide-react";
import { format, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ── Animation Variants ───────────────────────────────────────────
export function getAnimationVariants(type: string): Variants {
  switch (type) {
    case 'slide':
      return { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
    case 'zoom':
      return { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } } };
    case 'none':
      return { hidden: {}, visible: {} };
    default: // fade
      return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } };
  }
}

export function getSpacingClass(spacing: string) {
  switch (spacing) {
    case 'compact': return 'py-8 md:py-12';
    case 'spacious': return 'py-16 md:py-24';
    default: return 'py-12 md:py-16';
  }
}

// ── Section: Opening (BARU — Tugas 2) ────────────────────────────
export function OpeningSection({ data, config, guestName, onOpen }: {
  data: BaseTemplateProps['weddingData'];
  config: InvitationConfig;
  guestName?: string;
  onOpen: () => void;
}) {
  const style = config.openingStyle || 'none';
  if (style === 'none') return null;

  // Lock scroll while opening is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const commonContent = (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 relative z-10">
      <motion.p
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
        className="text-sm uppercase tracking-[0.3em] mb-6 opacity-80"
        style={{ fontFamily: 'var(--font-body)', color: '#fff' }}
      >
        Undangan Pernikahan
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
        className="text-4xl md:text-5xl font-bold mb-4"
        style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}
      >
        {data.groomName} <span className="text-2xl md:text-3xl font-normal opacity-80">&amp;</span> {data.brideName}
      </motion.h1>
      {data.weddingDate && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
          className="text-base mb-8 opacity-90"
          style={{ fontFamily: 'var(--font-body)', color: '#fff' }}
        >
          {format(new Date(data.weddingDate), "EEEE, d MMMM yyyy", { locale: idLocale })}
        </motion.p>
      )}
      {guestName && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }}
          className="text-sm mb-8 opacity-70"
          style={{ fontFamily: 'var(--font-body)', color: '#fff' }}
        >
          Kepada Yth. <strong>{guestName}</strong>
        </motion.p>
      )}
      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={onOpen}
        className="px-8 py-3 rounded-full text-sm font-medium shadow-lg transition-colors border-2 border-white/50 hover:border-white"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)', backgroundColor: '#fff' }}
      >
        Buka Undangan
      </motion.button>
    </div>
  );

  if (style === 'envelope') {
    return (
      <motion.div className="fixed inset-0 z-[100] flex flex-col" style={{ backgroundColor: 'var(--color-primary)' }}>
        {/* Top flap */}
        <motion.div
          initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 top-0 h-1/2"
          style={{ backgroundColor: 'var(--color-primary)', zIndex: 2 }}
        />
        {/* Bottom flap */}
        <motion.div
          initial={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 top-1/2 h-1/2"
          style={{ backgroundColor: 'var(--color-primary)', zIndex: 2 }}
        />
        {/* Content layer behind flaps */}
        <motion.div exit={{ opacity: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="relative z-[3]">
          {commonContent}
        </motion.div>
      </motion.div>
    );
  }

  if (style === 'curtain') {
    return (
      <motion.div className="fixed inset-0 z-[100]" style={{ backgroundColor: 'var(--color-primary)' }}>
        {/* Left curtain */}
        <motion.div
          initial={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-1/2 h-full"
          style={{ backgroundColor: 'var(--color-primary)', zIndex: 2 }}
        />
        {/* Right curtain */}
        <motion.div
          initial={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-1/2 h-full"
          style={{ backgroundColor: 'var(--color-primary)', zIndex: 2 }}
        />
        {/* Content layer */}
        <motion.div exit={{ opacity: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="relative z-[3]">
          {commonContent}
        </motion.div>
      </motion.div>
    );
  }

  // Default: fade
  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      style={{ backgroundColor: 'var(--color-primary)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {commonContent}
    </motion.div>
  );
}

// ── Section: Hero ────────────────────────────────────────────────
export function HeroSection({ data, config, photos, guestName }: {
  data: BaseTemplateProps['weddingData']; config: InvitationConfig; photos: InvitationPhoto[]; guestName?: string;
}) {
  const variants = getAnimationVariants(config.animation);
  const couplePhoto = photos.find(p => p.type === 'couple')?.url;

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      {couplePhoto && config.heroLayout === 'full' && (
        <div className="absolute inset-0">
          <img src={couplePhoto} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <div className={`relative z-10 text-center px-6 max-w-3xl mx-auto ${config.heroLayout === 'split' ? 'md:flex md:items-center md:gap-12 md:text-left' : ''}`}>
        {couplePhoto && config.heroLayout === 'split' && (
          <div className="w-64 h-80 mx-auto md:mx-0 mb-8 md:mb-0 rounded-2xl overflow-hidden shadow-xl shrink-0">
            <img src={couplePhoto} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          {guestName && (
            <p className="text-sm mb-4 opacity-80" style={{ fontFamily: 'var(--font-body)', color: config.heroLayout === 'full' ? '#fff' : 'var(--color-primary)' }}>
              Kepada Yth. <strong>{guestName}</strong>
            </p>
          )}
          <p className="text-sm uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)', color: config.heroLayout === 'full' ? '#fff' : 'var(--color-accent)' }}>
            Undangan Pernikahan
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: config.heroLayout === 'full' ? '#fff' : 'var(--color-primary)' }}>
            {data.groomName} <span className="text-2xl md:text-3xl font-normal">&amp;</span> {data.brideName}
          </h1>
          {data.weddingDate && (
            <p className="text-lg" style={{ fontFamily: 'var(--font-body)', color: config.heroLayout === 'full' ? 'rgba(255,255,255,0.9)' : 'var(--color-accent)' }}>
              {format(new Date(data.weddingDate), "EEEE, d MMMM yyyy", { locale: idLocale })}
            </p>
          )}
          {couplePhoto && config.heroLayout === 'center' && (
            <div className="w-48 h-48 mx-auto mt-8 rounded-full overflow-hidden shadow-xl border-4" style={{ borderColor: 'var(--color-accent)' }}>
              <img src={couplePhoto} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ChevronDown className="w-6 h-6" style={{ color: config.heroLayout === 'full' ? '#fff' : 'var(--color-accent)' }} />
      </motion.div>
    </motion.section>
  );
}

// ── Section: Countdown ───────────────────────────────────────────
export function CountdownSection({ weddingDate, config }: { weddingDate: string; config: InvitationConfig }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(weddingDate);
    const update = () => {
      const now = new Date();
      if (target <= now) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: differenceInDays(target, now),
        hours: differenceInHours(target, now) % 24,
        minutes: differenceInMinutes(target, now) % 60,
        seconds: differenceInSeconds(target, now) % 60,
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  const variants = getAnimationVariants(config.animation);
  const style = config.countdownStyle || 'box';
  const items = [
    { value: timeLeft.days, label: 'Hari' },
    { value: timeLeft.hours, label: 'Jam' },
    { value: timeLeft.minutes, label: 'Menit' },
    { value: timeLeft.seconds, label: 'Detik' },
  ];

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} text-center`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
        Menuju Hari Bahagia
      </h2>
      <div className="flex justify-center gap-4 md:gap-6">
        {items.map(item => (
          <div key={item.label} className={`${style === 'minimal' ? '' : 'rounded-xl p-4 md:p-6 min-w-[70px] md:min-w-[90px] shadow-lg'}`}
            style={style !== 'minimal' ? { backgroundColor: 'var(--color-primary)', color: '#fff' } : { color: 'var(--color-primary)' }}>
            <div className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{item.value}</div>
            <div className="text-xs md:text-sm mt-1 opacity-80" style={{ fontFamily: 'var(--font-body)' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// ── Section: Couple (UPGRADED — Tugas 6) ─────────────────────────
export function CoupleSection({ data, config, photos }: {
  data: BaseTemplateProps['weddingData']; config: InvitationConfig; photos?: InvitationPhoto[];
}) {
  const variants = getAnimationVariants(config.animation);
  const groomPhoto = photos?.find(p => p.type === 'groom')?.url;
  const bridePhoto = photos?.find(p => p.type === 'bride')?.url;

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} text-center px-6`} style={{ backgroundColor: 'var(--color-bg)' }}>
      {data.quote && (
        <blockquote className="text-lg italic max-w-xl mx-auto mb-12 opacity-80" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
          &ldquo;{data.quote}&rdquo;
        </blockquote>
      )}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* Groom */}
        <div>
          {groomPhoto ? (
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-4" style={{ borderColor: 'var(--color-accent)' }}>
              <img src={groomPhoto} alt={data.groomName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <Heart className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
          )}
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>{data.groomName}</h3>
          {data.groomBio && (
            <p className="text-sm italic opacity-70 max-w-xs mx-auto mb-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              {data.groomBio}
            </p>
          )}
          {(data.groomFather || data.groomMother) && (
            <p className="text-sm opacity-70" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              Putra dari Bpk. {data.groomFather} &amp; Ibu {data.groomMother}
            </p>
          )}
          {data.groomChildOrder && (
            <p className="text-xs opacity-50 mt-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              {data.groomChildOrder}
            </p>
          )}
        </div>
        {/* Bride */}
        <div>
          {bridePhoto ? (
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-4" style={{ borderColor: 'var(--color-accent)' }}>
              <img src={bridePhoto} alt={data.brideName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <Heart className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
          )}
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>{data.brideName}</h3>
          {data.brideBio && (
            <p className="text-sm italic opacity-70 max-w-xs mx-auto mb-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              {data.brideBio}
            </p>
          )}
          {(data.brideFather || data.brideMother) && (
            <p className="text-sm opacity-70" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              Putri dari Bpk. {data.brideFather} &amp; Ibu {data.brideMother}
            </p>
          )}
          {data.brideChildOrder && (
            <p className="text-xs opacity-50 mt-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              {data.brideChildOrder}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ── Section: Event (UPGRADED — Tugas 3) ─────────────────────────
function EventIcon({ icon }: { icon?: EventItem['icon'] }) {
  switch (icon) {
    case 'akad':    return <Gem className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />;
    case 'resepsi': return <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />;
    case 'ngunduh': return <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />;
    default:        return <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />;
  }
}

function EventCard({ event, config }: { event: EventItem; config: InvitationConfig }) {
  const variants = getAnimationVariants(config.animation);
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className="rounded-2xl p-6 shadow-lg w-full"
      style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(var(--color-accent-rgb, 200,160,100), 0.3)' }}>
      <EventIcon icon={event.icon} />
      <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
        {event.name}
      </h3>
      <div className="flex items-center justify-center gap-2 mb-1">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
          {format(new Date(event.date), "EEEE, d MMMM yyyy", { locale: idLocale })}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
          {event.startTime}{event.endTime ? ` – ${event.endTime}` : ' WIB – Selesai'}
        </span>
      </div>
      <div className="mb-3">
        <p className="font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>{event.venue}</p>
        <p className="text-sm opacity-70 mt-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>{event.address}</p>
      </div>
      {event.dresscode && (
        <p className="text-xs inline-block px-3 py-1 rounded-full mb-4 opacity-80"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)', backgroundColor: 'rgba(0,0,0,0.05)' }}>
          Dresscode: {event.dresscode}
        </p>
      )}
      {event.mapsDirectUrl && (
        <div className="mt-2">
          <a href={event.mapsDirectUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
            <Navigation className="w-4 h-4" /> Navigasi ke Lokasi
          </a>
        </div>
      )}
      {event.mapsUrl && (
        <div className="mt-4 rounded-xl overflow-hidden shadow-sm">
          <iframe src={event.mapsUrl} width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
    </motion.div>
  );
}

export function EventSection({ data, config }: { data: BaseTemplateProps['weddingData']; config: InvitationConfig }) {
  const variants = getAnimationVariants(config.animation);

  // ── Backward compatibility: build events[] from legacy fields ──
  const events: EventItem[] = (data.events && data.events.length > 0)
    ? data.events
    : [
        ...(data.akadTime ? [{
          id: 'legacy-akad', name: 'Akad Nikah', date: data.weddingDate,
          startTime: data.akadTime, venue: data.venueName || '', address: data.venueAddress || '',
          mapsDirectUrl: data.venueMapUrl, icon: 'akad' as const,
        }] : []),
        ...(data.resepsiTime ? [{
          id: 'legacy-resepsi', name: 'Resepsi', date: data.weddingDate,
          startTime: data.resepsiTime, venue: data.venueName || '', address: data.venueAddress || '',
          mapsDirectUrl: data.venueMapUrl, icon: 'resepsi' as const,
        }] : []),
      ];

  if (events.length === 0) return null;

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} text-center px-6`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl md:text-3xl font-bold mb-10" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
        Acara Pernikahan
      </h2>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} config={config} />
        ))}
      </div>
    </motion.section>
  );
}

// ── Section: Love Story (BARU — Tugas 4) ─────────────────────────
export function LoveStorySection({ data, config }: { data: BaseTemplateProps['weddingData']; config: InvitationConfig }) {
  if (!data.loveStory || data.loveStory.length === 0) return null;
  if (config.enableLoveStory === false) return null;

  const variants = getAnimationVariants(config.animation);

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} px-6`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
        Perjalanan Cinta
      </h2>

      <div className="relative max-w-2xl mx-auto">
        {/* Timeline line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.3 }} />

        {data.loveStory.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative flex items-start gap-4 mb-10
                md:w-[calc(50%-20px)]
                ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}
                ml-8 md:ml-0`}
            >
              {/* Timeline dot */}
              <div
                className="absolute w-3 h-3 rounded-full top-1.5 -left-[22px] md:top-1.5 shrink-0"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  ...(isLeft
                    ? { right: undefined, left: '-22px', ['--md-right' as string]: '-26px', ['--md-left' as string]: 'auto' }
                    : {}),
                }}
              />
              {/* Dot repositioned for desktop via CSS */}
              <style>{`
                @media (min-width: 768px) {
                  .ls-dot-left { left: auto !important; right: -26px !important; }
                  .ls-dot-right { left: -26px !important; right: auto !important; }
                }
              `}</style>
              <div className={`absolute w-3 h-3 rounded-full top-1.5 hidden md:block ${isLeft ? 'ls-dot-left' : 'ls-dot-right'}`}
                style={{ backgroundColor: 'var(--color-accent)', left: '-22px' }} />

              {/* Content card */}
              <div className="rounded-2xl p-5 shadow-md w-full" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold px-3 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    {item.year}
                  </span>
                  {item.emoji && <span className="text-lg">{item.emoji}</span>}
                </div>
                <h4 className="font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                  {item.title}
                </h4>
                <p className="text-sm opacity-80 leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

// ── Section: Gallery (UPGRADED — Tugas 5) ────────────────────────
function Lightbox({ photos, initialIndex, onClose }: { photos: InvitationPhoto[]; initialIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % photos.length);
      if (e.key === 'ArrowLeft') setCurrent(c => (c - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, photos.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative max-w-4xl max-h-[85vh] w-full"
        onClick={e => e.stopPropagation()}
      >
        <img src={photos[current].url} alt={photos[current].caption || ''} className="w-full h-full object-contain rounded-xl" />
        {photos[current].caption && (
          <p className="text-center text-white/80 text-sm mt-3" style={{ fontFamily: 'var(--font-body)' }}>{photos[current].caption}</p>
        )}
        {/* Navigation */}
        {photos.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(c => (c - 1 + photos.length) % photos.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
              ‹
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(c => (c + 1) % photos.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
              ›
            </button>
          </>
        )}
      </motion.div>
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xl transition-colors">✕</button>
      {/* Counter */}
      <p className="absolute bottom-4 text-white/60 text-sm">{current + 1} / {photos.length}</p>
    </motion.div>
  );
}

export function GallerySection({ photos, config }: { photos: InvitationPhoto[]; config: InvitationConfig }) {
  const galleryPhotos = photos.filter(p => p.type === 'prewedding' || p.type === 'couple').sort((a, b) => a.order - b.order);
  if (galleryPhotos.length === 0) return null;

  const variants = getAnimationVariants(config.animation);
  const layout = config.galleryLayout || 'grid';
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  return (
    <>
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        className={`${getSpacingClass(config.spacing)} px-6`} style={{ backgroundColor: 'var(--color-bg)' }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
          Galeri Foto
        </h2>

        {/* ── Grid Layout ── */}
        {layout === 'grid' && (
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryPhotos.map((photo, i) => (
              <motion.div key={i} whileHover={{ scale: 1.03 }}
                className="aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer"
                onClick={() => setLightboxIndex(i)}>
                <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Masonry Layout ── */}
        {layout === 'masonry' && (
          <div className="max-w-4xl mx-auto columns-2 md:columns-3 gap-3 space-y-3">
            {galleryPhotos.map((photo, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }}
                className="break-inside-avoid rounded-xl overflow-hidden shadow-md cursor-pointer"
                onClick={() => setLightboxIndex(i)}>
                <img src={photo.url} alt={photo.caption || ''} className="w-full h-auto object-cover" />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Slideshow Layout ── */}
        {layout === 'slideshow' && (
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slideIndex}
                  src={galleryPhotos[slideIndex].url}
                  alt={galleryPhotos[slideIndex].caption || ''}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              {/* Prev / Next */}
              {galleryPhotos.length > 1 && (
                <>
                  <button onClick={() => setSlideIndex(i => (i - 1 + galleryPhotos.length) % galleryPhotos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white text-lg transition-colors">
                    ‹
                  </button>
                  <button onClick={() => setSlideIndex(i => (i + 1) % galleryPhotos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white text-lg transition-colors">
                    ›
                  </button>
                </>
              )}
            </div>
            {/* Dot indicators */}
            {galleryPhotos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {galleryPhotos.map((_, i) => (
                  <button key={i} onClick={() => setSlideIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === slideIndex ? 'scale-125' : 'opacity-40'}`}
                    style={{ backgroundColor: 'var(--color-accent)' }} />
                ))}
              </div>
            )}
            {/* Caption */}
            {galleryPhotos[slideIndex].caption && (
              <p className="text-center text-sm mt-3 opacity-70" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
                {galleryPhotos[slideIndex].caption}
              </p>
            )}
          </div>
        )}
      </motion.section>

      {/* Lightbox overlay (for grid & masonry) */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox photos={galleryPhotos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Section: Map ─────────────────────────────────────────────────
export function MapSection({ data, config }: { data: BaseTemplateProps['weddingData']; config: InvitationConfig }) {
  if (!data.venueMapUrl) return null;
  const variants = getAnimationVariants(config.animation);
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} px-6 text-center`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Lokasi</h2>
      <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg">
        <iframe src={data.venueMapUrl} width="100%" height="350" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <a href={data.venueMapUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
        <MapPin className="w-4 h-4" /> Buka di Google Maps
      </a>
    </motion.section>
  );
}

// ── Section: RSVP (UPGRADED — Tugas 10) ──────────────────────────
export function RSVPSection({ onRSVP, rsvpToken, guestName, config }: {
  onRSVP?: BaseTemplateProps['onRSVP']; rsvpToken?: string; guestName?: string; config: InvitationConfig;
}) {
  const [status, setStatus] = useState<'HADIR' | 'TIDAK_HADIR' | null>(null);
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const variants = getAnimationVariants(config.animation);

  // ── RSVP Deadline check ──
  const isExpired = config.rsvpDeadline ? new Date() > new Date(config.rsvpDeadline) : false;

  const handleSubmit = async () => {
    if (!status || !rsvpToken || !onRSVP || isExpired) return;
    setLoading(true);
    try {
      await onRSVP({
        rsvp_token: rsvpToken,
        rsvp_status: status,
        actual_pax: status === 'HADIR' ? pax : 0,
        message,
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch {}
    setLoading(false);
  };

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} px-6 text-center`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Konfirmasi Kehadiran</h2>
      <p className="text-sm mb-8 opacity-70" style={{ fontFamily: 'var(--font-body)' }}>Mohon konfirmasi kehadiran Anda</p>
      <div className="max-w-md mx-auto">
        {/* Expired state */}
        {isExpired ? (
          <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <X className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: 'var(--color-primary)' }} />
            <p className="font-semibold text-lg" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>RSVP Sudah Ditutup</p>
            <p className="text-sm mt-2 opacity-70" style={{ fontFamily: 'var(--font-body)' }}>
              Batas konfirmasi kehadiran adalah {format(new Date(config.rsvpDeadline!), "d MMMM yyyy", { locale: idLocale })}.
            </p>
          </div>
        ) : submitted ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <Check className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
            <p className="font-semibold text-lg" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Terima Kasih!</p>
            <p className="text-sm mt-2 opacity-70" style={{ fontFamily: 'var(--font-body)' }}>Konfirmasi Anda telah tersimpan.</p>
          </motion.div>
        ) : (
          <div className="rounded-2xl p-6 shadow-lg space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            {guestName && <p className="font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Halo, {guestName}!</p>}
            {config.rsvpDeadline && (
              <p className="text-xs opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
                Batas RSVP: {format(new Date(config.rsvpDeadline), "d MMMM yyyy", { locale: idLocale })}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => setStatus('HADIR')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${status === 'HADIR' ? 'text-white shadow-md' : 'border opacity-70 hover:opacity-100'}`}
                style={status === 'HADIR' ? { backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' } : { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
                <Check className="w-4 h-4 inline mr-1" /> Hadir
              </button>
              <button onClick={() => setStatus('TIDAK_HADIR')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${status === 'TIDAK_HADIR' ? 'text-white shadow-md' : 'border opacity-70 hover:opacity-100'}`}
                style={status === 'TIDAK_HADIR' ? { backgroundColor: '#888', fontFamily: 'var(--font-body)' } : { borderColor: '#888', color: '#888', fontFamily: 'var(--font-body)' }}>
                <X className="w-4 h-4 inline mr-1" /> Tidak Hadir
              </button>
            </div>
            {status === 'HADIR' && (
              <div>
                <label className="text-sm text-left block mb-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Jumlah Tamu</label>
                <select value={pax} onChange={e => setPax(Number(e.target.value))}
                  className="w-full rounded-xl border p-2.5 text-sm" style={{ borderColor: 'var(--color-accent)' }}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} orang</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm text-left block mb-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Ucapan (opsional)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Tulis ucapan untuk pengantin..."
                className="w-full rounded-xl border p-3 text-sm resize-none" style={{ borderColor: 'var(--color-accent)' }} />
            </div>
            <div>
              <label className="text-sm text-left block mb-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Catatan Khusus (opsional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Contoh: Alergi kacang, kursi roda, dll."
                className="w-full rounded-xl border p-3 text-sm resize-none" style={{ borderColor: 'var(--color-accent)' }} />
            </div>
            <button onClick={handleSubmit} disabled={!status || !rsvpToken || loading}
              className="w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
              {loading ? 'Mengirim...' : 'Kirim Konfirmasi'}
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}

// ── Section: Wishes (UPGRADED — Tugas 7) ─────────────────────────
export function WishesSection({ publicSlug, config, wishes, onSubmitWish, isLoadingWishes }: {
  publicSlug?: string;
  config: InvitationConfig;
  wishes?: WishItem[];
  onSubmitWish?: (name: string, message: string) => Promise<void>;
  isLoadingWishes?: boolean;
}) {
  if (config.enableWishes === false) return null;

  const variants = getAnimationVariants(config.animation);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const displayedWishes = showAll ? (wishes || []) : (wishes || []).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitWish || !name.trim() || !message.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmitWish(name.trim(), message.trim());
      setSubmitted(true);
      setName('');
      setMessage('');
      setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} px-6`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
        Ucapan &amp; Doa
      </h2>
      <p className="text-sm opacity-70 max-w-md mx-auto text-center mb-8" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
        Sampaikan doa dan ucapan terbaik untuk kedua mempelai
      </p>

      <div className="max-w-xl mx-auto">
        {/* ── Wish List ── */}
        {isLoadingWishes ? (
          <div className="flex items-center justify-center gap-2 py-8 opacity-60">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Memuat ucapan...</span>
          </div>
        ) : displayedWishes.length > 0 ? (
          <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-1">
            {displayedWishes.map(wish => (
              <motion.div key={wish.id}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
                    style={{ backgroundColor: 'var(--color-accent)' }}>
                    {wish.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                        {wish.guestName}
                      </p>
                      <span className="text-xs opacity-50 shrink-0" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
                        {formatDistanceToNow(new Date(wish.createdAt), { addSuffix: true, locale: idLocale })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 opacity-80 leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
                      {wish.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 opacity-50 mb-6">
            <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Belum ada ucapan. Jadilah yang pertama!</p>
          </div>
        )}

        {/* Show more button */}
        {!showAll && (wishes || []).length > 5 && (
          <button onClick={() => setShowAll(true)}
            className="w-full py-2 text-sm font-medium rounded-xl mb-6 transition-opacity hover:opacity-80"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-accent)' }}>
            Lihat {(wishes || []).length - 5} ucapan lainnya
          </button>
        )}

        {/* ── Submit Form ── */}
        {!showForm && !submitted ? (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
            <Send className="w-4 h-4" /> Tulis Ucapan
          </button>
        ) : submitted ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <Check className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
            <p className="font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Terima Kasih!</p>
            <p className="text-sm mt-1 opacity-70" style={{ fontFamily: 'var(--font-body)' }}>Ucapan Anda telah terkirim.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <div>
              <label className="text-sm text-left block mb-1 font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Nama</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Nama Anda"
                className="w-full rounded-xl border p-2.5 text-sm focus:outline-none" style={{ borderColor: 'var(--color-accent)' }} />
            </div>
            <div>
              <label className="text-sm text-left block mb-1 font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>Ucapan &amp; Doa</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} required placeholder="Tulis ucapan dan doa terbaik Anda..."
                className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none" style={{ borderColor: 'var(--color-accent)' }} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
                Batal
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.section>
  );
}

// ── Section: Gift (BARU — Tugas 8) ───────────────────────────────
export function GiftSection({ data, config }: { data: BaseTemplateProps['weddingData']; config: InvitationConfig }) {
  const hasBankAccounts = data.bankAccounts && data.bankAccounts.length > 0;
  const hasQris = !!data.qrisImageUrl;
  if (!hasBankAccounts && !hasQris) return null;
  if (config.enableGift === false) return null;

  const variants = getAnimationVariants(config.animation);
  const [activeTab, setActiveTab] = useState<'transfer' | 'qris'>(hasBankAccounts ? 'transfer' : 'qris');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      className={`${getSpacingClass(config.spacing)} px-6`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="text-center mb-8">
        <Gift className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
          Amplop Digital
        </h2>
        <p className="text-sm opacity-70 max-w-md mx-auto" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
          Doa dan restu Anda sudah cukup. Namun jika ingin memberi tanda kasih, bisa melalui:
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Tab toggle (only if both available) */}
        {hasBankAccounts && hasQris && (
          <div className="flex rounded-xl overflow-hidden mb-6 border" style={{ borderColor: 'var(--color-accent)' }}>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${activeTab === 'transfer' ? 'text-white' : 'opacity-70'}`}
              style={activeTab === 'transfer'
                ? { backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' }
                : { color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }
              }>
              Transfer Bank
            </button>
            <button
              onClick={() => setActiveTab('qris')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${activeTab === 'qris' ? 'text-white' : 'opacity-70'}`}
              style={activeTab === 'qris'
                ? { backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-body)' }
                : { color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }
              }>
              QRIS
            </button>
          </div>
        )}

        {/* Transfer tab */}
        {activeTab === 'transfer' && hasBankAccounts && (
          <div className="space-y-4">
            {data.bankAccounts!.map(account => (
              <motion.div key={account.id}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rounded-2xl p-5 shadow-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: 'var(--color-accent)' }}>
                <div className="flex items-center gap-3 mb-3">
                  {account.logoUrl ? (
                    <img src={account.logoUrl} alt={account.bankName} className="w-10 h-6 object-contain" />
                  ) : (
                    <span className="text-sm font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>
                      {account.bankName}
                    </span>
                  )}
                  <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                    {account.bankName}
                  </span>
                </div>
                <p className="text-lg font-mono font-bold tracking-wider mb-1" style={{ color: 'var(--color-primary)' }}>
                  {account.accountNumber}
                </p>
                <p className="text-sm opacity-70 mb-3" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
                  a.n. {account.accountName}
                </p>
                <button
                  onClick={() => copyToClipboard(account.accountNumber, account.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={
                    copiedId === account.id
                      ? { backgroundColor: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)' }
                      : { border: '1px solid', borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }
                  }>
                  {copiedId === account.id ? (
                    <><CheckCheck className="w-4 h-4" /> Tersalin ✓</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Salin Nomor Rekening</>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* QRIS tab */}
        {activeTab === 'qris' && hasQris && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-5 shadow-sm text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: 'var(--color-accent)' }}>
            <p className="text-sm font-medium mb-4" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              Scan kode QRIS di bawah ini
            </p>
            <div className="mx-auto w-56 h-56 rounded-xl overflow-hidden shadow-md">
              <img src={data.qrisImageUrl!} alt="QRIS" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs opacity-50 mt-3" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
              Gunakan aplikasi e-wallet atau mobile banking untuk scan
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

// ── Music Player ─────────────────────────────────────────────────
export function MusicPlayer({ musicUrl, autoplay }: { musicUrl: string; autoplay?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (autoplay && audioRef.current) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [autoplay]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio ref={audioRef} src={musicUrl} loop />
      <button onClick={toggle}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
        style={{ backgroundColor: 'var(--color-primary)' }}>
        {playing ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>
    </div>
  );
}

// ── HOC: withBaseTemplate (UPGRADED — Tugas 9) ──────────────────
export function withBaseTemplate<P extends BaseTemplateProps>(
  TemplateComponent: React.ComponentType<P>
) {
  return function WrappedTemplate(props: P) {
    const { config, musicUrl, musicAutoplay, isPreview, weddingData, guestName } = props;

    // ── Opening state ──
    const hasOpening = !!config.openingStyle && config.openingStyle !== 'none';
    const [opened, setOpened] = useState(!hasOpening || isPreview === true);

    const handleOpen = useCallback(() => {
      setOpened(true);
    }, []);

    // ── Load Google Fonts ──
    useEffect(() => {
      if (isPreview) return;
      const fonts = [config.fontHeading, config.fontBody].filter(Boolean);
      if (fonts.length === 0) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }, [config.fontHeading, config.fontBody, isPreview]);

    return (
      <div
        style={{
          '--color-primary': config.colorPrimary,
          '--color-accent': config.colorAccent,
          '--color-bg': config.colorBg,
          '--font-heading': `'${config.fontHeading}', serif`,
          '--font-body': `'${config.fontBody}', sans-serif`,
        } as React.CSSProperties}
        className="min-h-screen"
      >
        {/* Opening overlay */}
        <AnimatePresence>
          {!opened && (
            <OpeningSection
              data={weddingData}
              config={config}
              guestName={guestName}
              onOpen={handleOpen}
            />
          )}
        </AnimatePresence>

        {/* Music player — only start after opening is dismissed */}
        {musicUrl && !isPreview && opened && (
          <MusicPlayer musicUrl={musicUrl} autoplay={musicAutoplay} />
        )}

        {/* Main template content */}
        <TemplateComponent {...props} />
      </div>
    );
  };
}

// ── Shared Section Renderer (agar semua template otomatis mendapat section baru) ──
export function createSectionRenderer(props: BaseTemplateProps) {
  const { weddingData, config, photos, guestName, onRSVP, rsvpToken, publicSlug, wishes, onSubmitWish, isLoadingWishes } = props;

  return function renderSection(key: SectionKey) {
    switch (key) {
      case 'hero':
        return <HeroSection key={key} data={weddingData} config={config} photos={photos} guestName={guestName} />;
      case 'countdown':
        return weddingData.weddingDate
          ? <CountdownSection key={key} weddingDate={weddingData.weddingDate} config={config} />
          : null;
      case 'couple':
        return <CoupleSection key={key} data={weddingData} config={config} photos={photos} />;
      case 'love_story':
        return <LoveStorySection key={key} data={weddingData} config={config} />;
      case 'event':
        return <EventSection key={key} data={weddingData} config={config} />;
      case 'gallery':
        return <GallerySection key={key} photos={photos} config={config} />;
      case 'map':
        return <MapSection key={key} data={weddingData} config={config} />;
      case 'rsvp':
        return <RSVPSection key={key} onRSVP={onRSVP} rsvpToken={rsvpToken} guestName={guestName} config={config} />;
      case 'wishes':
        return <WishesSection key={key} publicSlug={publicSlug} config={config} wishes={wishes} onSubmitWish={onSubmitWish} isLoadingWishes={isLoadingWishes} />;
      case 'gift':
        return <GiftSection key={key} data={weddingData} config={config} />;
      default:
        return null;
    }
  };
}
