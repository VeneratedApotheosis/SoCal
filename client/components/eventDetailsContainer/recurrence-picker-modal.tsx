import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView, useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useUIContext } from '../contexts/ui-context';
import { recurrenceStyles } from './eventDetailsStyles';
import { CustomRecurrenceModal } from './recurrence-custom-modal';

// ─── Recurrence options ───────────────────────────────────────────────────────

export interface RecurrenceOption {
  label: string;
  value: string[] | null;
  isCustom?: boolean;
}

export const RECURRENCE_OPTIONS: RecurrenceOption[] = [
  { label: 'Does not repeat', value: null },
  { label: 'Every day', value: ['RRULE:FREQ=DAILY'] },
  { label: 'Every week', value: ['RRULE:FREQ=WEEKLY'] },
  { label: 'Every 2 weeks', value: ['RRULE:FREQ=WEEKLY;INTERVAL=2'] },
  { label: 'Every month', value: ['RRULE:FREQ=MONTHLY'] },
  { label: 'Every year', value: ['RRULE:FREQ=YEARLY'] },
  { label: 'Custom…', value: null, isCustom: true },
];

export function getRecurrenceLabel(recurrence: string[] | null | undefined): string {
  if (!recurrence || recurrence.length === 0) return 'Does not repeat';
  const match = RECURRENCE_OPTIONS.find((o) => o.value && JSON.stringify(o.value) === JSON.stringify(recurrence));
  if (match) return match.label;
  const rrule = recurrence[0];
  if (rrule.includes('INTERVAL=2') && rrule.includes('WEEKLY')) return 'Every 2 weeks';
  if (rrule.includes('YEARLY')) return 'Every year';
  return 'Custom repeat';
}

function isOptionSelected(option: RecurrenceOption, current: string[] | null | undefined): boolean {
  if (option.isCustom) {
    const found = RECURRENCE_OPTIONS.find((o) => JSON.stringify(o.value) === JSON.stringify(current ?? null));
    if (found) return false;
    return true;
  }
  return JSON.stringify(option.value) === JSON.stringify(current ?? null);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RecurrencePickerModalProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  current: string[] | null | undefined;
  onSelect: (value: string[] | null) => void;
  onCustom: () => void;
}

export const RecurrencePickerModal = ({ sheetRef, current, onSelect, onCustom }: RecurrencePickerModalProps) => {
  const snapPoints = useMemo(() => ['50%'], []);
  const { theme } = useUIContext();
  const styles = recurrenceStyles(theme.isDark);
  const ruleString = current ? current[0] : '';

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />,
    [],
  );

  const customAnimationConfigs = useBottomSheetTimingConfigs({
    duration: 500, // Decrease this number to make it even faster
    easing: Easing.out(Easing.exp),
  });

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        stackBehavior="push"
        handleStyle={styles.sheetHandle}
        handleIndicatorStyle={styles.sheetIndicator}
        backdropComponent={renderBackdrop}
        animationConfigs={customAnimationConfigs}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Repeat</Text>

          {RECURRENCE_OPTIONS.map((option, idx) => {
            const selected = isOptionSelected(option, current);
            return (
              <View key={option.label}>
                <TouchableOpacity
                  style={[styles.optionRow, selected && styles.optionSelected]}
                  activeOpacity={0.6}
                  onPress={() => {
                    if (option.isCustom) {
                      setIsVisible(true);
                    } else {
                      onSelect(option.value);
                      sheetRef.current?.dismiss();
                    }
                  }}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionSelected]}>{option.label}</Text>
                  {selected && (
                    <Ionicons name={'checkmark-outline'} size={16} color={theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </BottomSheetView>
      </BottomSheetModal>
      <CustomRecurrenceModal
        isOpen={isVisible}
        onClose={() => setIsVisible(false)}
        rruleString={ruleString}
        onSave={(newRuleString: string) => {
          onSelect([newRuleString]);
        }}
      />
    </>
  );
};
