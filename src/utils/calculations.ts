import { addYears, differenceInDays } from "date-fns";
import { YEARLY_LIMIT } from "../constants";
import { AppSettings, YearlyData } from "../types";

const DAYS_IN_YEAR = 365;

export const getCurrentYearData = (data: YearlyData[]): YearlyData | null => {
  const currentYear = new Date().getFullYear();
  return data.find((d) => d.year === currentYear) || null;
};

export const getTotalKilometers = (yearData: YearlyData): number => {
  if (!yearData.entries.length) return 0;
  // Get latest odometer reading
  return Math.max(...yearData.entries.map((e) => e.totalKilometers));
};

export const getDailyTarget = (yearlyLimit: number = YEARLY_LIMIT): number =>
  yearlyLimit / DAYS_IN_YEAR;

export const getTargetForToday = (settings: AppSettings): number => {
  const today = new Date();
  const startDate = new Date(settings.startDate);
  const endDate = addYears(startDate, 1);

  if (today < startDate) return 0;
  if (today > endDate) return settings.yearlyLimit;

  const totalDays = differenceInDays(endDate, startDate);
  const daysPassed = differenceInDays(today, startDate) + 1;

  // Linear progression: what you should have driven by today
  return (settings.yearlyLimit * daysPassed) / totalDays;
};

export const getTargetForDate = (date: Date, settings: AppSettings): number => {
  const startDate = new Date(settings.startDate);
  const endDate = addYears(startDate, 1);

  if (date < startDate) return 0;
  if (date > endDate) return settings.yearlyLimit;

  const totalDays = differenceInDays(endDate, startDate);
  const daysPassed = differenceInDays(date, startDate) + 1;

  // Linear progression: what you should have driven by that date
  return (settings.yearlyLimit * daysPassed) / totalDays;
};

export const getRemainingDays = (settings: AppSettings): number => {
  const today = new Date();
  const endDate = addYears(new Date(settings.startDate), 1);

  return Math.max(0, differenceInDays(endDate, today));
};

export const getRemainingKilometers = (
  yearData: YearlyData,
  yearlyLimit: number = YEARLY_LIMIT
): number => yearlyLimit - getTotalKilometers(yearData);

export const getDailyAverage = (yearData: YearlyData): number => {
  if (yearData.entries.length < 2) return 0;

  const sorted = [...yearData.entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const daysBetween = differenceInDays(
    new Date(last.date),
    new Date(first.date)
  );

  if (daysBetween === 0) return 0;

  const kmDriven = last.totalKilometers - first.totalKilometers;
  return kmDriven / daysBetween;
};

export const getProjectedTotal = (
  yearData: YearlyData,
  settings: AppSettings
): number => {
  if (!yearData.entries.length) return 0;

  const total = getTotalKilometers(yearData);
  const today = new Date();
  const startDate = new Date(settings.startDate);
  const endDate = addYears(startDate, 1);

  if (today < startDate) return 0;

  const daysPassed = differenceInDays(today, startDate) + 1;
  const totalDays = differenceInDays(endDate, startDate);

  // Project current pace to full year
  return (total / daysPassed) * totalDays;
};

export const getVarianceFromTarget = (
  yearData: YearlyData,
  settings: AppSettings
): number => {
  const actual = getTotalKilometers(yearData);
  const target = getTargetForToday(settings);

  // Positive = ahead of schedule (drove too much)
  // Negative = behind schedule (can drive more)
  return actual - target;
};

export const getRequiredDailyAverage = (
  yearData: YearlyData,
  settings: AppSettings
): number => {
  const remainingKm = getRemainingKilometers(yearData, settings.yearlyLimit);
  const remainingDays = getRemainingDays(settings);

  if (remainingDays <= 0 || remainingKm <= 0) return 0;

  // How many km/day needed to reach exactly yearlyLimit km by year end
  return remainingKm / remainingDays;
};
