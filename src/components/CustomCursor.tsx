import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [isHeaderTarget, setIsHeaderTarget] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with hover support
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        // Only trigger color inversion if mouse is inside <header> and hovering over white text or icon
        const headerContainer = target.closest('header');
        const isHeaderElement = Boolean(
          headerContainer &&
            (target.tagName === 'SPAN' ||
              target.tagName === 'BUTTON' ||
              target.tagName === 'A' ||
              target.tagName === 'SVG' ||
              target.closest('button') ||
              target.closest('a') ||
              target.closest('span'))
        );
        setIsHeaderTarget(isHeaderElement);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const follow = () => {
      setTrailing((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22,
      }));
      animationFrameId = requestAnimationFrame(follow);
    };
    animationFrameId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2"
      style={{
        transform: `translate3d(${trailing.x}px, ${trailing.y}px, 0)`,
      }}
    >
      <div
        className={`rounded-full transition-all duration-200 ease-out flex items-center justify-center ${
          isHeaderTarget
            ? 'w-10 h-10 bg-white mix-blend-difference scale-110 shadow-lg'
            : 'w-6 h-6 border border-white/20 bg-transparent'
        }`}
      />
    </div>
  );
};
