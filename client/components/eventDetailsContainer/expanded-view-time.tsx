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
// import DatePicker from 'react-native-date-picker';

// ─── Date display ─────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDisplayDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]} ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function getDateDisplay(event: EventObj): string {
  const start = event.startDate ? new Date(event.startDate) : null;
  let end = event.endDate ? new Date(event.endDate) : null;
  if (!start) return '';

  if (event.allDay && end) {
    // Google all-day end dates are exclusive — subtract 1 day for display
    const adjusted = new Date(end);
    adjusted.setDate(adjusted.getDate() - 1);
    if (adjusted >= start) end = adjusted;
  } else if (end && end.getTime() <= start.getTime()) {
    // Overnight event: end time is at or before start, so it's the next calendar day
    const nextDay = new Date(end);
    nextDay.setDate(nextDay.getDate() + 1);
    end = nextDay;
  }

  if (!end || (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()))
    return formatDisplayDate(start);
  return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
}

// ─── Web time input ───────────────────────────────────────────────────────────

interface WebTimeInputProps {
  dateValue: Date | undefined;
  onCommit: (date: Date) => void;
  placeholder: string;
  label: string;
  editable: boolean;
}

const WebTimeInput = ({ dateValue, onCommit, placeholder, label, editable }: WebTimeInputProps) => {
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
      onCommit(parsed);
      setText(formatTo12Hour(parsed));
    } else setError(true);
  };

  return (
    <View style={styles.timePill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <View style={[styles.pillInput, error && styles.pillInputError]}>
        <TextInput
          style={styles.pillInputText}
          value={text}
          onChangeText={(t) => {
            setText(t);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#c9c8c6"
          selectTextOnFocus
          editable={editable}
        />
      </View>
    </View>
  );
};

// ─── Web date input ───────────────────────────────────────────────────────────

interface WebDateInputProps {
  dateValue: Date | undefined;
  onCommit: (date: Date) => void;
  label: string | undefined;
  editable: boolean;
}

const WebDateInput = ({ dateValue, onCommit, label, editable }: WebDateInputProps) => {
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
      onCommit(parsed);
      setText(formatDateShort(parsed));
    } else setError(true);
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
          placeholder="M/D/YYYY"
          placeholderTextColor="#c9c8c6"
          selectTextOnFocus
          editable={editable}
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
}

export const EventTimeDatePicker = ({ event, editable, onUpdate }: EventTimeDatePickerProps) => {
  const recurrenceSheetRef = useRef<BottomSheetModal>(null);
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

  const [timeDisplay, setTimeDisplay] = useState<{ startTime: string; endTime: string; duration: string }>(() => {
    const { startTime, endTime, duration } = getEventTimeDisplay(event);
    return { startTime, endTime, duration };
  });

  useEffect(() => {
    const { startTime, endTime, duration } = getEventTimeDisplay(event);
    setTimeDisplay({ startTime, endTime, duration });
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

  return (
    <>
      <View>
        {/* --- Time pills --- */}
        <View style={[styles.pillRow, { marginBottom: 10 }]}>
          {/* Start Time */}
          {!event.allDay && (
            <>
              {isWeb ? (
                <WebTimeInput
                  label="start time"
                  editable={editable}
                  dateValue={event.startDate}
                  onCommit={(d) => onUpdate('startDate', d)}
                  placeholder="N/A"
                />
              ) : (
                <IOSPillButton label="start time" value={timeDisplay.startTime} onPress={() => openIOSPicker('startTime')} />
              )}
            </>
          )}
          {event.allDay && (
            <>
              {isWeb ? (
                <WebDateInput
                  label="start time"
                  editable={editable}
                  dateValue={event.startDate}
                  onCommit={(d) => onUpdate('startDate', d)}
                />
              ) : (
                <IOSPillButton label="start time" value={timeDisplay.startTime} onPress={() => openIOSPicker('startTime')} />
              )}
            </>
          )}

          {/* End Time */}
          {!event.allDay && (
            <>
              {isWeb ? (
                <WebTimeInput
                  label="end time"
                  editable={editable}
                  dateValue={event.endDate}
                  onCommit={(d) => onUpdate('endDate', d)}
                  placeholder="N/A"
                />
              ) : (
                <IOSPillButton label="end time" value={timeDisplay.endTime} onPress={() => openIOSPicker('endTime')} />
              )}
            </>
          )}

          {event.allDay && (
            <>
              {isWeb ? (
                <WebDateInput label="end time" editable={editable} dateValue={event.endDate} onCommit={(d) => onUpdate('endDate', d)} />
              ) : (
                <IOSPillButton label="end time" value={timeDisplay.endTime} onPress={() => openIOSPicker('endTime')} />
              )}
            </>
          )}

          <View style={styles.timePill}>
            <Text style={styles.pillLabel}>duration</Text>
            <View style={styles.pillInput}>
              <Text style={[styles.pillInputText, styles.pillInputMuted]}>{timeDisplay.duration}</Text>
            </View>
          </View>
        </View>
        <View style={styles.pillRow}>
          {/* Start Time Date */}
          {!event.allDay && (
            <>
              {isWeb ? (
                <WebDateInput
                  label={undefined}
                  editable={editable}
                  dateValue={event.startDate}
                  onCommit={(d) => onUpdate('startDate', d)}
                />
              ) : (
                <IOSPillButton label="start time" value={timeDisplay.startTime} onPress={() => openIOSPicker('startTime')} />
              )}
            </>
          )}
          {!event.allDay && (
            <>
              {isWeb ? (
                <WebDateInput label={undefined} editable={editable} dateValue={event.endDate} onCommit={(d) => onUpdate('endDate', d)} />
              ) : (
                <IOSPillButton label="end time" value={timeDisplay.endTime} onPress={() => openIOSPicker('endTime')} />
              )}
            </>
          )}
          <View style={{ flex: 1 }}></View>
        </View>

        <View style={styles.rowDivider} />
        {/* --- All-day toggle --- */}
        <View style={styles.toggleRow}>
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
        </View>

        <View style={styles.rowDivider} />

        {/* Recurrence */}
        <Pressable style={styles.repeatRow} onPress={() => recurrenceSheetRef.current?.present()} disabled={!editable}>
          <View style={styles.iconColor}>
            <Ionicons name="sync-outline" size={20} color={theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark} />
          </View>
          <Text style={[styles.toggleLabel, { flex: 1, marginLeft: 8 }]}>{getRecurrenceLabel(event.recurrence)}</Text>
          <Ionicons name="chevron-forward-outline" size={20} color={iconColor} />
        </Pressable>
      </View>

      <RecurrencePickerModal
        sheetRef={recurrenceSheetRef}
        current={event.recurrence}
        onSelect={(val) => onUpdate('recurrence', val)}
        onCustom={handleCustomRecurrence}
      />

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
