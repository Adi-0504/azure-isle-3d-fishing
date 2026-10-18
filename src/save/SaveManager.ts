import { SupportedLanguage } from '../../data/localization/i18n';

export interface PlayerCustomization {
  name: string;
  origin: string;
  hairStyle: 'spiky' | 'flowing' | 'cap';
  hairColor: string;
  skinTone: string;
  outfitColor: string;
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
  size?: number; // for caught creatures
  rarity?: number;
}

export interface CreatureRecord {
  discovered: boolean;
  caughtCount: number;
  maxSizeCm: number;
  firstCaughtTimestamp: number;
}

export interface GameSaveData {
  version: string;
  timestamp: number;
  language: SupportedLanguage;
  customization: PlayerCustomization;
  playerPos: { x: number; y: number; z: number };
  playerYaw: number;
  timeOfDayMinutes: number; // 0 to 1440
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weather: 'sunny' | 'cloudy' | 'rainy';
  coins: number;
  maxBagSlots: number;
  inventory: InventorySlot[];
  equippedRodId: string;
  equippedBaitId: string | null;
  stamina: number;
  catalog: Record<string, CreatureRecord>;
  unlockedBiomes: string[];
  activeQuests: { questId: string; progress: number }[];
  completedQuests: string[];
  cabinTier: number; // 0: tent, 1: cabin, 2: cabin + veranda
  homeAquariumCreatures: string[];
  museumDonatedCreatures: string[];
  museumTier: number; // 0, 1, 2, 3
  settings: {
    bgmVolume: number;
    sfxVolume: number;
    bgmMuted: boolean;
    sfxMuted: boolean;
  };
}

const SAVE_STORAGE_KEY = 'azure_isle_save_data_v1';

export class SaveManager {
  private static instance: SaveManager;

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public createDefaultSave(name = 'Leo', origin = 'Taiwan'): GameSaveData {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      language: 'zh-TW',
      customization: {
        name: name,
        origin: origin,
        hairStyle: 'cap',
        hairColor: '#4A3728',
        skinTone: '#FAD6B8',
        outfitColor: '#1E6091'
      },
      playerPos: { x: 0, y: 1.5, z: 0 },
      playerYaw: 0,
      timeOfDayMinutes: 480, // 8:00 AM bright morning
      season: 'spring',
      weather: 'sunny',
      coins: 0, // starts at 0 strictly adhering to spec #28
      maxBagSlots: 12, // standard starting capacity
      inventory: [],
      equippedRodId: 'rod_basic',
      equippedBaitId: null,
      stamina: 100,
      catalog: {},
      unlockedBiomes: ['camp', 'stream'],
      activeQuests: [
        { questId: 'quest_first_catch', progress: 0 },
        { questId: 'quest_three_dot_salmon', progress: 0 }
      ],
      completedQuests: [],
      cabinTier: 0,
      homeAquariumCreatures: [],
      museumDonatedCreatures: [],
      museumTier: 0,
      settings: {
        bgmVolume: 0.5,
        sfxVolume: 0.7,
        bgmMuted: false,
        sfxMuted: false
      }
    };
  }

  public saveToStorage(data: GameSaveData): boolean {
    try {
      data.timestamp = Date.now();
      const serialized = JSON.stringify(data);
      localStorage.setItem(SAVE_STORAGE_KEY, serialized);
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }

  public loadFromStorage(): GameSaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (this.validateSave(parsed)) {
        return parsed as GameSaveData;
      }
      return null;
    } catch (e) {
      console.error('Error loading save:', e);
      return null;
    }
  }

  public hasSave(): boolean {
    return !!localStorage.getItem(SAVE_STORAGE_KEY);
  }

  public validateSave(data: unknown): data is GameSaveData {
    if (!data || typeof data !== 'object') return false;
    const d = data as Partial<GameSaveData>;
    if (typeof d.coins !== 'number') return false;
    if (!d.customization || typeof d.customization.name !== 'string') return false;
    if (!Array.isArray(d.inventory)) return false;
    if (!d.equippedRodId) return false;
    if (!d.catalog || typeof d.catalog !== 'object') return false;
    return true;
  }

  public exportSaveToFile(data: GameSaveData) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AzureIsle_Save_${data.customization.name}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public importSaveFromFile(file: File): Promise<GameSaveData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (this.validateSave(parsed)) {
            resolve(parsed);
          } else {
            reject(new Error('Invalid save schema format'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File read failure'));
      reader.readAsText(file);
    });
  }
}
