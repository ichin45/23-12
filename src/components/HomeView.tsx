import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ViewMode } from '../types';
import {
  SolidCalendarIcon,
  SolidPaellaDishIcon,
  SolidPlacePinIcon,
} from './Icons';

interface HomeViewProps {
  onNavigate: (mode: ViewMode) => void;
}

/**
 * TimeWarpClock:
 * 1. 載入時直接從當前時區時間開始
 * 2. 漸漸跳轉加速，直接向前躍進至 23:12 (不額外多跑 24 小時)
 * 3. 漸慢並精準定格於 23:12
 * 4. 定格瞬間觸發光暈效果與字打效果
 */
const TimeWarpClock: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [hours, setHours] = useState<string>(() => {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0');
  });
  const [mins, setMins] = useState<string>(() => {
    const now = new Date();
    return String(now.getMinutes()).padStart(2, '0');
  });
  const [isLanded, setIsLanded] = useState(false);
  const [colonVisible, setColonVisible] = useState(true);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Blinking colon indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setColonVisible((v) => !v);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentSecs = now.getSeconds();

    // 1. Start DIRECTLY from user's current local timezone time
    setHours(String(currentHours).padStart(2, '0'));
    setMins(String(currentMins).padStart(2, '0'));
    setIsLanded(false);

    const currentTotalSec = currentHours * 3600 + currentMins * 60 + currentSecs;
    const targetTotalSec = 23 * 3600 + 12 * 60; // 23:12:00

    // Advance directly from current time forward to 23:12 (no extra 24 hours)
    let totalDiff = targetTotalSec - currentTotalSec;
    if (totalDiff <= 0) {
      totalDiff += 24 * 3600;
    }

    const startTime = performance.now();
    const warpDuration = 2400; // Direct and responsive jump to 23:12

    // Starts directly, gradually accelerates (漸漸跳轉), then smoothly decelerates (漸慢) into 23:12
    const getWarpProgress = (t: number): number => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      if (t < 0.25) {
        return Math.pow(t / 0.25, 2.0) * 0.12;
      } else if (t < 0.75) {
        const p = (t - 0.25) / 0.50;
        return 0.12 + p * 0.72;
      } else {
        const p = (t - 0.75) / 0.25;
        const easeOut = 1 - Math.pow(1 - p, 2.5);
        return 0.84 + easeOut * 0.16;
      }
    };

    const animate = (currentTime: number) => {
      if (isCancelled) return;
      const elapsed = currentTime - startTime;

      const rawProgress = Math.min(elapsed / warpDuration, 1);
      const easeProgress = getWarpProgress(rawProgress);

      const animatedSec = Math.round(currentTotalSec + totalDiff * easeProgress) % (24 * 3600);
      const h = String(Math.floor(animatedSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((animatedSec % 3600) / 60)).padStart(2, '0');

      setHours(h);
      setMins(m);

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Precisely freeze at 23:12, trigger glow and typewriter effect
        setHours('23');
        setMins('12');
        setIsLanded(true);
        setTimeout(() => {
          if (!isCancelled && onCompleteRef.current) {
            onCompleteRef.current();
          }
        }, 200);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <h1
      className={`text-8xl sm:text-9xl md:text-[11.5rem] font-bold tracking-tighter leading-none transition-all duration-700 select-none flex items-center justify-center ${
        isLanded
          ? 'text-[#ffffff] drop-shadow-[0_0_60px_rgba(255,255,255,0.75)] scale-[1.02]'
          : 'text-[#dedede]'
      }`}
    >
      <span>{hours}</span>
      <span
        className={`px-1 text-white/90 font-light transition-opacity duration-300 ${
          colonVisible ? 'opacity-100' : 'opacity-20'
        }`}
      >
        :
      </span>
      <span>{mins}</span>
    </h1>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [typedText, setTypedText] = useState<string>('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);

  // Subtitle split into two lines for vertical mobile & poetic rhythm
  const fullSubtitle = 'One-pot all in, at night.\nMade as I feel... # @where!';
  const portalRef = useRef<HTMLDivElement>(null);

  const handleClockComplete = () => {
    setShowSubtitle(true);
  };

  // Lock scrolling until the clock and typewriter animations finish
  useEffect(() => {
    if (!typingComplete) {
      document.body.style.overflow = 'hidden';
      const preventScroll = (e: Event) => {
        e.preventDefault();
      };
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [typingComplete]);

  // Typewriter effect
  useEffect(() => {
    if (!showSubtitle) return;
    let i = 0;
    setTypedText('');
    setTypingComplete(false);

    const typingInterval = setInterval(() => {
      if (i < fullSubtitle.length) {
        setTypedText(fullSubtitle.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setTypingComplete(true);
      }
    }, 45);

    return () => clearInterval(typingInterval);
  }, [showSubtitle]);

  const scrollToPortal = () => {
    if (!typingComplete) return;
    portalRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className={`w-full flex flex-col text-[#f5f5f5] bg-[#080808] font-sans select-none scroll-smooth ${
        !typingComplete ? 'h-[100dvh] overflow-hidden' : ''
      }`}
    >
      {/* ================= PAGE 1: HERO TIME ACCELERATION & SUBTITLE ================= */}
      <section className="min-h-[calc(100vh-3.5rem)] w-full flex flex-col justify-between items-center px-6 py-12 relative">
        <div className="h-6" />

        {/* Center: Clock & Two-Line Subtitle */}
        <div className="flex flex-col items-center max-w-3xl space-y-7 text-center">
          <TimeWarpClock onComplete={handleClockComplete} />

          <p
            className={`whitespace-pre-line text-sm sm:text-base md:text-lg text-[#999999] font-normal tracking-wide max-w-xl leading-relaxed min-h-[56px] transition-opacity duration-500 ${
              showSubtitle ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {typedText}
            {typedText.length < fullSubtitle.length && showSubtitle && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-white animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Bottom: Scroll Prompt indicator (appears ONLY when animation completes) */}
        <div
          className={`transition-all duration-700 pb-4 flex flex-col items-center gap-2 ${
            typingComplete
              ? 'opacity-90 translate-y-0 cursor-pointer pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          onClick={scrollToPortal}
        >
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase hover:text-white transition-colors">
            Scroll to explore
          </span>
          <ChevronDown className="w-4 h-4 text-white/60 animate-bounce" />
        </div>
      </section>

      {/* ================= PAGE 2: SECOND SCREEN ================= */}
      <section
        ref={portalRef}
        className={`min-h-screen w-full flex flex-col items-center justify-center px-6 py-20 bg-gradient-to-b from-[#080808] via-[#0b0b0d] to-[#080808] border-t border-white/5 transition-all duration-700 ${
          typingComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-xl mx-auto flex flex-col items-start justify-center space-y-10 text-left">
          {/* Main Top Block: Mine & told left-aligned, delicate refined typography, horizontally centered container */}
          <div className="flex flex-col items-start text-left w-full space-y-2">
            {/* Line 1: Mine, */}
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white leading-none mb-1">
              Mine,
            </h2>
            {/* Line 2: told in simmer__________ at night... */}
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              told in simmer__________ at night...
            </div>
            {/* Line 3: 3 ways to wander through my memories. */}
            <p className="text-xs sm:text-sm text-[#888888] font-normal tracking-wide text-left pt-2">
              3 ways to wander through my memories.
            </p>
          </div>

          {/* 3 Icons: Larger, gentle idle floating animation, horizontally centered with text, unified subtitles */}
          <div className="flex flex-col space-y-8 pt-4 pb-12 w-full select-none">
            {/* 1. YEAR */}
            <div
              onClick={() => {
                onNavigate('year');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center gap-5 sm:gap-6 cursor-pointer text-left"
            >
              {/* Larger Icon with idle float animation */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center animate-float transition-transform duration-300 group-hover:scale-110">
                <SolidCalendarIcon className="w-8 h-8 sm:w-9 sm:h-9 text-[#d4d4d8] group-hover:text-white transition-colors" />
              </div>

              {/* Explanatory text unified with YearView */}
              <div className="flex flex-col items-start text-left space-y-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out -translate-x-1 group-hover:translate-x-0">
                <span className="text-[10px] font-sans tracking-widest text-[#777777] uppercase">
                  01 / TIME
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  Year.
                </h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  An emotional map of the "TIME"!
                </p>
              </div>
            </div>

            {/* 2. DISH */}
            <div
              onClick={() => {
                onNavigate('dish');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center gap-5 sm:gap-6 cursor-pointer text-left"
            >
              {/* Larger Icon with staggered idle float animation */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center animate-float transition-transform duration-300 group-hover:scale-110"
                style={{ animationDelay: '-2s' }}
              >
                <SolidPaellaDishIcon className="w-8 h-8 sm:w-9 sm:h-9 text-[#d4d4d8] group-hover:text-white transition-colors" />
              </div>

              {/* Explanatory text unified with DishView */}
              <div className="flex flex-col items-start text-left space-y-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out -translate-x-1 group-hover:translate-x-0">
                <span className="text-[10px] font-sans tracking-widest text-[#777777] uppercase">
                  02 / TASTE
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  Dish.
                </h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Without a recipe, but “TASTE” always with a feeling...
                </p>
              </div>
            </div>

            {/* 3. PLACE */}
            <div
              onClick={() => {
                onNavigate('place');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center gap-5 sm:gap-6 cursor-pointer text-left"
            >
              {/* Larger Icon with staggered idle float animation */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center animate-float transition-transform duration-300 group-hover:scale-110"
                style={{ animationDelay: '-4s' }}
              >
                <SolidPlacePinIcon className="w-8 h-8 sm:w-9 sm:h-9 text-[#d4d4d8] group-hover:text-white transition-colors" />
              </div>

              {/* Explanatory text unified with PlaceView */}
              <div className="flex flex-col items-start text-left space-y-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out -translate-x-1 group-hover:translate-x-0">
                <span className="text-[10px] font-sans tracking-widest text-[#777777] uppercase">
                  03 / PLACE
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  Place.
                </h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  "WHERE" I've cooked at, and the lives I've lived in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
