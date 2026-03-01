import bikeSlotItems from '@/assets/bike-slot-items.json';

export interface SlotItem {
  id: string;
  label: string;
  emoji: string;
}

export interface SlotMachineData {
  effort: SlotItem[];
  tricks: SlotItem[];
  wildcard: SlotItem[];
}

// Simple seeded random number generator
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get pseudo-random selection based on date
export function getDateBasedSelection(date: Date): {
  effortId: string;
  tricksId: string;
  wildcardId: string;
} {
  // Create a seed from the date
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const seed = year * 10000 + month * 100 + day;

  const data = bikeSlotItems as SlotMachineData;

  // Generate pseudo-random indices
  const effortIndex = Math.floor(seededRandom(seed) * data.effort.length);
  const tricksIndex = Math.floor(seededRandom(seed + 1) * data.tricks.length);
  const wildcardIndex = Math.floor(seededRandom(seed + 2) * data.wildcard.length);

  return {
    effortId: data.effort[effortIndex].id,
    tricksId: data.tricks[tricksIndex].id,
    wildcardId: data.wildcard[wildcardIndex].id,
  };
}

export function getSlotMachineData(): SlotMachineData {
  return bikeSlotItems as SlotMachineData;
}

export function getItemById(items: SlotItem[], id: string): SlotItem | undefined {
  return items.find(item => item.id === id);
}
