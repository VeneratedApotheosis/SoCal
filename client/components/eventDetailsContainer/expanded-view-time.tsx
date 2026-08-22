import { getEventTimeDisplay } from '@/utility/eventUtils';
import { getBasicThemeStyles, getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { applyDateString, applyTimeString, formatDateShort, formatTo12Hour } from '@/utility/timeUtil';
import { EventObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import { timeStyles } from './eventDetailsStyles';
import { getRecurrenceLabel, RecurrencePickerModal } from './recurrence-picker-modal';
import { WebRecurrencePickerModal } from './web-reccurence-picker-modal';
// import DatePicker from 'react-native-date-picker';

// ─── Web time input ───────────────────────────────────────────────────────────

interface WebTimeInputProps {
  dateValue: Date | undefined;
  placeholder: string;
  label: string;
  editable: boolean;
  num: number;
  updateTime: (date: Date | null, num: number, error: boolean) => void;
}

const WebTimeInput = ({ dateValue, placeholder, label, editable, num, updateTime }: WebTimeInputProps) => {
  const [text, setText] = useState(formatTo12Hour(dateValue));

  useEffect(() => {
    setText(formatTo12Hour(dateValue));
  }, [dateValue]);

  const [error, setError] = useState(false);
  const { theme } = useUIContext();
  const styles = timeStyles(theme.isDark);

  const handleBlur = () => {
    const parsed = applyTimeString(dateValue, text);
    if (parsed) {
      setError(false);
      setText(formatTo12Hour(parsed));
      updateTime(parsed, num, false);
    } else {
      setError(true);
      updateTime(parsed, num, true);
    }
  };

  return (
    <View style={styles.timePill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <View style={[styles.pillInput, error && styles.pillInputError]}>
        <TextInput
          style={[styles.pillInputText, error && styles.pillInputTextError]}
          value={text}
          onChangeText={(t) => {
            setText(t);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#c9c8c6"
          editable={editable}
        />
      </View>
    </View>
  );
};

// ─── Web date input ───────────────────────────────────────────────────────────

interface WebDateInputProps {
  dateValue: Date | undefined;
  label: string | undefined;
  editable: boolean;
  num: number;
  updateTime: (date: Date | null, num: number, error: boolean) => void;
}

const WebDateInput = ({ dateValue, label, editable, num, updateTime }: WebDateInputProps) => {
  const [text, setText] = useState(formatDateShort(dateValue));

  useEffect(() => {
    setText(formatDateShort(dateValue));
  }, [dateValue]);

  const [error, setError] = useState(false);
  const { theme } = useUIContext();
  const styles = timeStyles(theme.isDark);

  const handleBlur = () => {
    const parsed = applyDateString(dateValue, text);
    if (parsed) {
      setError(false);
      setText(formatDateShort(parsed));
      updateTime(parsed, num, false);
    } else {
      setError(true);
      updateTime(parsed, num, true);
    }
  };

  return (
    <View style={styles.timePill}>
      {label && <Text style={styles.pillLabel}>{label}</Text>}
      <View style={[styles.pillInput, error && styles.pillInputError]}>
        <TextInput
          style={[styles.pillInputText, error && styles.pillInputTextError]}
          value={text}
          onChangeText={(t) => {
            setText(t);
          }}
          onBlur={handleBlur}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#c9c8c6"
          editable={editable}
          maxLength={10}
        />
      </View>
    </View>
  );
};

// ─── iOS tappable button ──────────────────────────────────────────────────────

interface IOSPillButtonProps {
  label: string;
  value: string;
  onPress: () => void;
}

const IOSPillButton = ({ label, value, onPress }: IOSPillButtonProps) => {
  const { theme } = useUIContext();
  const styles = timeStyles(theme.isDark);
  return (
    <View style={styles.timePill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Pressable style={({ pressed }) => [styles.pillInput, pressed && styles.pillInputPressed]} onPress={onPress}>
        <Text style={styles.pillInputText}>{value}</Text>
      </Pressable>
    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface EventTimeDatePickerProps {
  event: EventObj;
  editable: boolean;
  onUpdate: (field: keyof EventObj, value: any) => void;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EventTimeDatePicker = ({ event, editable, onUpdate, setError }: EventTimeDatePickerProps) => {
  const recurrenceSheetRef = useRef<BottomSheetModal>(null);
  const [webVisible, setWebVisible] = useState<boolean>(false);
  const { theme } = useUIContext();
  const styles = timeStyles(theme.isDark);
  const baseTheme = getBasicThemeStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark, true);

  const [iosPickerMode, setIosPickerMode] = useState<'startTime' | 'endTime' | 'startDate' | 'endDate'>('startTime');
  const [iosPickerOpen, setIosPickerOpen] = useState(false);

  const openIOSPicker = (mode: typeof iosPickerMode) => {
    setIosPickerMode(mode);
    setIosPickerOpen(true);
  };

  const handleIOSConfirm = (selectedDate: Date) => {
    setIosPickerOpen(false);
    onUpdate(iosPickerMode === 'startTime' || iosPickerMode === 'startDate' ? 'startDate' : 'endDate', selectedDate);
  };

  const handleCustomRecurrence = useCallback(() => {
    console.log('Custom recurrence tapped — hook up your UI here');
  }, []);

  const [timeDisplay, setTimeDisplay] = useState<{ startTime: string; endTime: string; duration: string; durationNumber: number }>(() => {
    const { startTime, endTime, duration, durationNumber } = getEventTimeDisplay(event);
    return { startTime, endTime, duration, durationNumber };
  });

  useEffect(() => {
    const { startTime, endTime, duration, durationNumber } = getEventTimeDisplay(event);
    setTimeDisplay({ startTime, endTime, duration, durationNumber });
  }, [event]);

  const isWeb = Platform.OS === 'web';

  const transformX = useRef(new Animated.Value(event.allDay ? 20 : 0)).current;

  useEffect(() => {
    Animated.timing(transformX, {
      toValue: event.allDay ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [event.allDay]);

  const [errors, setErrors] = useState<boolean[]>([false, false, false, false]);

  const updateError = (num: number, error: boolean) => {};

  const updateTime = (field: 'startDate' | 'endDate', date: Date | null, num: number, error: boolean) => {
    setErrors((prev) => {
      const newErrors = prev.map((e, index) => (index === num - 1 ? error : e));
      if (newErrors[0] === false && newErrors[1] === false && newErrors[2] === false && newErrors[3] === false) {
        if (!date) return newErrors;
        onUpdate(field, date);
        if (field === 'startDate') {
          const diff = date.getTime() - event.endDate.getTime();
          if (diff > 0) setError(true);
          else setError(false);
        } else if (field === 'endDate') {
          const diff = event.startDate.getTime() - date.getTime();
          if (diff > 0) setError(true);
          else setError(false);
        }
      } else setError(true);
      return newErrors;
    });
  };

  return (
    <>
      <View style={{ flexShrink: 1 }}>
        {!event.allDay && (
          <>
            <View style={[styles.pillRow]}>
              {isWeb ? (
                <WebDateInput
                  label={'start time'}
                  editable={editable}
                  dateValue={event.startDate}
                  num={1}
                  updateTime={(date: Date | null, num: number, error: boolean) => updateTime('startDate', date, num, error)}
                />
              ) : (
                <IOSPillButton label="start time" value={timeDisplay.startTime} onPress={() => openIOSPicker('startTime')} />
              )}
              {isWeb ? (
                <WebTimeInput
                  label=" "
                  editable={editable}
                  dateValue={event.startDate}
                  placeholder="N/A"
                  num={2}
                  updateTime={(date: Date | null, num: number, error: boolean) => updateTime('startDate', date, num, error)}
                />
              ) : (
                <IOSPillButton label="start time" value={timeDisplay.startTime} onPress={() => openIOSPicker('startTime')} />
              )}
            </View>
            <View style={[styles.pillRow]}>
              {isWeb ? (
                <WebDateInput
                  label={'end time'}
                  editable={editable}
                  dateValue={event.endDate}
                  updateTime={(date: Date | null, num: number, error: boolean) => updateTime('endDate', date, num, error)}
                  num={3}
                />
              ) : (
                <IOSPillButton label="end time" value={timeDisplay.endTime} onPress={() => openIOSPicker('endTime')} />
              )}
              {isWeb ? (
                <WebTimeInput
                  label=" "
                  editable={editable}
                  dateValue={event.endDate}
                  placeholder="N/A"
                  num={4}
                  updateTime={(date: Date | null, num: number, error: boolean) => updateTime('endDate', date, num, error)}
                />
              ) : (
                <IOSPillButton label="end time" value={timeDisplay.endTime} onPress={() => openIOSPicker('endTime')} />
              )}
            </View>

            <View style={[styles.pillRow]}>
              <View style={styles.timePill}>
                <Text style={styles.pillLabel}>duration</Text>
                <View style={[styles.pillInput, timeDisplay.durationNumber < 0 && styles.pillInputError]}>
                  <Text style={[styles.pillInputText, styles.pillInputMuted, timeDisplay.durationNumber < 0 && styles.pillInputTextError]}>
                    {timeDisplay.duration}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
        {event.allDay && (
          <>
            <View style={[styles.pillRow]}>
              {isWeb ? (
                <WebDateInput
                  label="start time"
                  editable={editable}
                  dateValue={event.startDate}
                  updateTime={(date: Date | null, num: number, error: boolean) => updateTime('startDate', date, num, error)}
                  num={1}
                />
              ) : (
                <IOSPillButton label="start time" value={timeDisplay.startTime} onPress={() => openIOSPicker('startTime')} />
              )}
            </View>
            <View style={[styles.pillRow]}>
              {isWeb ? (
                <WebDateInput
                  label="end time"
                  editable={editable}
                  dateValue={event.endDate}
                  updateTime={(date: Date | null, num: number, error: boolean) => updateTime('endDate', date, num, error)}
                  num={3}
                />
              ) : (
                <IOSPillButton label="end time" value={timeDisplay.endTime} onPress={() => openIOSPicker('endTime')} />
              )}
            </View>
            <View style={[styles.pillRow]}>
              <View style={styles.timePill}>
                <Text style={styles.pillLabel}>duration</Text>
                <View style={styles.pillInput}>
                  <Text style={[styles.pillInputText, styles.pillInputMuted]}>{timeDisplay.duration}</Text>
                </View>
              </View>
            </View>
          </>
        )}
        <View style={styles.toggleRow}>
          {/* --- All-day toggle --- */}
          <Text style={styles.toggleLabel}>All-day</Text>
          <Pressable
            onPress={() => onUpdate('allDay', !event.allDay)}
            style={[
              styles.customSwitch,
              event.allDay ? { ...baseTheme.backgroundBlue } : { backgroundColor: theme.isDark ? '#3a3a3a' : '#d1d1dd' },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: event.allDay }}
            disabled={!editable}
          >
            <Animated.View style={[styles.customThumb, { transform: [{ translateX: transformX }] }]} />
          </Pressable>
          <View style={styles.columnDivider} />
          {/* Recurrence */}
          <Pressable
            style={styles.repeatRow}
            onPress={() => {
              if (isWeb) setWebVisible(true);
              else recurrenceSheetRef.current?.present();
            }}
            disabled={!editable}
          >
            <View style={styles.iconColor}>
              <Ionicons name="sync-outline" size={20} color={theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark} />
            </View>
            <Text style={[styles.toggleLabel, { flex: 1, marginLeft: 8 }]}>{getRecurrenceLabel(event.recurrence)}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color={iconColor} />
          </Pressable>
        </View>
      </View>

      {isWeb ? (
        <WebRecurrencePickerModal
          sheetRef={recurrenceSheetRef}
          current={event.recurrence}
          onSelect={(val) => onUpdate('recurrence', val)}
          onCustom={handleCustomRecurrence}
          webVisible={webVisible}
          setWebVisible={setWebVisible}
        />
      ) : (
        <RecurrencePickerModal
          sheetRef={recurrenceSheetRef}
          current={event.recurrence}
          onSelect={(val) => onUpdate('recurrence', val)}
          onCustom={handleCustomRecurrence}
        />
      )}

      {/* iOS pickers — uncomment when ready
      <DatePicker
        modal
        mode={iosPickerMode === 'startTime' || iosPickerMode === 'endTime' ? 'time' : 'date'}
        open={iosPickerOpen}
        date={
          iosPickerMode === 'startTime' || iosPickerMode === 'startDate'
            ? (event.startDate ?? new Date())
            : (event.endDate ?? new Date())
        }
        onConfirm={handleIOSConfirm}
        onCancel={() => setIosPickerOpen(false)}
      />
      */}
    </>
  );
};
