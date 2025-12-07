import { COLORS, YEARLY_LIMIT } from "../constants";

export const getColorForValue = (
  value: number,
  type: "variance" | "total" | "projected" | "remaining",
  yearlyLimit: number = YEARLY_LIMIT
): string => {
  switch (type) {
    case "variance":
      // Negative = behind schedule (safe to drive more) = green
      // Positive = ahead of schedule (should drive less) = red
      if (value < -100) return COLORS.excellent;
      if (value < 0) return COLORS.good;
      if (value < 50) return COLORS.neutral;
      if (value < 100) return COLORS.warning;
      return COLORS.danger;

    case "total":
      const percent = (value / yearlyLimit) * 100;
      if (percent < 70) return COLORS.excellent;
      if (percent < 85) return COLORS.good;
      if (percent < 95) return COLORS.neutral;
      if (percent < 100) return COLORS.warning;
      return COLORS.danger;

    case "projected":
      // Projected annual total vs limit
      if (value < yearlyLimit * 0.9) return COLORS.excellent;
      if (value < yearlyLimit * 0.95) return COLORS.good;
      if (value < yearlyLimit) return COLORS.neutral;
      if (value < yearlyLimit * 1.05) return COLORS.warning;
      return COLORS.danger;

    case "remaining":
      const remainPercent = (value / yearlyLimit) * 100;
      if (remainPercent > 40) return COLORS.excellent;
      if (remainPercent > 25) return COLORS.good;
      if (remainPercent > 15) return COLORS.neutral;
      if (remainPercent > 5) return COLORS.warning;
      return COLORS.danger;

    default:
      return COLORS.text;
  }
};

export const getColorForDailyAverage = (avg: number, daysPassedRatio: number, yearlyLimit: number = YEARLY_LIMIT): string => {
  if (avg === 0) return COLORS.textSecondary;

  const targetDaily = yearlyLimit / 365;
  // Allow slightly higher average early in the year
  const adjustedTarget = targetDaily * (1 + (1 - daysPassedRatio) * 0.1);

  const ratio = avg / adjustedTarget;
  if (ratio < 0.85) return COLORS.excellent;
  if (ratio < 0.95) return COLORS.good;
  if (ratio < 1.05) return COLORS.neutral;
  if (ratio < 1.15) return COLORS.warning;
  return COLORS.danger;
};