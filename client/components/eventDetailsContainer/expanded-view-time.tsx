import { getEventTimeDisplay } from '@/utility/eventUtils';
import { EventObj } from '@/utility/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { getRecurrenceLabel, RecurrencePickerModal } from './recurrence-picker-modal';
// import DatePicker from 'react-native-date-picker';

interface EventTimeDatePickerProps {
  event: EventObj;
  onUpdate: (field: keyof EventObj, value: any) => void;
}

// ─── Time/date helpers ────────────────────────────────────────────────────────

function applyTimeString(base: Date | undefined, timeStr: string): Date | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  if (meridiem === 'AM') {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }
  const d = new Date(base || Date.now());
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function applyDateString(base: Date | undefined, dateStr: string): Date | null {
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) return null;
  const month = parseInt(match[1], 10) - 1;
  const day = parseInt(match[2], 10);
  let year = match[3] ? parseInt(match[3], 10) : new Date(base || Date.now()).getFullYear();
  if (year < 100) year += 2000;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const d = new Date(base || Date.now());
  d.setFullYear(year, month, day);
  return d;
}

function formatTo12Hour(date: Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${meridiem}`;
}

function formatDateShort(date: Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

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
}

const WebTimeInput = ({ dateValue, onCommit, placeholder, label }: WebTimeInputProps) => {
  const [text, setText] = useState(formatTo12Hour(dateValue));
  const [error, setError] = useState(false);

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
            setError(false);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#c9c8c6"
          selectTextOnFocus
        />
      </View>
    </View>
  );
};

// ─── Web date input ───────────────────────────────────────────────────────────

interface WebDateInputProps {
  dateValue: Date | undefined;
  onCommit: (date: Date) => void;
  label: string;
}

const WebDateInput = ({ dateValue, onCommit, label }: WebDateInputProps) => {
  const [text, setText] = useState(formatDateShort(dateValue));
  const [error, setError] = useState(false);

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
      <Text style={styles.pillLabel}>{label}</Text>
      <View style={[styles.pillInput, error && styles.pillInputError]}>
        <TextInput
          style={styles.pillInputText}
          value={text}
          onChangeText={(t) => {
            setText(t);
            setError(false);
          }}
          onBlur={handleBlur}
          placeholder="M/D/YYYY"
          placeholderTextColor="#c9c8c6"
          selectTextOnFocus
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

const IOSPillButton = ({ label, value, onPress }: IOSPillButtonProps) => (
  <View style={styles.timePill}>
    <Text style={styles.pillLabel}>{label}</Text>
    <Pressable style={({ pressed }) => [styles.pillInput, pressed && styles.pillInputPressed]} onPress={onPress}>
      <Text style={styles.pillInputText}>{value}</Text>
    </Pressable>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const EventTimeDatePicker = ({ event, onUpdate }: EventTimeDatePickerProps) => {
  const recurrenceSheetRef = useRef<BottomSheetModal>(null);

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

  const { startTime, endTime, duration } = getEventTimeDisplay(event);

  const isWeb = Platform.OS === 'web';

  return (
    <>
      <View style={styles.section}>
        {/* Time pills */}
        <View style={styles.pillRow}>
          {isWeb ? (
            <WebTimeInput
              label="start time"
              dateValue={event.startDate}
              onCommit={(d) => onUpdate('startDate', d)}
              placeholder="12:00 PM"
            />
          ) : (
            <IOSPillButton label="start time" value={startTime} onPress={() => openIOSPicker('startTime')} />
          )}

          {isWeb ? (
            <WebTimeInput label="end time" dateValue={event.endDate} onCommit={(d) => onUpdate('endDate', d)} placeholder="1:00 PM" />
          ) : (
            <IOSPillButton label="end time" value={endTime} onPress={() => openIOSPicker('endTime')} />
          )}

          <View style={styles.timePill}>
            <Text style={styles.pillLabel}>duration</Text>
            <View style={styles.pillInput}>
              <Text style={[styles.pillInputText, styles.pillInputMuted]}>{duration}</Text>
            </View>
          </View>
        </View>

        {/* Date display */}
        <Text style={styles.dateDisplay}>{getDateDisplay(event)}</Text>

        {/* All-day toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>All-day</Text>
          <Switch
            value={event.allDay}
            onValueChange={(val) => onUpdate('allDay', val)}
            trackColor={{ false: '#e1e1de', true: '#2383e2' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#e1e1de"
          />
        </View>

        <View style={styles.rowDivider} />

        {/* Recurrence */}
        <Pressable style={styles.toggleRow} onPress={() => recurrenceSheetRef.current?.present()}>
          <Text style={styles.icon}>🔁</Text>
          <Text style={[styles.toggleLabel, { flex: 1, marginLeft: 8 }]}>{getRecurrenceLabel(event.recurrence)}</Text>
          <Text style={styles.chevron}>›</Text>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: { marginTop: 12, marginBottom: 4 },

  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  timePill: { flex: 1, gap: 5 },
  pillLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9b9b97',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingLeft: 2,
  },
  pillInput: {
    backgroundColor: '#f2f2f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillInputPressed: { backgroundColor: '#e8e8e5' },
  pillInputError: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#eb5757',
  },
  pillInputText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  pillInputMuted: { color: '#787774', fontWeight: '500' },

  dateDisplay: {
    fontSize: 16,
    color: '#37352f',
    fontWeight: '500',
    textAlign: 'left',
    marginBottom: 8,
    marginTop: -4,
  },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  toggleLabel: { flex: 1, fontSize: 15, color: '#37352f' },
  rowDivider: { height: 1, backgroundColor: '#f0f0ee' },
  icon: { fontSize: 15 },
  chevron: { fontSize: 18, color: '#c4c4c0', lineHeight: 20 },
});
