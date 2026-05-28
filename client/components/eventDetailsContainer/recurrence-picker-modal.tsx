import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  if (option.isCustom) return false;
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

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      stackBehavior="push"
      handleStyle={styles.sheetHandle}
      handleIndicatorStyle={styles.sheetIndicator}
    >
      <BottomSheetView style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>Repeat</Text>

        {RECURRENCE_OPTIONS.map((option, idx) => {
          const selected = isOptionSelected(option, current);
          const isLast = idx === RECURRENCE_OPTIONS.length - 1;
          return (
            <View key={option.label}>
              <TouchableOpacity
                style={styles.optionRow}
                activeOpacity={0.6}
                onPress={() => {
                  if (option.isCustom) {
                    sheetRef.current?.dismiss();
                    onCustom();
                  } else {
                    onSelect(option.value);
                    sheetRef.current?.dismiss();
                  }
                }}
              >
                <Text style={[styles.optionLabel, option.isCustom && styles.optionCustom]}>{option.label}</Text>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              {!isLast && <View style={styles.optionDivider} />}
            </View>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetHandle: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetIndicator: {
    backgroundColor: '#d8d8d6',
    width: 36,
  },
  sheetContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 36,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9b9b97',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingVertical: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#f0f0ee',
    marginHorizontal: 24,
  },
  optionLabel: { fontSize: 16, color: '#37352f' },
  optionCustom: { color: '#2383e2' },
  checkmark: { fontSize: 16, color: '#2383e2', fontWeight: '600' },
});
