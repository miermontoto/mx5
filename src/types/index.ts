export interface MileageEntry {
  id: string;
  date: string;
  totalKilometers: number;
  note?: string;
}

export interface YearlyData {
  year: number;
  startDate: string;
  entries: MileageEntry[];
}

export interface AppConfig {
  startDate: string; // ISO date when the 10,000km year starts
  initialKilometers?: number; // Optional initial odometer reading
}

export interface AppSettings {
  yearlyLimit: number; // Annual kilometer limit
  accentColor: string; // Primary accent color
  startDate: string; // ISO date when the yearly period starts
  initialKilometers?: number; // Optional initial odometer reading
  theme?: 'dark' | 'light' | 'auto'; // App theme
  language?: 'es' | 'en'; // App language
}