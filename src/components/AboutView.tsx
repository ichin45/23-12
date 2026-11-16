import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import selfPortraitImg from '../assets/images/about_self_portrait.jpeg';
import topKitchenImg from '../assets/images/about_top_kitchen.png';
import realityImg from '../assets/images/about_01_reality.png';
import memoriesImg from '../assets/images/about_02_memories.png';
import continuityImg from '../assets/images/about_03_continuity.png';
import bottomStoveImg from '../assets/images/about_bottom_stove.png';

const SOCIAL_LINKS = [
  { label: 'Behance', href: 'https://www.behance.net/1Chin' },
  { label: 'Instagram', href: 'https://www.instagram.com/simmer.n__________/' },
];

const CHAPTERS = [
  {
    num: '01',
    title: 'Reality',
    subtitle: 'Beyond the virtual,\nthere is the everyday.',
    image: realityImg,
    alt: 'Fresh root vegetables, carrots, and peppers on a kitchen counter',
    description:
      '料理與享受美食，是我與現實生活保持連結的方式\n切菜、等待水滾、試味道，以及坐下來吃飯，這些看似平凡的行為\n讓時間透過身體被感知，也讓生活有了具體的形狀',
  },
  {
    num: '02',
    title: 'Memories',
    subtitle: 'A dish is a point in time.\nA place is a way back.',
    image: memoriesImg,
    alt: 'Electric mixer beating batter inside a glass bowl',
    description:
      '一道料理或許能成為一個線索\n讓我重新想起某段時間、某個地方\n以及當時的自己，正處於什麼樣的生活狀態',
  },
  {
    num: '03',
    title: 'Continuity',
    subtitle: 'An unfinished map of a life.',
    image: continuityImg,
    alt: 'Eggs and dishes simmering in frying pans on the stove',
    description:
      '「這是一項持續進行的個人紀錄」\n數位媒介讓逐漸模糊的感官記憶，得以轉化為可觀看、可回望的軌跡\n盼未來某個時空裡，再次看見這些紀錄的我們，能夠會心一笑',
  },
];

// Unified Typographic Scale Tokens
const TYPE_H1_BASE =
  'text-[42px] sm:text-[52px] font-semibold tracking-[-0.03em] text-white';
const TYPE_H1 = `${TYPE_H1_BASE} leading-[0.95]`;
const TYPE_H2 =
  'text-xl sm:text-2xl font-semibold tracking-[-0.02em] leading-[1.15] text-white';
const TYPE_H3 = 'text-sm lg:text-base font-normal text-white leading-[1.25]';
const TYPE_NORMAL_BASE =
  'text-[10.5px] sm:text-xs md:text-[10.5px] lg:text-xs font-normal tracking-[0.015em] lg:tracking-[0.03em] leading-[1.95]';
const TYPE_NORMAL = `${TYPE_NORMAL_BASE} text-[#9ca3af]`;

const CommaQuoteMark: React.FC<{ variant: 'open' | 'close'; className?: string }> = ({
  variant,
  className = 'h-7 sm:h-9 w-auto text-white shrink-0',
}) => (
  <svg
    viewBox="2 4.5 30 20.5"
    fill="currentColor"
    aria-hidden="true"
    className={`${className} ${variant === 'open' ? 'rotate-180' : ''}`}
  >
    <path d="M14 10.5C14 7.19 11.31 4.5 8 4.5C4.69 4.5 2 7.19 2 10.5C2 13.65 4.44 16.23 7.53 16.48C7.3 19.1 5.65 21.35 3.1 22.85L4.6 25C10.4 22.2 14 17.1 14 10.5Z" />
    <path d="M32 10.5C32 7.19 29.31 4.5 26 4.5C22.69 4.5 20 7.19 20 10.5C20 13.65 22.44 16.23 25.53 16.48C25.3 19.1 23.65 21.35 21.1 22.85L22.6 25C28.4 22.2 32 17.1 32 10.5Z" />
  </svg>
);

const ChapterLockup: React.FC<{ num: string; title: string; subtitle: string }> = ({
  num,
  title,
  subtitle,
}) => {
  const subtitleLines = subtitle.split('\n');

  return (
    <div className="flex items-start gap-3.5 text-left">
      <span
        className="text-white font-bold tracking-[-0.02em] select-none shrink-0 block text-[84px] sm:max-lg:portrait:text-[92px] landscape:text-[72px] lg:text-[72px] leading-[0.75] tabular-nums"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontFeatureSettings: '"lnum" 1, "tnum" 1',
        }}
      >
        {num}
      </span>
      <div className="flex flex-col justify-start min-w-0">
        <h3 className={TYPE_H2}>{title}</h3>
        <p className={`${TYPE_H3} mt-0.5`}>
          {subtitleLines.map((line, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <>
                  <br className="hidden max-lg:portrait:inline" />
                  <span className="inline max-lg:portrait:hidden"> </span>
                </>
              )}
              {line}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};

const VERTICAL_GUIDE_OPACITIES = Array.from({ length: 10 }, (_, i) => i / 9);

export const AboutView: React.FC = () => {
  const [colonVisible, setColonVisible] = useState(true);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const [revealedOrigin, setRevealedOrigin] = useState(false);

  // Colon blinking frequency identical to Home (1000ms toggle)
  useEffect(() => {
    const timer = setInterval(() => {
      setColonVisible((v) => !v);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleChapter = (num: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  return (
    <div className="w-full flex flex-col text-white font-sans bg-[#080808] pt-10 sm:pt-16">
      {/* Sticky Page Header: 23:12 with breathing colon matching Year, Dish, Place */}
      <header className="sticky top-14 z-40 w-full bg-[#080808]/95 backdrop-blur-md">
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

      {/* Editorial Canvas */}
      <article className="w-full pt-6 sm:pt-8">
        {/* PRE-SECTION 1 — Opening Photograph Matching max-w-6xl Container Width (Portrait 10:11 Crop, Sharp Corners, Bottom-Half Fade to Black) */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <figure className="relative w-full aspect-[10/11] overflow-hidden">
            <img
              src={topKitchenImg}
              alt="Sunlit kitchen counter with fresh tomatoes, chopped onions, knife, and green skillet"
              className="w-full h-full object-cover object-top block"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080808] via-[#080808]/55 to-transparent"
            />
          </figure>
        </section>

        {/* SECTION 1 — Who cooks! (H2) + Self Portrait (original ratio) + Self-Introduction (30px gap) + External Links */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
          <div className="flex flex-col md:flex-row items-start md:items-stretch gap-[30px] text-left">
            <div className="w-full max-w-[270px] sm:max-w-[300px] md:w-[285px] lg:w-[300px] shrink-0 flex flex-col justify-end">
              <figure className="w-full bg-[#080808]">
                <img
                  src={selfPortraitImg}
                  alt="Portrait of the author"
                  className="w-full h-auto block"
                />
              </figure>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between space-y-10">
              <div className="space-y-4">
                <h2 className={TYPE_H2}>Who cooks!</h2>
                <div className={`${TYPE_NORMAL} space-y-5`}>
                  <p>目前以 XR 設計研究謀生，現在狂寫論文中 ⋯⋯</p>
                  <p>
                    比起每天螢幕上改 Code，戴頭盔當開發怪人，煮飯實在是太好玩了 ＞＜
                    <br />
                    甚至在思考還是畢業後去賣茶葉蛋？做個自己的吃吃品牌～
                  </p>
                </div>
              </div>

              <nav
                aria-label="External links"
                className={`flex flex-wrap items-center gap-x-6 gap-y-2.5 ${TYPE_H3}`}
              >
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-white hover:opacity-70 transition-opacity"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Shifted downward with 10 H2-sized 0-100% white circles (20px gap) leading directly into Section 3 */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-72 sm:pt-96 md:pt-[420px] pb-5 flex flex-col justify-start text-left">
          <div className="w-full space-y-2">
            <h2 className={TYPE_H1}>Why I cook.</h2>
            <p className={`${TYPE_H2} sm:whitespace-nowrap`}>
              On cooking, and the act of remembering.
            </p>
          </div>

          {/* Left-aligned vertical column of 10 H2-sized circles with 20px spacing */}
          <div
            aria-hidden="true"
            className="flex flex-col items-start gap-[20px] pt-6 sm:pt-8 select-none"
          >
            {VERTICAL_GUIDE_OPACITIES.map((opacity, idx) => (
              <span
                key={idx}
                className="block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shrink-0"
                style={{ opacity }}
              />
            ))}
          </div>
        </section>

        {/* SECTION 3 — Connects immediately from the last circle into It started with a question ? + centered prose breathing room */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-0 pb-36 sm:pb-48 md:pb-56 flex flex-col justify-start text-left">
          <div className="w-full space-y-6 sm:space-y-8">
            <h2 className={`${TYPE_H1} sm:whitespace-nowrap`}>
              It started with a question
              <span
                aria-hidden="true"
                className="inline-block ml-1 sm:ml-1.5 text-[84px] sm:text-[140px] lg:text-[180px] font-semibold leading-[0.75] text-white align-baseline"
              >
                ?
              </span>
            </h2>

            <div className="text-left">
              <button
                type="button"
                onClick={() => setRevealedOrigin((v) => !v)}
                aria-expanded={revealedOrigin}
                className={`inline-block max-w-full p-0 text-left cursor-pointer focus:outline-none transition-colors duration-300 ${
                  revealedOrigin
                    ? 'bg-transparent'
                    : 'bg-white hover:bg-white/90'
                }`}
              >
                <span
                  className={`${TYPE_NORMAL_BASE} block text-left transition-opacity duration-300 ${
                    revealedOrigin
                      ? 'text-[#9ca3af] opacity-100'
                      : 'text-[#9ca3af] opacity-0 select-none'
                  }`}
                >
                  <span className="lg:whitespace-nowrap">
                    最初，只是因為吃過我做的飯的人，「都想知道我是怎麼做的」。於是，我開始思考「紀錄料理」的可能？</span>
                  <br />
                  <span className="lg:whitespace-nowrap">
                    但對我而言，邊料理邊紀錄實在有點假掰；而且，料理不應該也是一件享受當下的事嗎？
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Left-Aligned Original-Color Photo + Height-Synced Bold Serif Lockup, Right Click-to-Reveal Comma Quotes */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12 sm:pt-6 sm:pb-16 space-y-20 sm:space-y-28">
          {CHAPTERS.map((chapter) => {
            const isOpen = !!openChapters[chapter.num];
            return (
              <div
                key={chapter.num}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start text-left"
              >
                {/* Left: Uncropped Full-Color Photo + Lockup (Bold Serif H1 synced to H2 + H3 height) */}
                <div className="md:col-span-6 space-y-4 text-left">
                  <figure className="w-full overflow-hidden">
                    <img
                      src={chapter.image}
                      alt={chapter.alt}
                      className="w-full h-auto block"
                    />
                  </figure>

                  <ChapterLockup
                    num={chapter.num}
                    title={chapter.title}
                    subtitle={chapter.subtitle}
                  />
                </div>

                {/* Right: Clickable Comma-Shaped Quotes Revealing Continuous Prose with Symmetric Top/Bottom Spacing */}
                <div className="md:col-span-6 flex flex-col items-start justify-start text-left md:pt-1">
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.num)}
                    aria-expanded={isOpen}
                    aria-label={`${chapter.title} quote`}
                    className="group text-left cursor-pointer focus:outline-none w-full"
                  >
                    {!isOpen ? (
                      <div className="inline-flex items-center gap-4 select-none group-hover:opacity-70 transition-opacity">
                        <CommaQuoteMark variant="open" />
                        <CommaQuoteMark variant="close" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-start text-left gap-6">
                        <CommaQuoteMark
                          variant="open"
                          className="h-7 sm:h-9 w-auto text-white shrink-0 group-hover:opacity-70 transition-opacity"
                        />
                        <p className={TYPE_NORMAL}>
                          {chapter.description.split('\n').map((line, idx) => (
                            <span key={idx} className="block">
                              {line}
                            </span>
                          ))}
                        </p>
                        <CommaQuoteMark
                          variant="close"
                          className="h-7 sm:h-9 w-auto text-white shrink-0 group-hover:opacity-70 transition-opacity"
                        />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* SECTION 5 (directly follows Section 4) — Closing Photograph Matching max-w-6xl Container Width (Portrait 10:11 Crop, Sharp Corners, Top-Half Fade from Black) */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
          <figure className="relative w-full aspect-[10/11] overflow-hidden">
            <img
              src={bottomStoveImg}
              alt="Steaming pots of clams and broth simmering on the stove"
              className="w-full h-full object-cover object-top block"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#080808] via-[#080808]/55 to-transparent"
            />
          </figure>
        </section>

        {/* SECTION 6 (16:9) — Still taking shape ... ... ... (Bottom-Anchored, Looping Dots) */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-12 md:py-0 md:pb-12 md:aspect-video flex flex-col justify-end items-start">
          <p className={`${TYPE_H1} text-left`}>
            Still taking shape{' '}
            <span className="inline-flex items-baseline gap-2 sm:gap-3" aria-hidden="true">
              <span className="animate-dot-loop" style={{ animationDelay: '0s' }}>
                ...
              </span>
              <span className="animate-dot-loop" style={{ animationDelay: '0.45s' }}>
                ...
              </span>
              <span className="animate-dot-loop" style={{ animationDelay: '0.9s' }}>
                ...
              </span>
            </span>
          </p>
        </section>
      </article>
    </div>
  );
};
