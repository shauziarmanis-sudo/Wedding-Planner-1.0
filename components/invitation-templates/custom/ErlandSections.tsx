import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BaseTemplateProps, InvitationConfig, InvitationPhoto } from "@/types/invitation.types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Helper for animations
const fadeRight = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.5 } }
};

const fadeLeft = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.5 } }
};

const flipLeft = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: { opacity: 1, rotateY: 0, transition: { duration: 1.5 } }
};

interface SectionProps {
  data: BaseTemplateProps['weddingData'];
  config: InvitationConfig;
  photos: InvitationPhoto[];
  guestName?: string;
  onRSVP?: (data: any) => Promise<void>;
  rsvpToken?: string;
}

export function HeroSection({ data, config, photos }: SectionProps) {
  const bgPhoto = photos.find(p => p.type === 'prewedding')?.url || photos.find(p => p.type === 'couple')?.url;
  const couplePhoto = photos.find(p => p.type === 'couple')?.url;

  return (
    <section id="beranda" className="bg-[color:var(--color-bg)] relative overflow-hidden p-0 m-0 w-full min-h-screen flex flex-col justify-center">
      {bgPhoto && (
        <img 
          src={bgPhoto} 
          alt="background" 
          className="absolute opacity-25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
        />
      )}
      <div className="relative text-center p-2 z-10">
        <h1 className="my-4 pt-2 font-medium text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem' }}>
          The Wedding of
        </h1>
        {couplePhoto && (
          <img 
            src={couplePhoto} 
            alt="couple" 
            className="rounded-full border-[3px] shadow my-4 mx-auto"
            style={{ width: '200px', height: '200px', objectFit: 'cover', borderColor: 'var(--color-bg)' }} 
          />
        )}
        <h2 className="my-4 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem' }}>
          {data.groomName} &amp; {data.brideName}
        </h2>
        {data.weddingDate && (
          <p className="my-2 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem' }}>
            {format(new Date(data.weddingDate), "EEEE, d MMMM yyyy", { locale: idLocale })}
          </p>
        )}
        
        <button id="addToCalendar" className="btn btn-sm shadow rounded-full px-4 py-2 mt-3 text-[color:var(--color-bg)] bg-[color:var(--color-primary)] border border-[color:var(--color-primary)] hover:opacity-90 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M17,10.039c-3.859,0-7,3.14-7,7,0,3.838,3.141,6.961,7,6.961s7-3.14,7-7c0-3.838-3.141-6.961-7-6.961Zm0,11.961c-2.757,0-5-2.226-5-4.961,0-2.757,2.243-5,5-5s5,2.226,5,4.961c0,2.757-2.243,5-5,5Zm1.707-4.707c.391,.391,.391,1.023,0,1.414-.195,.195-.451,.293-.707,.293s-.512-.098-.707-.293l-1-1c-.188-.188-.293-.442-.293-.707v-2c0-.552,.447-1,1-1s1,.448,1,1v1.586l.707,.707Zm5.293-10.293v2c0,.552-.447,1-1,1s-1-.448-1-1v-2c0-1.654-1.346-3-3-3H5c-1.654,0-3,1.346-3,3v1H11c.552,0,1,.448,1,1s-.448,1-1,1H2v9c0,1.654,1.346,3,3,3h4c.552,0,1,.448,1,1s-.448,1-1,1H5c-2.757,0-5-2.243-5-5V7C0,4.243,2.243,2,5,2h1V1c0-.552,.448-1,1-1s1,.448,1,1v1h8V1c0-.552,.447-1,1-1s1,.448,1,1v1h1c2.757,0,5,2.243,5,5Z"/>
          </svg> 
          Tandai di Kalender
        </button>
        
        <div className="flex justify-center items-center mt-8 mb-2">
          <div className="border-2 border-[color:var(--color-accent)] rounded-full px-2 py-1 h-12 w-8 flex justify-center">
            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-3 rounded-full bg-[color:var(--color-accent)] mt-1"
            />
          </div>
        </div>
        <p className="m-0 p-0 text-[color:var(--color-primary)] opacity-70" style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>
          Gulir ke Bawah
        </p>
      </div>

      {/* Wave Separator */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto mt-auto" style={{ fill: 'var(--color-bg)' }}>
        <path fill="currentColor" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,96C960,96,1056,160,1152,154.7C1248,149,1344,75,1392,37.3L1440,0L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </section>
  );
}

export function CoupleSection({ data, config, photos }: SectionProps) {
  const groomPhoto = photos.find(p => p.type === 'groom')?.url || 'https://via.placeholder.com/200';
  const bridePhoto = photos.find(p => p.type === 'bride')?.url || 'https://via.placeholder.com/200';

  return (
    <section className="bg-[color:var(--color-bg)] text-center w-full relative" id="mempelai">
      <h2 className="py-4 m-0 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</h2>
      <h2 className="py-4 m-0 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '5px 10px' }}>
        Assalamualaikum warahmatullahi wabarakatuh
      </h2>
      <p className="pb-4 px-4 m-0 text-[color:var(--color-primary)] max-w-lg mx-auto" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
        Tanpa mengurangi rasa hormat, dengan ini kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami. 
      </p>

      {/* Love animation SVG overlay (Right) */}
      <div className="absolute" style={{ top: '10%', right: '5%', zIndex: 0 }}>
        <motion.svg animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="var(--color-accent)" viewBox="0 0 16 16">
          <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
        </motion.svg>
      </div>

      <div className="overflow-x-hidden pb-4 px-4 relative z-10">
        {/* Bride */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight} className="pb-1">
          <img 
            src={bridePhoto} 
            alt="bride profile" 
            className="rounded-full border-[3px] shadow my-4 mx-auto"
            style={{ width: '180px', height: '180px', objectFit: 'cover', borderColor: 'var(--color-bg)' }} 
          />
          <h2 className="m-0 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.125rem' }}>
            {data.brideName}
          </h2>
          <p className="mt-3 mb-1 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem' }}>Putri dari</p>
          <p className="mb-0 text-[color:var(--color-primary)] opacity-80" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
            Bapak {data.brideFather || 'Nama Ayah'}<br/>&amp;<br/>Ibu {data.brideMother || 'Nama Ibu'}
          </p>
        </motion.div>

        {/* Love animation SVG overlay (Left) */}
        <div className="absolute" style={{ top: '40%', left: '5%', zIndex: 0 }}>
          <motion.svg animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 2.5 }} xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="var(--color-accent)" viewBox="0 0 16 16">
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
          </motion.svg>
        </div>

        {/* Rings icon */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={flipLeft} className="pb-1 flex justify-center relative z-10">
          <svg fill="var(--color-accent)" style={{ margin: '20px 0px 15px', fillRule: 'evenodd', clipRule: 'evenodd' }} width="102px" height="60px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1850 1080">
            <path d="M1845.79 460.63c-12.15,-109.16 -66.48,-200.18 -142.59,-271.61 -88.82,-83.35 -207.35,-139.94 -322.6,-167.3 -132.5,-31.45 -263.89,-27.64 -376.46,4.29 -115.98,32.88 -212.24,95.71 -269.73,180.77 -15.99,23.66 -29.61,54.23 -40.67,88.57 -20.82,3.99 -40.66,8.23 -59.25,12.56 -22.67,5.3 -44.04,10.84 -63.54,16.32 -7.9,2.22 -15.78,4.52 -23.56,6.86 -109.87,33.02 -262.47,93.34 -378.24,180.24 -118.77,89.12 -199.05,205.99 -158.53,350.38l1.53 5.24c35.84,119.48 132.65,178.01 249.77,200.98 168.74,33.12 380.39,-8.52 506.91,-45.79l4.91 -1.43c52.56,-15.7 116.44,-38.2 181.7,-67.34 25.99,13.2 53.25,25.14 81.65,35.53 28.94,10.6 58.95,19.66 89.86,27 117.38,27.86 233.88,28.06 337.19,5.56 107.1,-23.34 200.22,-71.17 265.81,-138.02 48.34,-49.29 80.34,-113.14 99.04,-181.94 21.32,-78.48 25.4,-163.65 16.8,-240.87zm-1478.85 198.82l0 0c76.36,-42.25 163.88,-78.77 259.11,-106.33 7.33,-2.11 15.89,-4.48 25.57,-7.09 3.01,-0.79 5.87,-1.55 8.75,-2.3 1.39,40.64 6.5,77.96 15.7,107.76 5.5,17.83 12.47,35.54 20.8,52.98 5.69,11.95 12.16,23.54 18.98,34.98 -10.94,3.4 -21.93,6.8 -33.12,10.03 -108.07,31.27 -211.9,49.17 -301.4,54.2 -78.2,4.39 -145.02,-1 -193.66,-15.86 48.34,-45.85 108.98,-89.5 179.27,-128.37zm379.15 70.16l0 0c-7.93,-12.78 -15.04,-25.64 -21.21,-38.56 -7.6,-15.91 -13.99,-32.18 -19.09,-48.7 -16.61,-53.79 -18.76,-135.19 -8.75,-215.17 2.71,33.01 9.6,65.19 21.11,96.2 23.11,62.29 64.08,119.96 122.01,171.32 -29.93,12.33 -61.4,23.98 -94.07,34.91zm18.76 261.25l0 0 -4.79 1.42c-123.35,36.35 -329.3,77.03 -492.17,45.07 -21.51,-4.22 -42.19,-9.8 -61.85,-16.77l-51.53 -109.56c-1.05,-2.26 -3.75,-3.24 -6.03,-2.17 -2.25,1.07 -3.23,3.78 -2.16,6.05l47.57 101.19c-14.05,-5.56 -27.44,-11.98 -40.14,-19.2l-65.77 -126.53c-1.16,-2.23 -3.91,-3.1 -6.13,-1.95 -2.22,1.17 -3.09,3.91 -1.94,6.14l58.84 113.17c-44.96,-29.51 -79.3,-71.45 -96.77,-129.66l-1.39 -4.76c-4.15,-14.75 -6.76,-29.18 -8.13,-43.32 10.98,13.8 25.62,25.58 42.65,35.56 25.78,15.07 57.16,25.95 89.31,33.61l55.53 120.76c1.05,2.28 3.75,3.29 6.02,2.23 2.28,-1.04 3.27,-3.75 2.23,-6.02l-52.63 -114.45c9.5,2.02 19,3.85 28.41,5.35 33,5.27 64.85,7.44 90.13,7.44 63.86,0 131.81,-7.14 196.49,-17.66 84.89,-13.8 164.31,-33.4 221.56,-50.23 33.92,-9.97 74.39,-23.38 117.7,-39.76 21.12,-7.98 42.97,-16.76 65.03,-26.11l31.37 133.05c0.56,2.45 3.01,3.98 5.45,3.4 2.43,-0.56 3.95,-3.01 3.39,-5.46l-31.74 -134.63c13.87,-5.99 27.81,-12.13 41.74,-18.59 4.88,-2.25 7.01,-8.03 4.76,-12.91 -2.25,-4.88 -8.02,-7.02 -12.9,-4.76 -38.58,17.93 -77.34,33.96 -113.95,47.82 -42.84,16.19 -82.83,29.44 -116.34,39.3 -56.66,16.64 -135.23,36.04 -219.18,49.69 -63.86,10.38 -130.78,17.43 -193.38,17.43 -24.35,0 -55.1,-2.1 -87.07,-7.21 -42.98,-6.86 -88,-19.17 -122.11,-39.12 -26.61,-15.58 -46.34,-35.86 -52.55,-61.88 8.59,-90.67 71.66,-167.8 155.39,-230.63 112.18,-84.2 261.08,-142.97 368.51,-175.26 8.23,-2.48 15.93,-4.72 23.07,-6.72 18.85,-5.31 39.71,-10.72 62.21,-15.96 13.7,-3.2 27.95,-6.23 42.37,-9.17 -2.17,8.38 -4.16,16.93 -6.05,25.58 -14.89,3.28 -29.82,6.71 -44.78,10.46 -18.57,4.65 -37.56,9.77 -56.91,15.38 -96.3,27.84 -184.25,62.79 -258.29,100.85 -77.01,39.6 -139.08,82.65 -179.97,124.7 -2.49,2.57 -2.44,6.67 0.14,9.17 2.56,2.48 6.65,2.44 9.15,-0.12 39.94,-41.1 100.83,-83.28 176.57,-122.22 73.32,-37.69 160.5,-72.32 256,-99.94 18.73,-5.41 37.57,-10.51 56.46,-15.22 13.1,-3.28 25.98,-6.27 38.76,-9.15 -3.26,16.53 -6.04,33.37 -8.26,50.29 -4.07,31.07 -6.32,62.49 -6.7,92.78 -5.65,1.44 -11.2,2.87 -16.47,4.28 -7.5,2.03 -16.23,4.46 -26.18,7.33 -97.64,28.26 -187.3,65.67 -265.44,108.88 -57.42,31.76 -108.55,66.77 -152.4,103.61l-33.5 -102.05c-0.78,-2.38 -3.34,-3.69 -5.73,-2.91 -2.37,0.78 -3.68,3.33 -2.91,5.73l34.65 105.47c-4.43,3.81 -8.63,7.69 -12.9,11.54l-36.6 -107.74c-0.82,-2.37 -3.39,-3.64 -5.75,-2.84 -2.38,0.81 -3.66,3.39 -2.85,5.76l37.86 111.43c-7.6,7.06 -14.94,14.16 -21.97,21.32 -11.28,-5.73 -20.87,-12.16 -28.51,-19.33 -9.72,-9.1 -16.43,-19.43 -19.75,-30.94 -2.46,-8.54 -3,-17.54 -1.73,-26.92 1.35,-9.84 4.71,-20.13 9.93,-30.74 2.38,-4.81 0.4,-10.64 -4.42,-13.03 -4.81,-2.37 -10.62,-0.38 -13.02,4.43 -6.14,12.47 -10.11,24.76 -11.75,36.76 -1.63,12 -0.9,23.68 2.35,34.91 4.32,14.93 12.85,28.18 25.14,39.69 9.99,9.38 22.54,17.49 37.14,24.48 0.76,1.61 1.78,3.14 3.11,4.44 1.67,1.62 3.58,2.79 5.63,3.51 53.86,22.51 133.95,31.39 229.05,26.04 91.65,-5.14 197.86,-23.45 308.35,-55.42 109.88,-31.78 209.06,-72.8 289.31,-117.24 83.72,-46.37 147.22,-96.76 181.4,-144.75 2.47,-3.48 3.3,-7.63 2.66,-11.53 8.52,-13.54 14.73,-26.89 18.2,-39.9 4.4,-16.49 4.61,-32.45 0.23,-47.61 -2.17,-7.51 -5.43,-14.61 -9.7,-21.3 -4.29,-6.74 -9.57,-13 -15.76,-18.73 -3.92,-3.65 -10.09,-3.44 -13.73,0.49 -3.66,3.93 -3.44,10.09 0.48,13.75 5.06,4.71 9.31,9.7 12.65,14.92 3.27,5.11 5.75,10.54 7.41,16.28 3.36,11.59 3.12,24.07 -0.37,37.17 -2.74,10.22 -7.49,20.81 -13.99,31.65 -15.2,-3.66 -30.96,-6.8 -47.19,-9.5l-34.41 -113.35c-0.72,-2.4 -3.26,-3.75 -5.66,-3.02 -2.39,0.73 -3.74,3.26 -3.01,5.66l33.11 109.1c-38.08,-5.79 -78.73,-9.01 -121.42,-9.46 -60.79,-0.65 -125.57,4.32 -192.5,15.02 -7.85,-24.66 -12.81,-49.89 -14.55,-75.4 11.17,-23.79 25.59,-45.87 42.63,-66.2 58.55,-7.31 112.9,-9.94 160.8,-7.9 17.38,0.75 33.82,2.15 49.39,4.1 13.97,49.14 22.9,75.91 28.56,89.99 -1.53,-13.89 -6.07,-42.22 -18.85,-88.68 26.6,3.86 50.25,9.53 70.26,17.06 3.35,1.27 7.08,-0.43 8.35,-3.78 1.25,-3.36 -0.44,-7.09 -3.78,-8.36 -35.08,-13.2 -80.49,-21.01 -133.42,-23.27 -44.6,-1.92 -94.62,0.16 -148.29,6.22 8.22,-8.71 16.98,-17.04 26.22,-24.99 103.82,-8.12 210.76,-2.14 294.04,34 40.87,17.76 76.09,42.96 102.42,77.53 6.63,20.48 3.08,42.84 -7.19,65.46 -13.53,29.83 -38.3,60.1 -66.15,87.37 -35.8,35.03 -76.34,64.83 -105.06,82.64 -4.56,2.82 -5.97,8.8 -3.15,13.37 2.82,4.57 8.79,5.97 13.37,3.17 29.78,-18.5 71.71,-49.27 108.46,-85.24 29.34,-28.72 55.58,-60.95 70.26,-93.31 5.8,-12.75 9.78,-25.51 11.53,-38.08 6.24,12.41 11.54,25.77 15.83,40.12l0.29 1c26.97,91.65 -1.51,171.76 -58.59,239.89l-23.44 -138.22c-0.41,-2.47 -2.76,-4.14 -5.23,-3.72 -2.48,0.39 -4.14,2.74 -3.73,5.22l24.72 145.64c-8.27,9.3 -17.05,18.37 -26.3,27.21l-29.98 -135.7c-0.56,-2.44 -2.97,-3.97 -5.41,-3.43 -2.44,0.52 -3.99,2.95 -3.45,5.39l31.16 140.95c-14.8,13.57 -30.63,26.6 -47.27,39.03 -66.18,49.45 -144.71,89.87 -219.44,121.26l-35.68 -139.7c-0.61,-2.43 -3.08,-3.9 -5.53,-3.29 -2.41,0.63 -3.89,3.1 -3.28,5.53l36 140.99c-50.67,20.88 -99.32,37.61 -140.76,50zm41.54 -440.63l0 0c-6.1,-10.96 -11.55,-22.13 -16.37,-33.47 63.24,-9.8 124.22,-14.32 181.32,-13.71 53.95,0.58 104.58,5.67 150.51,15.04 -33.81,38.69 -87.68,78.91 -156.13,116.83 -19.26,10.66 -39.66,21.13 -61.06,31.3 -41.64,-34.29 -74.74,-73.62 -98.27,-115.99zm952.51 -165.51l0 0c21.27,57.52 25.38,118.01 8.81,177.17 -5.02,-31.64 -15.01,-62.8 -29.39,-92.94l20.58 -84.23zm-18.84 210.45l0 0c-37.96,82.09 -116.47,144.94 -216.32,180.81 -93.58,33.61 -205.71,43.36 -320.97,23.23 91.16,-83.85 145.09,-188.55 108.12,-314.18l-0.31 -1.11c-25.63,-86.01 -83.46,-140.36 -157.84,-172.66 -75.56,-32.79 -167.98,-42.35 -260.5,-39.26 28.09,-17.73 59.09,-32.67 92.5,-44.44 102.6,-36.16 226.94,-42.97 353.76,-12.87 115.98,27.52 214.3,81.43 284.75,149.33 70.05,67.51 112.42,148.73 116.81,231.15zm58.85 98.16l0 0c-17.4,64.06 -46.88,123.18 -91.12,168.3 -61.28,62.47 -148.96,107.29 -250.24,129.35 -98.21,21.41 -209.04,21.3 -320.95,-4.89 9.56,-34.93 33.07,-108.75 33.15,-109.02 0.74,-2.39 -0.6,-4.94 -2.99,-5.68 -2.39,-0.75 -4.95,0.57 -5.69,2.98 -0.08,0.26 -23.47,73.68 -33.24,109.59 -27.83,-6.84 -54.61,-14.96 -80.14,-24.3 -19.3,-7.07 -37.93,-14.86 -55.92,-23.2 46.59,-22.52 92.92,-48.38 135.5,-77.62 20.76,5.08 41.92,9.49 63.43,12.93l-20.01 87.18c-0.55,2.45 0.98,4.88 3.42,5.45 2.44,0.55 4.87,-0.96 5.42,-3.42l20.19 -87.98c69.42,10.28 141.73,11.84 212.23,2.58 89.42,-11.75 175.9,-40.65 249.66,-90.33 2.97,-2 3.75,-6.02 1.77,-8.99 -1.98,-2.98 -6.02,-3.78 -8.98,-1.77 -72.01,48.51 -156.58,76.74 -244.11,88.24 -69.1,9.07 -139.99,7.57 -208.06,-2.45 -0.33,-1.71 -1.63,-3.15 -3.43,-3.56 -2.07,-0.49 -4.06,0.59 -4.99,2.41 -17.74,-2.81 -35.2,-6.34 -52.46,-10.3 3.61,-2.59 7.28,-5.13 10.81,-7.78 6.96,-5.2 13.8,-10.51 20.48,-15.91 129.17,27.13 256.31,17.88 361.56,-19.91 108.85,-39.09 194.49,-108.72 235.52,-200.21 1.1,-2.24 1.67,-4.77 1.58,-7.43 -0.08,-1.63 -0.25,-3.27 -0.34,-4.89 0.8,-2.07 1.74,-4.11 2.49,-6.19 2.39,-6.55 4.54,-13.12 6.42,-19.7 17.86,-62.54 13.54,-126.5 -9.04,-187.21 -2.02,-5.44 -4.4,-10.83 -6.71,-16.23l1.43 -5.87c0.59,-2.42 -0.92,-4.88 -3.36,-5.47 -1.03,-0.24 -2.05,-0.05 -2.95,0.37 -4,-8.51 -8.41,-16.94 -13.11,-25.27 0.3,-2.09 -0.87,-4.08 -2.84,-4.83 -24.14,-41.33 -56.7,-80.29 -96.7,-115.05 -2.7,-2.35 -6.8,-2.04 -9.13,0.67 -2.34,2.7 -2.06,6.79 0.65,9.13 40.57,35.25 73.31,74.86 96.97,116.84l-19.6 74.88c-0.62,2.42 0.83,4.9 3.25,5.53 2.41,0.63 4.89,-0.83 5.52,-3.26l17.14 -65.46c4.25,8.21 8.12,16.5 11.66,24.87l-20.99 85.94c-21.35,-40.86 -50.79,-79.65 -87.27,-114.8 -74.33,-71.64 -177.63,-128.43 -299.11,-157.25 -132.71,-31.5 -263.24,-24.22 -371.29,13.86 -50.29,17.72 -95.68,42.2 -134.32,72.5 4.97,-34.82 17.27,-82.25 17.32,-82.44 0.61,-2.43 -0.86,-4.91 -3.29,-5.53 -2.44,-0.62 -4.9,0.86 -5.51,3.3 -0.06,0.18 -14.69,56.62 -18.65,92.77 -33.17,27.78 -60.73,60.21 -81.49,96.59 0.22,-2.95 0.24,-5.9 0.57,-8.85 1.64,-15.29 4.62,-30.61 8.98,-45.86 18.52,-64.82 59.35,-120.05 115.67,-162.79 2.59,-1.97 5.39,-3.77 8.04,-5.68l-18.56 74.33c-0.61,2.43 0.87,4.91 3.31,5.52 2.43,0.61 4.89,-0.88 5.5,-3.31l21.13 -84.56c55.32,-37.04 123.22,-63.2 198.47,-76.03 3.53,-0.58 5.91,-3.93 5.32,-7.46 -0.58,-3.53 -3.92,-5.92 -7.46,-5.33 -72.9,12.42 -139.13,37.2 -194.25,72.1 -0.58,-0.66 -1.31,-1.21 -2.23,-1.44 -2.43,-0.61 -4.91,0.87 -5.51,3.3l-0.92 3.68c-7.06,4.7 -13.99,9.51 -20.65,14.57 -58.54,44.44 -101.03,101.95 -120.33,169.54 -4.54,15.9 -7.66,31.95 -9.41,48.05 -1.33,12.39 -1.85,24.81 -1.58,37.18 -0.95,2.17 -1.44,4.59 -1.3,7.12 3.04,53.88 18.7,106.77 45.98,155.87 23.18,41.72 54.8,80.68 94.19,115.19 -6.55,2.9 -13.3,5.73 -20,8.58 -58.81,-50.98 -100.16,-108.29 -123.13,-170.26 -20.62,-55.62 -26.48,-115.06 -17.56,-176.9 11.61,-46.65 27.61,-88.31 47.51,-117.75 53.3,-78.85 143.37,-137.32 252.31,-168.22 107.68,-30.54 233.62,-34.11 360.87,-3.91 110.52,26.22 223.88,80.24 308.47,159.62 71.05,66.68 121.73,151.3 132.99,252.35 8.18,73.58 4.31,154.66 -15.96,229.29z" />
          </svg>
        </motion.div>

        {/* Groom */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="pb-1 relative z-10">
          <img 
            src={groomPhoto} 
            alt="groom profile" 
            className="rounded-full border-[3px] shadow my-4 mx-auto"
            style={{ width: '180px', height: '180px', objectFit: 'cover', borderColor: 'var(--color-bg)' }} 
          />
          <h2 className="m-0 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.125rem' }}>
            {data.groomName}
          </h2>
          <p className="mt-3 mb-1 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem' }}>Putra dari</p>
          <p className="mb-0 text-[color:var(--color-primary)] opacity-80" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
            Bapak {data.groomFather || 'Nama Ayah'}<br/>&amp;<br/>Ibu {data.groomMother || 'Nama Ibu'}
          </p>
        </motion.div>

        {/* Love animation SVG overlay (Right) */}
        <div className="absolute" style={{ top: '80%', right: '5%', zIndex: 0 }}>
          <motion.svg animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="var(--color-accent)" viewBox="0 0 16 16">
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
          </motion.svg>
        </div>
      </div>
    </section>
  );
}

export function EventSection({ data, config, photos }: SectionProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!data.weddingDate) return;
    const targetDate = new Date(data.weddingDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data.weddingDate]);

  return (
    <section className="bg-[color:var(--color-bg)] pb-10" id="waktu">
      <div className="container mx-auto text-center px-4">
        <h2 className="py-4 m-0 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem' }}>
          Detail Acara
        </h2>
        
        {/* Countdown */}
        <div className="border border-[color:var(--color-primary)] rounded-full shadow py-3 px-4 mt-2 mb-8 max-w-lg mx-auto">
          <div className="flex justify-center gap-4 text-[color:var(--color-primary)] font-bold">
            <div className="text-center">
              <span className="text-2xl">{timeLeft.days}</span>
              <span className="block text-xs font-normal">Hari</span>
            </div>
            <span className="text-2xl">:</span>
            <div className="text-center">
              <span className="text-2xl">{timeLeft.hours}</span>
              <span className="block text-xs font-normal">Jam</span>
            </div>
            <span className="text-2xl">:</span>
            <div className="text-center">
              <span className="text-2xl">{timeLeft.minutes}</span>
              <span className="block text-xs font-normal">Menit</span>
            </div>
            <span className="text-2xl">:</span>
            <div className="text-center">
              <span className="text-2xl">{timeLeft.seconds}</span>
              <span className="block text-xs font-normal">Detik</span>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="overflow-x-hidden flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight} className="py-4 border border-[color:var(--color-primary)] border-opacity-30 rounded-3xl p-6 shadow-sm flex-1 bg-white bg-opacity-50">
            <h2 className="m-0 py-2 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Akad Nikah</h2>
            <p className="text-[color:var(--color-primary)] mb-1" style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}>Pukul {data.akadTime || '09.00'} WIB - Selesai</p>
            <p className="font-bold text-lg text-[color:var(--color-primary)] mb-2">{data.venueName || 'Lokasi Acara'}</p>
            <p className="text-[color:var(--color-primary)] opacity-80 text-sm mb-4">{data.venueAddress}</p>
            {data.venueMapUrl && (
              <a href={data.venueMapUrl} target="_blank" rel="noreferrer" className="inline-block border border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] transition-colors rounded-full px-4 py-2 text-sm">
                Buka Google Maps
              </a>
            )}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="py-4 border border-[color:var(--color-primary)] border-opacity-30 rounded-3xl p-6 shadow-sm flex-1 bg-white bg-opacity-50">
            <h2 className="m-0 py-2 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Resepsi</h2>
            <p className="text-[color:var(--color-primary)] mb-1" style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}>Pukul {data.resepsiTime || '11.00'} WIB - Selesai</p>
            <p className="font-bold text-lg text-[color:var(--color-primary)] mb-2">{data.venueName || 'Lokasi Acara'}</p>
            <p className="text-[color:var(--color-primary)] opacity-80 text-sm mb-4">{data.venueAddress}</p>
            {data.venueMapUrl && (
              <a href={data.venueMapUrl} target="_blank" rel="noreferrer" className="inline-block border border-[color:var(--color-primary)] text-[color:var(--color-bg)] bg-[color:var(--color-primary)] hover:opacity-90 transition-colors rounded-full px-4 py-2 text-sm">
                Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function GallerySection({ data, config, photos }: SectionProps) {
  const displayPhotos = photos.filter(p => p.type === 'prewedding' || p.type === 'couple');
  if (displayPhotos.length === 0) return null;

  return (
    <section className="bg-[color:var(--color-bg)] pb-10 pt-4" id="galeri">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="border border-[color:var(--color-primary)] border-opacity-30 rounded-3xl shadow-sm p-6 bg-white bg-opacity-50">
          <h2 className="text-center py-2 m-0 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem' }}>Galeri</h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayPhotos.map((photo, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="overflow-hidden rounded-xl aspect-[4/5]"
              >
                <img src={photo.url} alt={`Gallery ${index}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RSVPSection({ data, config, photos, onRSVP, rsvpToken, guestName }: SectionProps) {
  const [status, setStatus] = useState<'HADIR' | 'TIDAK_HADIR'>('HADIR');
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRSVP || !rsvpToken) return;
    setLoading(true);
    try {
      await onRSVP({ rsvp_token: rsvpToken, rsvp_status: status, actual_pax: status === 'HADIR' ? pax : 0, message });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[color:var(--color-bg)] my-0 pb-10 pt-3" id="ucapan">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="border border-[color:var(--color-primary)] border-opacity-30 rounded-3xl shadow p-6 mb-2 bg-white bg-opacity-50">
          <h2 className="text-center mt-2 mb-6 text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem' }}>Ucapan &amp; Doa</h2>
          
          {success ? (
            <div className="text-center py-8 text-[color:var(--color-primary)]">
              <h3 className="font-bold text-xl mb-2">Terima Kasih!</h3>
              <p>Konfirmasi kehadiran dan doa Anda telah kami terima.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="text-[color:var(--color-primary)]" style={{ fontFamily: 'var(--font-body)' }}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Nama Tamu</label>
                <input 
                  type="text" 
                  value={guestName || ''} 
                  readOnly 
                  className="w-full px-3 py-2 border border-[color:var(--color-primary)] border-opacity-20 rounded-xl bg-black bg-opacity-5 focus:outline-none" 
                  placeholder="Nama akan terisi otomatis"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Konfirmasi Kehadiran</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[color:var(--color-primary)] border-opacity-50 rounded-xl bg-white focus:outline-none focus:border-[color:var(--color-primary)] text-black"
                >
                  <option value="HADIR">Hadir</option>
                  <option value="TIDAK_HADIR">Tidak Hadir</option>
                </select>
              </div>
              {status === 'HADIR' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Jumlah Hadir</label>
                  <select 
                    value={pax} 
                    onChange={(e) => setPax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[color:var(--color-primary)] border-opacity-50 rounded-xl bg-white focus:outline-none focus:border-[color:var(--color-primary)] text-black"
                  >
                    <option value={1}>1 Orang</option>
                    <option value={2}>2 Orang</option>
                  </select>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Ucapan &amp; Doa</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-[color:var(--color-primary)] border-opacity-50 rounded-xl bg-white focus:outline-none focus:border-[color:var(--color-primary)] text-black"
                  placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..."
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading || !rsvpToken}
                className="w-full btn shadow rounded-xl px-4 py-3 text-[color:var(--color-bg)] bg-[color:var(--color-primary)] hover:opacity-90 font-bold transition-all disabled:opacity-50 border-none"
              >
                {loading ? 'Mengirim...' : 'Kirim Ucapan'}
              </button>
              {!rsvpToken && (
                <p className="text-xs text-center mt-3 opacity-70">
                  Formulir ini hanya aktif saat diakses melalui link undangan khusus tamu (mengandung parameter ?g=).
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
