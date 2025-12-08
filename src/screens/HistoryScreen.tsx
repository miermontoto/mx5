import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { EditEntryModal } from '../components/EditEntryModal';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { COLORS, SHADOWS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { MileageEntry } from '../types';
import { deleteEntry, loadData } from '../utils/storage';

export const HistoryScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { settings } = useSettings();
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MileageEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const headerOpacity = useSharedValue(1);
  const screenWidth = Dimensions.get('window').width;
  const swipeableRefs = React.useRef<{ [key: string]: Swipeable | null }>({});

  const dateLocale = i18n.language === 'es' ? es : enUS;

  const fetchData = async () => {
    const data = await loadData();
    const currentYear = new Date().getFullYear();
    const yearData = data.find(d => d.year === currentYear);
    if (yearData) {
      setEntries([...yearData.entries].reverse());
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleDelete = async (item: MileageEntry) => {
    Alert.alert(
      t('history.deleteTitle'),
      t('history.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(item.id);
            fetchData();
          },
        },
      ]
    );
  };

  const handleEdit = (item: MileageEntry) => {
    setEditingEntry(item);
    setShowEditModal(true);
  };

  const renderRightActions = (item: MileageEntry) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={() => {
            swipeableRefs.current[item.id]?.close();
            handleEdit(item);
          }}
        >
          <Ionicons name="pencil" size={20} color="white" />
          <Text style={styles.swipeActionText}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => {
            swipeableRefs.current[item.id]?.close();
            handleDelete(item);
          }}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.swipeActionText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEntry = ({ item, index }: { item: MileageEntry; index: number }) => {
    const prevEntry = index < entries.length - 1 ? entries[index + 1] : null;
    const kmDifference = prevEntry ? item.totalKilometers - prevEntry.totalKilometers : 0;

    return (
      <Animated.View
        entering={SlideInRight.delay(index * 50).springify()}
        layout={Layout.springify()}
      >
        <Swipeable
          ref={(ref) => {
            swipeableRefs.current[item.id] = ref;
          }}
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
        >
          <View style={styles.entryCard}>
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.entryGradient}
            >
              {/* Date Badge */}
              <View style={[styles.dateBadge, { backgroundColor: settings.accentColor + '15' }]}>
                <Text style={[styles.dayNumber, { color: settings.accentColor }]}>
                  {format(new Date(item.date), 'd')}
                </Text>
                <Text style={styles.monthText}>
                  {format(new Date(item.date), 'MMM', { locale: dateLocale }).toUpperCase()}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.entryContent}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>
                    {format(new Date(item.date), i18n.language === 'es' ? "EEEE, d 'de' MMMM" : "EEEE, MMMM d", { locale: dateLocale })}
                  </Text>
                  <Text style={styles.entryTime}>
                    {format(new Date(item.date), 'HH:mm')}
                  </Text>
                </View>

                <View style={styles.kmRow}>
                  <Text style={styles.entryKm}>
                    {item.totalKilometers.toLocaleString(i18n.language)}
                    <Text style={styles.kmUnit}> km</Text>
                  </Text>
                  {prevEntry && kmDifference > 0 && (
                    <View style={[styles.kmDifferenceContainer, { backgroundColor: settings.accentColor + '20' }]}>
                      <Text style={[styles.kmDifference, { color: settings.accentColor }]}>
                        +{kmDifference.toLocaleString(i18n.language)}
                      </Text>
                    </View>
                  )}
                </View>

                {item.note && (
                  <Text style={styles.entryNote} numberOfLines={2}>
                    {item.note}
                  </Text>
                )}
              </View>

              {/* Decorative element */}
              <View style={[styles.decorativeLine, { backgroundColor: settings.accentColor + '30' }]} />
            </LinearGradient>
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={styles.emptyContainer}
    >
      <View style={[styles.emptyIcon, { backgroundColor: settings.accentColor + '10' }]}>
        <Ionicons name="bar-chart-outline" size={40} color={settings.accentColor} />
      </View>
      <Text style={styles.emptyText}>{t('history.noRecords')}</Text>
      <Text style={styles.emptySubtext}>
        {t('history.noRecordsHint')}
      </Text>
    </Animated.View>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    headerOpacity.value = withTiming(offsetY > 50 ? 0.7 : 1, { duration: 200 });
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    const sortedEntries = [...entries].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const startDate = new Date(settings.startDate);
    const today = new Date();
    const timeSpan = today.getTime() - startDate.getTime();

    // Create 10 evenly spaced points across the time range
    const pointCount = 10;
    const labels: string[] = [];
    const actualKm: number[] = [];
    const targetKm: number[] = [];

    for (let i = 0; i < pointCount; i++) {
      const progress = i / (pointCount - 1);
      const pointTime = startDate.getTime() + (timeSpan * progress);
      const pointDate = new Date(pointTime);

      // Format label
      labels.push(format(pointDate, 'd/M'));

      // Calculate target km for this date (linear progression)
      // Target should be: initialKm + (progress * yearlyLimit)
      const daysPassed = Math.max(0, (pointTime - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = 365; // One year
      const progressRatio = Math.min(1, daysPassed / totalDays);
      const targetValue = (settings.initialKilometers || 0) + (progressRatio * settings.yearlyLimit);
      targetKm.push(Math.round(targetValue));

      // Find actual km at this date
      let kmValue = settings.initialKilometers || 0;

      // Find the latest entry before or at this date
      for (const entry of sortedEntries) {
        if (new Date(entry.date).getTime() <= pointTime) {
          kmValue = entry.totalKilometers;
        } else {
          break;
        }
      }

      actualKm.push(kmValue);
    }

    return {
      labels,
      datasets: [
        {
          data: actualKm,
          color: (opacity = 1) => settings.accentColor,
          strokeWidth: 3,
        },
        {
          data: targetKm,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.3})`,
          strokeWidth: 2,
          withDots: false,
        },
      ],
      legend: [t('history.actual'), t('history.target')],
    };
  }, [entries, settings, t]);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.title}>{t('history.title')}</Text>
          <View style={styles.yearBadge}>
            <Text style={[styles.yearText, { color: settings.accentColor }]}>
              {new Date().getFullYear()}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* List with Chart Header */}
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          chartData ? (
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.chartContainer}
            >
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>{t('history.chartTitle')}</Text>
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: settings.accentColor }]} />
                    <Text style={styles.legendText}>{t('history.actual')}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
                    <Text style={styles.legendText}>{t('history.target')}</Text>
                  </View>
                </View>
              </View>
              <LineChart
                data={chartData}
                width={screenWidth - 60}
                height={220}
                yAxisSuffix=" km"
                fromZero={true}
                chartConfig={{
                  backgroundColor: COLORS.surface,
                  backgroundGradientFrom: COLORS.surface,
                  backgroundGradientTo: COLORS.surfaceLight,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => COLORS.textSecondary,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: settings.accentColor,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '5,5',
                    stroke: COLORS.border,
                    strokeOpacity: 0.3,
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                segments={4}
              />
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={renderEmpty}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={settings.accentColor}
            colors={[settings.accentColor]}
          />
        }
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => navigation.navigate('AddEntry')} />

      {/* Edit Modal */}
      <EditEntryModal
        visible={showEditModal}
        entry={editingEntry}
        onClose={() => {
          setShowEditModal(false);
          setEditingEntry(null);
        }}
        onSave={() => {
          fetchData();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: 12,
  },
  yearBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.medium,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  entryCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  entryGradient: {
    flexDirection: 'row',
    padding: 20,
    position: 'relative',
  },
  dateBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  monthText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    flex: 1,
  },
  entryTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 8,
  },
  kmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  entryKm: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1,
  },
  kmUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  kmDifferenceContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  kmDifference: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  decorativeLine: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
    marginLeft: 1,
  },
  editAction: {
    backgroundColor: '#4CAF50',
  },
  deleteAction: {
    backgroundColor: COLORS.error,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
