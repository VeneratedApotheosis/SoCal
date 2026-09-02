import { COLORS } from '@/utility/theme';
import { applyDateString, formatDateShort } from '@/utility/timeUtil';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { Frequency, RRule } from 'rrule';
import { useUIContext } from '../contexts/ui-context';
import { modalStyles } from './eventDetailsStyles';

interface CustomRecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  rruleString: string;
  onSave: (newRruleString: string) => void;
  eventStartDate: Date;
}

// Map standard text labels to RRule numeric frequency constants
const FREQ_OPTIONS = [
  { key: 'day', label: 'Days', value: RRule.DAILY },
  { key: 'week', label: 'Weeks', value: RRule.WEEKLY },
  { key: 'month', label: 'Months', value: RRule.MONTHLY },
  { key: 'year', label: 'Years', value: RRule.YEARLY },
];

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const RRULE_WEEKDAYS = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];

export const CustomRecurrenceModal = ({ isOpen, onClose, rruleString, onSave, eventStartDate }: CustomRecurrenceModalProps) => {
  const { theme } = useUIContext();
  const styles = modalStyles(theme.isDark);

  // ─── Local States ───────────────────────────────────────────────────────────

  const [customInterval, setCustomInterval] = useState<number>(1);
  const [customFreq, setCustomFreq] = useState<Frequency>(RRule.WEEKLY);
  const [customDays, setCustomDays] = useState<Set<number>>(new Set());
  const [endsType, setEndsType] = useState<'never' | 'on' | 'after'>('never');
  const [endsDateStr, setEndsDateStr] = useState<string>('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endsAfter, setEndsAfter] = useState<number>(1);
  const [showFreqDropdown, setShowFreqDropdown] = useState(false);

  // ─── Update Local State with rruleString Change ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      try {
        // 1. Get today's local day as an RRule string (e.g., 'TU' for Tuesday, 'WE' for Wednesday)
        const localDayIndex = eventStartDate.getDay();
        const localDayStr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][localDayIndex];

        // 2. Explicitly include BYDAY in the fallback so RRule doesn't guess based on UTC
        const fallback = `FREQ=WEEKLY;BYDAY=${localDayStr}`;

        // 3. Construct the clean string
        const cleanString = rruleString?.startsWith('RRULE:') ? rruleString : `RRULE:${rruleString || fallback}`;

        const parsedRule = RRule.fromString(cleanString);
        const options = parsedRule.options;

        console.log(cleanString);

        setCustomInterval(options.interval || 1);
        setCustomFreq(options.freq);

        // Calculate BYDAY for weekly repeat
        const initialDays = new Set<number>();
        if (options.byweekday) {
          options.byweekday.forEach((dayNum) => {
            const uiIndex = RRULE_WEEKDAYS.findIndex((d) => d.weekday === dayNum);
            if (uiIndex !== -1) initialDays.add(uiIndex);
          });
        }
        setCustomDays(initialDays);

        // Calculate End conditions
        if (options.until) {
          setEndsType('on');
          const d = options.until;
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(d.getUTCDate()).padStart(2, '0');
          setEndDate(d);
          setEndsDateStr(`${dd}/${mm}/${yyyy}`);
        } else if (options.count) {
          setEndsType('after');
          setEndsAfter(options.count);
        } else {
          setEndsType('never');
        }
      } catch (error) {
        console.error('Error parsing incoming RRULE:', error);
      }
    }
  }, [isOpen, rruleString]);

  // Day Selection Toggle
  const toggleCustomDay = (index: number) => {
    const updated = new Set(customDays);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }

    setCustomDays(updated);
  };

  // --- Compile Form States Back to standard RRULE ---
  const handleDone = () => {
    const options: any = {
      freq: customFreq,
      interval: customInterval,
      wkst: RRule.SU,
    };

    // Add weekdays if FREQ=WEEKLY
    if (customFreq === RRule.WEEKLY && customDays.size > 0) {
      options.byweekday = Array.from(customDays).map((idx) => RRULE_WEEKDAYS[idx]);
    }

    // Handle End variations
    if (endsType === 'on' && endsDateStr) {
      const parts = endsDateStr.split('/');
      if (parts.length === 3) {
        options.until = new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 23, 59, 59));
      }
    } else if (endsType === 'after') {
      options.count = endsAfter;
    }

    const rule = new RRule(options);
    onSave(rule.toString());
    onClose();
  };

  const currentFreqLabel = FREQ_OPTIONS.find((o) => o.value === customFreq)?.label || 'Weeks';

  // ─── Input Component States ───────────────────────────────────────────────────────────

  const [error, setError] = useState(false);
  const [onIsFocused, setOnIsFocused] = useState(false);
  const [afterIsFocused, setAfterIsFocused] = useState(false);
  const [repeatEveryFocused, setRepeatEveryFocused] = useState(false);

  const handleOnChange = () => {
    const parsed = applyDateString(endDate, endsDateStr);
    if (parsed) {
      setError(false);
      setEndDate(parsed);
      setEndsDateStr(formatDateShort(parsed));
    } else setError(true);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Custom recurrence</Text>

              {/* --- Repeat Every --- */}
              <View style={[styles.section, { zIndex: 10 }]}>
                <Text style={styles.sectionLabel}>Repeat every</Text>
                <View style={styles.row}>
                  {/* Interval Stepper */}
                  <View style={[styles.stepperContainer, repeatEveryFocused && styles.stepperSelected]}>
                    <TextInput
                      keyboardType="number-pad"
                      maxLength={2}
                      value={String(customInterval)}
                      onFocus={() => setRepeatEveryFocused(true)}
                      onBlur={() => {
                        if (customInterval === 0) setCustomInterval(1);
                        setRepeatEveryFocused(false);
                      }}
                      onChangeText={(text) => {
                        const parsed = parseInt(text) || 0;
                        setCustomInterval(parsed);
                      }}
                      style={styles.stepperInput}
                    />
                  </View>

                  {/* Custom Dropdown Trigger */}
                  <View style={{ zIndex: 10 }}>
                    <Pressable style={styles.dropdownTrigger} onPress={() => setShowFreqDropdown(!showFreqDropdown)}>
                      <Text style={styles.dropdownTriggerText}>{currentFreqLabel}</Text>
                      <Ionicons name="chevron-down" size={14} color={theme.isDark ? COLORS.border.mutedLight : COLORS.border.mutedLight} />
                    </Pressable>

                    {showFreqDropdown && (
                      <View style={styles.dropdownMenu}>
                        {FREQ_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt.key}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setCustomFreq(opt.value);
                              setShowFreqDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{opt.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* --- Repeat On (Only when Frequency is Weekly) --- */}
              {customFreq === RRule.WEEKLY && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Repeat on</Text>
                  <View style={styles.daysRow}>
                    {DAY_LETTERS.map((letter, i) => {
                      const isSelected = customDays.has(i);
                      return (
                        <Pressable
                          key={i}
                          onPress={() => toggleCustomDay(i)}
                          style={[styles.dayCircle, isSelected ? styles.dayCircleActive : styles.dayCircleInactive]}
                        >
                          <Text style={[styles.dayText, isSelected ? styles.dayTextActive : styles.dayTextInactive]}>{letter}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* --- Ends --- */}
              <View style={styles.sectionFinal}>
                <Text style={styles.sectionLabel}>Ends</Text>
                <View style={[styles.radioGroup, { justifyContent: 'space-evenly' }]}>
                  {/* Option: Never */}
                  <View style={styles.radioRow}>
                    <Pressable style={styles.radioRowInline} onPress={() => setEndsType('never')}>
                      <View style={[styles.radioOuter, endsType === 'never' && styles.radioOuterActive]}>
                        {endsType === 'never' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioText}>Never</Text>
                    </Pressable>
                  </View>

                  {/* Option: On Date */}
                  <View style={styles.radioRow}>
                    <Pressable style={styles.radioRowInline} onPress={() => setEndsType('on')}>
                      <View style={[styles.radioOuter, endsType === 'on' && styles.radioOuterActive]}>
                        {endsType === 'on' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.radioText, { width: 32 }]}>On</Text>
                    </Pressable>
                    <TextInput
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={theme.isDark ? COLORS.text.subtleDark : COLORS.text.subtleLight}
                      value={endsDateStr}
                      onFocus={() => {
                        setEndsType('on');
                        setOnIsFocused(true);
                        handleOnChange();
                      }}
                      onChangeText={(text) => {
                        setEndsType('on');
                        handleOnChange();
                        setEndsDateStr(text);
                      }}
                      onBlur={() => {
                        handleOnChange();
                        setOnIsFocused(false);
                      }}
                      style={[
                        styles.inputField,
                        endsType === 'on'
                          ? error
                            ? styles.inputFieldError
                            : [styles.inputFieldSelected, onIsFocused && styles.inputFieldActive]
                          : styles.inputFieldInactive,
                      ]}
                    />
                  </View>

                  {/* Option: After Occurrences */}
                  <View style={styles.radioRow}>
                    <Pressable style={styles.radioRowInline} onPress={() => setEndsType('after')}>
                      <View style={[styles.radioOuter, endsType === 'after' && styles.radioOuterActive]}>
                        {endsType === 'after' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.radioText]}>After</Text>
                    </Pressable>

                    <View
                      style={[
                        styles.inlineStepperContainer,
                        endsType === 'after'
                          ? [styles.inputFieldSelected, afterIsFocused && styles.inputFieldActive]
                          : styles.inputFieldInactive,
                      ]}
                    >
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={3}
                        value={String(endsAfter)}
                        onFocus={() => {
                          setAfterIsFocused(true);
                          setEndsType('after');
                        }}
                        onChangeText={(text) => {
                          setEndsType('after');
                          const parsed = parseInt(text) || 0;
                          setEndsAfter(parsed);
                        }}
                        style={styles.inlineStepperInput}
                        onBlur={() => {
                          setAfterIsFocused(false);
                          if (endsAfter === 0) setEndsAfter(1);
                        }}
                      />
                    </View>
                    <Text style={styles.inlineStepperSuffix}>times</Text>
                  </View>
                </View>
              </View>

              {/* --- Footer Buttons --- */}
              <View style={styles.footerRow}>
                <Pressable onPress={onClose} style={styles.btnCancel}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleDone} style={styles.btnDone}>
                  <Text style={styles.btnDoneText}>Done</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
