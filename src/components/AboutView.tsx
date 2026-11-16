import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import heroBwSteamImg from '../assets/images/about_hero_bw_steam_1794787869248.jpg';
import selfPortraitImg from '../assets/images/about_self_portrait.jpeg';
import realityBwKnifeImg from '../assets/images/about_reality_bw_knife_1794787871008.jpg';
import memoriesBwWindowImg from '../assets/images/about_memories_bw_window_1794787870868.jpg';
import continuityBwSimmerImg from '../assets/images/about_continuity_bw_simmer_1794787871181.jpg';

const SOCIAL_LINKS = [
  { label: 'Behance', href: 'https://www.behance.net/' },
  { label: 'Photography Instagram', href: 'https://www.instagram.com/' },
  { label: 'simmer Instagram', href: 'https://www.instagram.com/' },
];

export const AboutView: React.FC = () => {
  const [colonVisible, setColonVisible] = useState(true);

  // Colon blinking frequency identical to Home (1000ms toggle)
  useEffect(() => {
    const timer = setInterval(() => {
      setColonVisible((v) => !v);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex flex-col text-white font-sans bg-[#080808] pt-10 sm:pt-16">
      {/* Sticky Page Header: 23:12 with breathing colon matching Year, Dish, Place */}
      <header className="sticky top-14 z-40 w-full bg-[#080808]/95 backdrop-blur-md border-b border-white/5">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 transition-all">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-[#ffffff] leading-none flex items-baseline select-none">
              <span>23</span>
              <span
                className={`mx-[1px] select-none transition-opacity duration-200 ${
                  colonVisible ? 'opacity-100' : 'opacity-20'
                }`}
              >
                :
              </span>
              <span>12</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#888888] font-normal leading-relaxed truncate">
              About this project.
            </p>
          </div>
        </div>
      </header>

      {/* Editorial Magazine Canvas */}
      <article className="w-full pt-8 sm:pt-12">
        {/* TOP VISUAL — Clean Full-Width 16:9 Photograph */}
        <section className="w-full">
          <div className="relative w-full aspect-video overflow-hidden bg-[#080808]">
            <img
              src={heroBwSteamImg}
              alt="Monochrome close-up of steam rising from a dark iron pot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center grayscale contrast-110"
            />
            <div className="absolute inset-x-0 top-0 h-24 sm:h-36 bg-gradient-to-b from-[#080808] via-[#080808]/55 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-40 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent pointer-events-none" />
          </div>
        </section>

        {/* SECTION 01 — Introduction (Two-Band Swiss Editorial Grid: Header Trio + Portrait & Bio) */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-36 space-y-20 sm:space-y-32">
          {/* Upper Row: Title Left | Compact Tagline Middle | Links Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            {/* Left Column: Why I cook. & On cooking, and the act of remembering. */}
            <div className="lg:col-span-5 space-y-2.5 min-w-0">
              <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.04] text-white">
                Why I cook.
              </h2>
              <p className="text-xl sm:text-2xl lg:text-[26px] font-normal tracking-[-0.02em] leading-[1.22] text-white max-w-sm">
                On cooking, and the act of remembering.
              </p>
            </div>

            {/* Middle Column: Short Opening Bio */}
            <div className="lg:col-span-3 lg:col-start-7 pt-1">
              <p className="text-[11px] sm:text-xs text-[#9ca3af] leading-[1.65]">
                在數位影像與設計之外，深夜的廚房是我保留給自己的時間座標。用沒有固定食譜的料理，替日常留下氣味與溫度的刻度。
              </p>
            </div>

            {/* Right Column: Clean External Links (No Leading Slash) */}
            <nav
              aria-label="External links"
              className="lg:col-span-3 lg:col-start-10 flex flex-col lg:items-end space-y-2 pt-1 text-sm sm:text-[15px] font-normal text-white"
            >
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 leading-[1.5] text-white hover:opacity-70 transition-opacity"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </a>
              ))}
            </nav>
          </div>

          {/* Lower Row: Offset Portrait Photo Slot + Personal Introduction Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Portrait Photo Slot (Centered-Left Offset matching Reference) */}
            <figure className="relative lg:col-span-4 lg:col-start-3 w-full bg-[#080808] overflow-hidden">
              <img
                src={selfPortraitImg}
                alt="Portrait of the author"
                referrerPolicy="no-referrer"
                className="w-full h-auto block"
              />
              <div className="absolute inset-x-0 top-0 h-10 sm:h-14 bg-gradient-to-b from-[#080808] via-[#080808]/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-[#080808] via-[#080808]/55 to-transparent pointer-events-none" />
            </figure>

            {/* Personal Introduction Slot */}
            <div className="lg:col-span-4 lg:col-start-8 lg:pt-10 space-y-6">
              <p className="text-sm sm:text-base text-white font-normal leading-[1.45]">
                Midnight kitchen, visual design, photography, everyday archive.
              </p>

              <div className="space-y-3 text-[11px] sm:text-xs text-[#9ca3af] leading-[1.65]">
                <p>
                  平時從事視覺設計與影像創作，習慣透過鏡頭與畫面觀察日常裡的微光與秩序。離開螢幕之後，煮飯成為一天當中最安靜也最真實的切換。
                </p>
                <p>
                  這裡不記錄精準的食譜比例，而是把某個夜晚的心情、當時聽的音樂、走過的地方與端上桌的一道菜，留下成為時間裡的個人索引。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02 — Opening Story (Single-Line Monumental Display Headline + Whitespace + Left-Aligned Copy) */}
        <section className="w-full py-20 sm:py-28">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-[clamp(1.45rem,5.4vw,4.75rem)] font-semibold tracking-[-0.04em] leading-none text-white sm:whitespace-nowrap">
              It started with a question
            </h2>

            <div className="mt-14 sm:mt-24 max-w-sm space-y-2.5 text-[11px] sm:text-xs text-[#9ca3af] leading-[1.65]">
              <p>最初，只是因為吃過我做的飯的人，都想知道我是怎麼做的。</p>
              <p>於是，我開始思考紀錄料理的可能。</p>
              <p>
                但對我而言，邊料理邊紀錄實在有點假掰；而且，料理不應該也是一件享受當下的事嗎？
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 03 — Three Chapters (Reality, Memories, Continuity) */}
        <section className="w-full">
          {/* CHAPTER 01 — Reality */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3.5">
                    <span className="font-sans text-xl sm:text-2xl font-medium tracking-tight text-white leading-none select-none">
                      01.
                    </span>
                    <h3 className="text-3xl sm:text-5xl font-semibold tracking-[-0.025em] text-white leading-none">
                      Reality
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-white font-normal leading-snug pl-9 sm:pl-11">
                    Beyond the virtual, there is the everyday.
                  </p>
                </div>

                <p className="text-[11px] sm:text-xs text-[#9ca3af] leading-[1.65] max-w-xs pl-9 sm:pl-11">
                  料理與享受美食，是我與現實生活保持連結的方式。 切菜、等待水滾、試味道，以及坐下來吃飯，這些看似平凡的行為，讓時間透過身體被感知，也讓生活有了具體的形狀。
                </p>
              </div>

              <figure className="relative lg:col-span-6 lg:col-start-7 w-full aspect-video bg-[#080808] overflow-hidden">
                <img
                  src={realityBwKnifeImg}
                  alt="Black-and-white macro close-up of chef knife blade and sliced scallions"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center grayscale contrast-110"
                />
                <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-b from-[#080808] via-[#080808]/50 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-[#080808] via-[#080808]/55 to-transparent pointer-events-none" />
              </figure>
            </div>
          </div>

          {/* CHAPTER 02 — Memories */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <figure className="relative order-2 lg:order-1 lg:col-span-6 w-full aspect-video bg-[#080808] overflow-hidden">
                <img
                  src={memoriesBwWindowImg}
                  alt="Black-and-white close-up of rain condensation on an empty night window"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center grayscale contrast-110"
                />
                <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-b from-[#080808] via-[#080808]/50 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-[#080808] via-[#080808]/55 to-transparent pointer-events-none" />
              </figure>

              <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8 lg:pt-10 space-y-8">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-3xl sm:text-5xl font-semibold tracking-[-0.025em] text-white leading-none">
                      Memories
                    </h3>
                    <span className="font-sans text-xl sm:text-2xl font-medium tracking-tight text-white leading-none select-none">
                      02.
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-white font-normal leading-snug">
                    A dish is a point in time. A place is a way back.
                  </p>
                </div>

                <p className="text-[11px] sm:text-xs text-[#9ca3af] leading-[1.65] max-w-xs">
                  一道料理或許能成為一個線索，讓我重新想起某段時間、某個地方，以及當時的自己，正處於什麼樣的生活狀態。
                </p>
              </div>
            </div>
          </div>

          {/* CHAPTER 03 — Continuity */}
          <div className="w-full pt-20 sm:pt-28">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                <div className="lg:col-span-6 space-y-2">
                  <span className="block font-sans text-xl sm:text-2xl font-medium tracking-tight text-white leading-none select-none">
                    03.
                  </span>
                  <h3 className="text-3xl sm:text-5xl font-semibold tracking-[-0.025em] text-white leading-none pt-1">
                    Continuity
                  </h3>
                  <p className="text-sm sm:text-base text-white font-normal leading-snug pt-0.5">
                    An unfinished map of a life.
                  </p>
                </div>

                <div className="lg:col-span-4 lg:col-start-8 space-y-2 text-[11px] sm:text-xs text-[#9ca3af] leading-[1.65]">
                  <p>這是一項持續進行的個人紀錄。</p>
                  <p>
                    數位媒介讓逐漸模糊的感官記憶，得以轉化為可觀看、可回望的軌跡。 盼未來某個時空裡，再次看見這些紀錄的我們，能夠會心一笑。
                  </p>
                </div>
              </div>
            </div>

            {/* Full-Bleed Edge-to-Edge Macro Photograph */}
            <figure className="relative w-full aspect-video overflow-hidden bg-[#080808]">
              <img
                src={continuityBwSimmerImg}
                alt="Full-bleed monochrome macro photograph of simmering dark broth ripples"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center grayscale contrast-115"
              />
              <div className="absolute inset-x-0 top-0 h-24 sm:h-36 bg-gradient-to-b from-[#080808] via-[#080808]/55 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-28 sm:h-40 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent pointer-events-none" />
            </figure>
          </div>
        </section>

        {/* SECTION 04 — Closing: Generous Whitespace & Clean Typographic Statement */}
        <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-28 sm:py-40">
          <p className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-none text-white">
            Still taking shape... ... ...
          </p>
        </footer>
      </article>
    </div>
  );
};
