import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig, AppSettings, MileageEntry, YearlyData } from "../types";

const STORAGE_KEY = "mx5_mileage_data";
const CONFIG_KEY = "mx5_app_config";
const SETTINGS_KEY = "mx5_app_settings";

export const loadData = async (): Promise<YearlyData[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonData ? JSON.parse(jsonData) : [];
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
};

export const saveData = async (data: YearlyData[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

export const addEntry = async (entry: MileageEntry): Promise<void> => {
  const data = await loadData();
  const year = new Date(entry.date).getFullYear();

  let yearData = data.find((d) => d.year === year);
  if (!yearData) {
    yearData = {
      year,
      startDate: new Date(year, 0, 1).toISOString(),
      entries: [],
    };
    data.push(yearData);
  }

  yearData.entries.push(entry);
  yearData.entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  await saveData(data);
};

export const getLatestReading = async (): Promise<number> => {
  const data = await loadData();
  const currentYear = new Date().getFullYear();
  const yearData = data.find((d) => d.year === currentYear);

  if (!yearData || yearData.entries.length === 0) {
    return 0;
  }

  const sortedEntries = [...yearData.entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sortedEntries[0].totalKilometers;
};

export const loadConfig = async (): Promise<AppConfig | null> => {
  try {
    const jsonData = await AsyncStorage.getItem(CONFIG_KEY);
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
};

export const saveConfig = async (config: AppConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving config:", error);
  }
};

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  yearlyLimit: 10000,
  accentColor: '#CC0000',
  startDate: new Date().toISOString(),
  initialKilometers: 0,
  theme: 'dark',
  language: 'es',
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const jsonData = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonData ? { ...DEFAULT_SETTINGS, ...JSON.parse(jsonData) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading settings:", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const updateEntry = async (entryId: string, updatedEntry: Partial<MileageEntry>): Promise<void> => {
  const data = await loadData();
  const year = new Date(updatedEntry.date || new Date()).getFullYear();
  
  const yearData = data.find((d) => d.year === year);
  if (!yearData) return;
  
  const entryIndex = yearData.entries.findIndex((e) => e.id === entryId);
  if (entryIndex === -1) return;
  
  yearData.entries[entryIndex] = {
    ...yearData.entries[entryIndex],
    ...updatedEntry,
  };
  
  // Re-sort entries after update
  yearData.entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  await saveData(data);
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  const data = await loadData();
  
  for (const yearData of data) {
    const initialLength = yearData.entries.length;
    yearData.entries = yearData.entries.filter((e) => e.id !== entryId);
    
    if (yearData.entries.length < initialLength) {
      await saveData(data);
      return;
    }
  }
};
