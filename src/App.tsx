import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { DateVibeItem, ViewMode } from './types';
import { INITIAL_DISHES } from './data/seedData';
import { CustomCursor } from './components/CustomCursor';
import { HomeView } from './components/HomeView';
import { YearView } from './components/YearView';
import { DishView } from './components/DishView';
import { PlaceView } from './components/PlaceView';
import { AboutView } from './components/AboutView';
import { DishDetailModal } from './components/DishDetailModal';
import { fadeAndStopAudio } from './utils/audioPlayer';
import {
  SolidCalendarIcon,
  SolidPaellaDishIcon,
  SolidPlacePinIcon,
  SolidHeartIcon,
} from './components/Icons';

import {
  getInitialDishes,
  loadDishesFromStorage,
  persistDishes,
  sanitizeDishes,
} from './utils/storage';
import { getDishNumberByDate } from './utils/dishNumber';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCityName, setSelectedCityName] = useState<string | undefined>(undefined);
  const [selectedCookedAt, setSelectedCookedAt] = useState<string | undefined>(undefined);

  // Dishes state initialized synchronously from local storage / seed
  const [dishes, setDishes] = useState<DateVibeItem[]>(getInitialDishes);

  // Load from unlimited-quota IndexedDB on startup
  useEffect(() => {
    loadDishesFromStorage().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setDishes(loaded);
      }
    });
  }, []);

  // Modal inspection / editing state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DateVibeItem | null>(null);
  const [initialModalDate, setInitialModalDate] = useState<string>('2026-09-12');

  const saveDishes = (newDishes: DateVibeItem[]) => {
    setDishes(newDishes);
    persistDishes(newDishes);
  };

  const handleSaveDish = (dishToSave: DateVibeItem) => {
    const exists = dishes.some((d) => d.id === dishToSave.id);
    if (exists) {
      saveDishes(dishes.map((d) => (d.id === dishToSave.id ? dishToSave : d)));
    } else {
      saveDishes([dishToSave, ...dishes]);
    }
  };

  // Fade out and stop any playing audio on page change
  useEffect(() => {
    fadeAndStopAudio(1000);
  }, [viewMode]);

  const handleDeleteDish = (id: string) => {
    saveDishes(dishes.filter((d) => d.id !== id));
  };

  const [jsonActionLabel, setJsonActionLabel] = useState<'exported' | 'imported' | 'error' | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportJson = () => {
    const payload = JSON.stringify(dishes, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dishes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setJsonActionLabel('exported');
    setTimeout(() => setJsonActionLabel(null), 1800);
  };

  const handleImportJsonChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setJsonActionLabel('error');
        setTimeout(() => setJsonActionLabel(null), 2000);
        return;
      }

      const normalized = sanitizeDishes(
        parsed
          .filter(
            (item): item is DateVibeItem =>
              Boolean(item && typeof item.id === 'string' && typeof item.date === 'string')
          )
          .map((item) => ({
            ...item,
            dishNumber: item.dishNumber ? String(item.dishNumber) : getDishNumberByDate(item.date),
          }))
      );

      saveDishes(normalized);
      setJsonActionLabel('imported');
      setTimeout(() => setJsonActionLabel(null), 1800);
    } catch {
      setJsonActionLabel('error');
      setTimeout(() => setJsonActionLabel(null), 2000);
    }
  };

  const handleSelectDish = (dish: DateVibeItem) => {
    fadeAndStopAudio(1000);
    setSelectedDish(dish);
    setModalOpen(true);
  };

  const handleAddNewDish = (targetDate?: string) => {
    setSelectedDish(null);
    setInitialModalDate(targetDate || new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleNavigateToYear = (dateStr?: string) => {
    setViewMode('year');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToPlace = (cookedAt?: string, livedIn?: string) => {
    setSelectedCookedAt(cookedAt);
    setSelectedCityName(livedIn || cookedAt);
    setViewMode('place');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [homeKey, setHomeKey] = useState(0);

  const handleNavigateHome = () => {
    if (viewMode === 'home') {
      setHomeKey((k) => k + 1);
    } else {
      setViewMode('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDish = () => {
    setViewMode('dish');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f5] flex flex-col font-sans selection:bg-[#262626] selection:text-white relative">
      {/* Subtle cursor interaction */}
      <CustomCursor />

      {/* Header Navigation - Permanently FIXED above Year, Dish, Place, About */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-white/5 w-full">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-6">
          {/* Left: Wordmark back to home or refresh if already on home */}
          <button
            type="button"
            onClick={handleNavigateHome}
            className="flex items-center group whitespace-nowrap shrink-0 text-left cursor-pointer"
            title="Home / Refresh"
          >
            <span className="text-xl font-bold tracking-tighter text-[#ffffff] leading-none transition-all duration-200">
              23:12
            </span>
          </button>

          {/* Navigation Modes: Borderless & Backgroundless icons matching 23:12 height */}
          <nav className="flex items-center gap-4 sm:gap-7">
            {/* YEAR */}
            <button
              type="button"
              onClick={() => {
                setViewMode('year');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-1 bg-transparent border-0 transition-colors cursor-pointer ${
                viewMode === 'year'
                  ? 'text-[#ffffff]'
                  : 'text-[#555555] hover:text-[#cccccc]'
              }`}
              title="Year"
              aria-label="Year"
            >
              <SolidCalendarIcon className="w-[18px] h-[18px]" />
            </button>

            {/* DISH (Paella / Shallow Pot inspired) */}
            <button
              type="button"
              onClick={() => {
                setViewMode('dish');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-1 bg-transparent border-0 transition-colors cursor-pointer ${
                viewMode === 'dish'
                  ? 'text-[#ffffff]'
                  : 'text-[#555555] hover:text-[#cccccc]'
              }`}
              title="Dish"
              aria-label="Dish"
            >
              <SolidPaellaDishIcon className="w-[18px] h-[18px]" />
            </button>

            {/* PLACE (Solid pin with hollow center circle) */}
            <button
              type="button"
              onClick={() => {
                setSelectedCityName(undefined);
                setViewMode('place');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-1 bg-transparent border-0 transition-colors cursor-pointer ${
                viewMode === 'place'
                  ? 'text-[#ffffff]'
                  : 'text-[#555555] hover:text-[#cccccc]'
              }`}
              title="Place"
              aria-label="Place"
            >
              <SolidPlacePinIcon className="w-[18px] h-[18px]" />
            </button>

            {/* ABOUT (Heart) */}
            <button
              type="button"
              onClick={() => {
                setViewMode('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-1 bg-transparent border-0 transition-colors cursor-pointer ${
                viewMode === 'about'
                  ? 'text-[#ffffff]'
                  : 'text-[#555555] hover:text-[#cccccc]'
              }`}
              title="About"
              aria-label="About"
            >
              <SolidHeartIcon className="w-[18px] h-[18px]" />
            </button>
          </nav>

          {/* Right: Borderless & Backgroundless Export / Import JSON Actions */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs shrink-0">
            <button
              type="button"
              onClick={handleExportJson}
              title="Export dishes.json"
              aria-label="Export JSON"
              className="inline-flex items-center gap-1.5 p-1 bg-transparent border-0 text-[#888888] hover:text-[#ffffff] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-[18px] h-[18px]" />
              <span className="hidden sm:inline font-medium">
                {jsonActionLabel === 'exported' ? 'Exported' : 'Export'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import dishes.json"
              aria-label="Import JSON"
              className="inline-flex items-center gap-1.5 p-1 bg-transparent border-0 text-[#888888] hover:text-[#ffffff] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-[18px] h-[18px]" />
              <span className="hidden sm:inline font-medium">
                {jsonActionLabel === 'imported'
                  ? 'Imported'
                  : jsonActionLabel === 'error'
                    ? 'Invalid'
                    : 'Import'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJsonChange}
              className="hidden"
            />
          </div>
        </div>
      </header>
      {/* Fixed Header Spacer */}
      <div className="h-14 w-full shrink-0" />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full">
        {viewMode === 'home' && (
          <HomeView
            key={homeKey}
            onNavigate={(mode) => {
              setViewMode(mode);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {viewMode === 'year' && (
          <YearView
            dishes={dishes}
            onSelectDish={handleSelectDish}
            onAddNewAtDate={(d) => handleAddNewDish(d)}
            onNavigateToDish={handleNavigateToDish}
          />
        )}

        {viewMode === 'dish' && (
          <DishView
            dishes={dishes}
            onSelectDish={handleSelectDish}
            onAddNewDish={() => handleAddNewDish()}
            onNavigateToYear={handleNavigateToYear}
            onNavigateToPlace={handleNavigateToPlace}
          />
        )}

        {viewMode === 'place' && (
          <PlaceView
            dishes={dishes}
            onSelectDish={handleSelectDish}
            selectedCityName={selectedCityName}
            selectedCookedAt={selectedCookedAt}
            onNavigateToDish={handleNavigateToDish}
          />
        )}

        {viewMode === 'about' && <AboutView />}
      </main>

      {/* Modal for Dish Inspection & Editing */}
      <DishDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dish={selectedDish}
        initialDate={initialModalDate}
        onSave={handleSaveDish}
        onDelete={handleDeleteDish}
        onNavigateToYear={handleNavigateToYear}
        onNavigateToPlace={handleNavigateToPlace}
      />
    </div>
  );
}
