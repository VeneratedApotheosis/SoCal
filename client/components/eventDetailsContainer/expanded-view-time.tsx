import { getEventTimeDisplay } from '@/utility/eventUtils';
import { EventObj } from '@/utility/types';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import DatePicker from 'react-native-date-picker';

interface EventTimeDatePickerProps {
  event: EventObj;
  onUpdate: (field: keyof EventObj, value: any) => void;
}

// ─── Recurrence options ───────────────────────────────────────────────────────

interface RecurrenceOption {
  label: string;
  value: string[] | null;
  isCustom?: boolean;
}

const RECURRENCE_OPTIONS: RecurrenceOption[] = [
  { label: 'Does not repeat', value: null },
  { label: 'Every day', value: ['RRULE:FREQ=DAILY'] },
  { label: 'Every week', value: ['RRULE:FREQ=WEEKLY'] },
  { label: 'Every 2 weeks', value: ['RRULE:FREQ=WEEKLY;INTERVAL=2'] },
  { label: 'Every month', value: ['RRULE:FREQ=MONTHLY'] },
  { label: 'Every year', value: ['RRULE:FREQ=YEARLY'] },
  { label: 'Custom…', value: null, isCustom: true },
];

function getRecurrenceLabel(recurrence: string[] | null | undefined): string {
  if (!recurrence || recurrence.length === 0) return 'Does not repeat';
  const rrule = recurrence[0];
  const match = RECURRENCE_OPTIONS.find((o) => o.value && JSON.stringify(o.value) === JSON.stringify(recurrence));
  if (match) return match.label;
  // Custom / unrecognised rule — try to give a readable summary
  if (rrule.includes('INTERVAL=2') && rrule.includes('WEEKLY')) return 'Every 2 weeks';
  if (rrule.includes('YEARLY')) return 'Every year';
  return 'Custom repeat';
}

function isOptionSelected(option: RecurrenceOption, current: string[] | null | undefined): boolean {
  if (option.isCustom) return false;
  return JSON.stringify(option.value) === JSON.stringify(current ?? null);
}

// ─── Recurrence picker modal ──────────────────────────────────────────────────

interface RecurrencePickerProps {
  visible: boolean;
  current: string[] | null | undefined;
  onSelect: (value: string[] | null) => void;
  onCustom: () => void;
  onClose: () => void;
}

const RecurrencePicker = ({ visible, current, onSelect, onCustom, onClose }: RecurrencePickerProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    {/* Backdrop */}
    <Pressable style={styles.backdrop} onPress={onClose}>
      {/* Sheet — stop press propagation so tapping inside doesn't close */}
      <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <View style={styles.sheetHandle} />
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
                    onClose();
                    onCustom();
                  } else {
                    onSelect(option.value);
                    onClose();
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
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Time helpers ─────────────────────────────────────────────────────────────

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

function formatTo12Hour(date: Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${meridiem}`;
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
    } else {
      setError(true);
    }
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
          keyboardType="default"
          selectTextOnFocus
        />
      </View>
    </View>
  );
};

// ─── iOS time button ──────────────────────────────────────────────────────────

interface IOSTimeButtonProps {
  label: string;
  value: string;
  onPress: () => void;
}

const IOSTimeButton = ({ label, value, onPress }: IOSTimeButtonProps) => (
  <View style={styles.timePill}>
    <Text style={styles.pillLabel}>{label}</Text>
    <Pressable style={({ pressed }) => [styles.pillInput, pressed && styles.pillInputPressed]} onPress={onPress}>
      <Text style={styles.pillInputText}>{value}</Text>
    </Pressable>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const EventTimeDatePicker = ({ event, onUpdate }: EventTimeDatePickerProps) => {
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start');
  const [recurrencePickerVisible, setRecurrencePickerVisible] = useState(false);

  const { startTime, endTime, duration } = getEventTimeDisplay(event);

  const openIOSPicker = (mode: 'start' | 'end') => {
    setTimePickerMode(mode);
    setTimePickerVisible(true);
  };

  const handleIOSConfirm = (selectedDate: Date) => {
    setTimePickerVisible(false);
    onUpdate(timePickerMode === 'start' ? 'startDate' : 'endDate', selectedDate);
  };

  const handleRecurrenceSelect = (value: string[] | null) => {
    onUpdate('recurrence', value);
  };

  const handleCustomRecurrence = () => {
    // Hook this up to your custom recurrence UI when ready
    console.log('Custom recurrence tapped');
  };

  const isWeb = Platform.OS === 'web';

  return (
    <>
      <View style={styles.section}>
        {/* Time row: start | end | duration */}
        <View style={styles.timeRow}>
          {isWeb ? (
            <WebTimeInput
              label="start"
              dateValue={event.startDate}
              onCommit={(date) => onUpdate('startDate', date)}
              placeholder="12:00 PM"
            />
          ) : (
            <IOSTimeButton label="start" value={startTime} onPress={() => openIOSPicker('start')} />
          )}

          {isWeb ? (
            <WebTimeInput label="end" dateValue={event.endDate} onCommit={(date) => onUpdate('endDate', date)} placeholder="1:00 PM" />
          ) : (
            <IOSTimeButton label="end" value={endTime} onPress={() => openIOSPicker('end')} />
          )}

          {/* Duration — read-only */}
          <View style={styles.timePill}>
            <Text style={styles.pillLabel}>duration</Text>
            <View style={styles.pillInput}>
              <Text style={[styles.pillInputText, styles.pillInputMuted]}>{duration}</Text>
            </View>
          </View>
        </View>

        {/* All-day + Recurrence card */}
        <View style={styles.toggleCard}>
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

          <View style={styles.cardDivider} />

          <Pressable style={styles.toggleRow} onPress={() => setRecurrencePickerVisible(true)}>
            <Text style={styles.icon}>🔁</Text>
            <Text style={[styles.toggleLabel, { flex: 1, marginLeft: 8 }]}>{getRecurrenceLabel(event.recurrence)}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Recurrence picker modal */}
      <RecurrencePicker
        visible={recurrencePickerVisible}
        current={event.recurrence}
        onSelect={handleRecurrenceSelect}
        onCustom={handleCustomRecurrence}
        onClose={() => setRecurrencePickerVisible(false)}
      />

      {/* iOS DatePicker — uncomment when ready */}
      {/* {!isWeb && (
        <DatePicker
          modal
          mode="time"
          open={isTimePickerVisible}
          date={pickerDate}
          onConfirm={handleIOSConfirm}
          onCancel={() => setTimePickerVisible(false)}
        />
      )} */}
    </>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 12, marginBottom: 4 },

  // Time pills
  timeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
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
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  pillInputMuted: { color: '#787774', fontWeight: '500' },

  // All-day + recurrence card
  toggleCard: {
    backgroundColor: '#f7f7f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  toggleLabel: { flex: 1, fontSize: 15, color: '#37352f' },
  cardDivider: { height: 1, backgroundColor: '#ebebea' },
  icon: { fontSize: 15 },
  chevron: { fontSize: 18, color: '#c4c4c0', fontWeight: '400', lineHeight: 20 },

  // Recurrence modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingBottom: 36,
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8d8d6',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9b9b97',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  optionLabel: {
    fontSize: 16,
    color: '#37352f',
  },
  optionCustom: {
    color: '#2383e2',
  },
  checkmark: {
    fontSize: 16,
    color: '#2383e2',
    fontWeight: '600',
  },
});
