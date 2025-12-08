import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { MainCard } from '../components/MainCard';
import { MainStat } from '../components/MainStat';
import { SecondaryStat } from '../components/SecondaryStat';
import { COLORS, FONTS, FONT_WEIGHTS, TEXT_STYLES } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { YearlyData } from '../types';
import {
  getCurrentYearData,
  getDailyAverage,
  getProjectedTotal,
  getRemainingDays,
  getRemainingKilometers,
  getRequiredDailyAverage,
  getTargetForToday,
  getTotalKilometers,
  getVarianceFromTarget,
} from '../utils/calculations';
import { getColorForDailyAverage, getColorForValue } from '../utils/colors';
import { loadData } from '../utils/storage';

export const DashboardScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { settings } = useSettings();
  const [yearData, setYearData] = useState<YearlyData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const data = await loadData();
    setYearData(getCurrentYearData(data));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  // Calculate all metrics
  const totalKm = yearData ? getTotalKilometers(yearData) : 0;
  const targetKm = getTargetForToday(settings);
  const variance = yearData ? getVarianceFromTarget(yearData, settings) : 0;
  const remainingKm = yearData ? getRemainingKilometers(yearData, settings.yearlyLimit) : settings.yearlyLimit;
  const dailyAvg = yearData ? getDailyAverage(yearData) : 0;
  const projectedTotal = yearData ? getProjectedTotal(yearData, settings) : 0;
  const remainingDays = getRemainingDays(settings);
  const requiredDailyAvg = yearData ? getRequiredDailyAverage(yearData, settings) : 0;
  const percentage = (totalKm / settings.yearlyLimit) * 100;

  // Calculate colors
  const startDate = new Date(settings.startDate);
  const daysPassedRatio = differenceInDays(new Date(), startDate) / 365;
  const varianceColor = getColorForValue(variance, 'variance', settings.yearlyLimit);
  const projectedColor = getColorForValue(projectedTotal, 'projected', settings.yearlyLimit);
  const dailyAvgColor = getColorForDailyAverage(dailyAvg, daysPassedRatio, settings.yearlyLimit);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.text} />}
      >
        <Text style={styles.header}>{t('dashboard.header')}</Text>

        <MainCard totalKm={totalKm} percentage={percentage} />

        {/* Primary stats */}
        <View style={styles.primaryStats}>
          <MainStat
            label={t('dashboard.difference')}
            value={variance}
            unit="km"
            subtitle={t('dashboard.target', { value: targetKm.toFixed(0) })}
            color={varianceColor}
            showSign
          />
          <View style={styles.divider} />
          <MainStat
            label={t('dashboard.projection')}
            value={projectedTotal}
            unit="km"
            color={projectedColor}
            subtitle={t('dashboard.annualEstimate')}
          />
        </View>

        {/* Secondary stats grid */}
        <View style={styles.grid}>
          <SecondaryStat
            value={requiredDailyAvg.toFixed(1)}
            label={t('dashboard.requiredDaily')}
          />
          <SecondaryStat
            value={dailyAvg.toFixed(1)}
            label={t('dashboard.averageDaily')}
            color={dailyAvgColor}
          />
          <SecondaryStat
            value={remainingKm}
            label={t('dashboard.remainingKm')}
          />
          <SecondaryStat
            value={remainingDays}
            label={t('dashboard.remainingDays')}
          />
        </View>

      </ScrollView>

      <FloatingActionButton onPress={() => navigation.navigate('AddEntry')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.5,
    letterSpacing: 3,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    ...TEXT_STYLES.webTextStyle,
  },
  primaryStats: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  divider: {
    display: 'none',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  carContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
