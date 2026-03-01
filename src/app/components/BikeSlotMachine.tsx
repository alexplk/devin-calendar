'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SlotItem } from '@/services/slot-machine-service';

interface BikeSlotMachineProps {
  effortItems: SlotItem[];
  tricksItems: SlotItem[];
  wildcardItems: SlotItem[];
  selectedEffortId?: string;
  selectedTricksId?: string;
  selectedWildcardId?: string;
  onSpin?: (result: { effort: string; tricks: string; wildcard: string }) => void;
}

interface ReelProps {
  items: SlotItem[];
  selectedId?: string;
  spinning: boolean;
  duration: number;
  label: string;
}

function Reel({ items, selectedId, spinning, duration, label }: ReelProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Initialize to selected item or first item
    if (selectedId) {
      const index = items.findIndex(item => item.id === selectedId);
      if (index !== -1) {
        setDisplayIndex(index);
      }
    }
  }, [selectedId, items]);

  useEffect(() => {
    if (!spinning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Find target index
    const targetIndex = selectedId 
      ? items.findIndex(item => item.id === selectedId)
      : Math.floor(Math.random() * items.length);

    const finalTarget = targetIndex !== -1 ? targetIndex : 0;
    
    // Animation parameters
    const totalSpins = 3; // Number of full rotations
    const totalSteps = totalSpins * items.length + finalTarget;
    
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentStep = Math.floor(eased * totalSteps);
      const currentIndex = currentStep % items.length;
      
      setDisplayIndex(currentIndex);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayIndex(finalTarget);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spinning, duration, items, selectedId]);

  const currentItem = items[displayIndex] || items[0];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="relative w-24 h-32 bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-300 rounded-lg border-4 border-yellow-600 shadow-lg overflow-hidden">
        {/* Decorative border */}
        <div className="absolute inset-0 border-2 border-yellow-500 rounded-md m-1 pointer-events-none"></div>
        
        {/* Content area */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 ${spinning ? 'blur-sm' : ''} transition-all duration-200`}>
          <div className="text-4xl mb-1">{currentItem.emoji}</div>
          <div className="text-xs font-bold text-gray-800 text-center leading-tight">
            {currentItem.label}
          </div>
        </div>

        {/* Spinning indicator */}
        {spinning && (
          <div className="absolute inset-0 flex items-center justify-center bg-yellow-200/50">
            <div className="text-2xl animate-spin">🎰</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BikeSlotMachine({
  effortItems,
  tricksItems,
  wildcardItems,
  selectedEffortId,
  selectedTricksId,
  selectedWildcardId,
  onSpin,
}: BikeSlotMachineProps) {
  const [spinning, setSpinning] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [currentEffortId, setCurrentEffortId] = useState(selectedEffortId);
  const [currentTricksId, setCurrentTricksId] = useState(selectedTricksId);
  const [currentWildcardId, setCurrentWildcardId] = useState(selectedWildcardId);

  // Auto-spin on mount if we have preselected values
  useEffect(() => {
    if (selectedEffortId && selectedTricksId && selectedWildcardId) {
      // Small delay then auto-spin to show animation
      const timer = setTimeout(() => {
        handleSpin(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Only on mount

  const handleSpin = (useSelected: boolean = false) => {
    if (spinning) return;

    setLeverPulled(true);
    setSpinning(true);

    // If not using selected values, randomize
    if (!useSelected) {
      setCurrentEffortId(undefined);
      setCurrentTricksId(undefined);
      setCurrentWildcardId(undefined);
    }

    // Stop spinning after animation completes
    setTimeout(() => {
      setSpinning(false);
      setLeverPulled(false);

      // Notify parent of result if callback provided
      if (onSpin) {
        const effortId = useSelected && selectedEffortId 
          ? selectedEffortId 
          : effortItems[Math.floor(Math.random() * effortItems.length)].id;
        
        const tricksId = useSelected && selectedTricksId
          ? selectedTricksId
          : tricksItems[Math.floor(Math.random() * tricksItems.length)].id;
        
        const wildcardId = useSelected && selectedWildcardId
          ? selectedWildcardId
          : wildcardItems[Math.floor(Math.random() * wildcardItems.length)].id;

        if (!useSelected) {
          setCurrentEffortId(effortId);
          setCurrentTricksId(tricksId);
          setCurrentWildcardId(wildcardId);
        }

        onSpin({
          effort: effortId,
          tricks: tricksId,
          wildcard: wildcardId,
        });
      }
    }, 2500);
  };

  return (
    <section className="w-full flex justify-center mb-10">
      <div className="relative flex flex-col items-center w-full max-w-2xl rounded-3xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 shadow-2xl px-8 pt-6 pb-10 border-4 border-yellow-600 overflow-hidden">
        {/* Decorative badge */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full border-2 border-yellow-400 shadow-lg">
          <span className="text-2xl animate-bounce">🎰</span>
          <span className="text-xs font-black text-yellow-100 tracking-widest uppercase">Ride Randomizer</span>
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-white drop-shadow-lg tracking-wide">
            🔥 BIKE SLOT MACHINE 🔥
          </h2>
          <p className="text-sm text-yellow-100 mt-1">Pull the lever to discover your ride!</p>
        </div>

        {/* Slot Machine Container */}
        <div className="bg-gradient-to-b from-red-700 to-red-800 rounded-2xl p-6 border-4 border-yellow-500 shadow-inner mb-4">
          <div className="flex justify-center items-center gap-6">
            {/* Reels */}
            <Reel
              items={effortItems}
              selectedId={currentEffortId}
              spinning={spinning}
              duration={2000}
              label="Effort"
            />
            <Reel
              items={tricksItems}
              selectedId={currentTricksId}
              spinning={spinning}
              duration={2200}
              label="Tricks"
            />
            <Reel
              items={wildcardItems}
              selectedId={currentWildcardId}
              spinning={spinning}
              duration={2400}
              label="Wildcard"
            />
          </div>
        </div>

        {/* Lever */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleSpin(false)}
            disabled={spinning}
            className={`relative group ${spinning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label="Pull lever to spin"
          >
            {/* Lever handle */}
            <div className={`flex flex-col items-center transition-transform duration-300 ${leverPulled ? 'translate-y-12' : 'translate-y-0'}`}>
              {/* Ball */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 border-yellow-400 shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                <span className="text-2xl">🎲</span>
              </div>
              {/* Stick */}
              <div className="w-2 h-20 bg-gradient-to-b from-gray-700 to-gray-900 border-2 border-gray-600 rounded-full"></div>
            </div>
          </button>
          
          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-yellow-100">
              {spinning ? '🎪 SPINNING... 🎪' : '👇 Pull the lever! 👇'}
            </p>
          </div>
        </div>

        {/* Decorative lights */}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-yellow-300 shadow-lg animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}
