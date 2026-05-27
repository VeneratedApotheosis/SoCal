import { COLORS } from '@/utility/theme';
import { EventObj } from '@/utility/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import { EventTimeDatePicker } from './expanded-view-time';
import PlaceSearchBar from './location-container';

interface ExpandedViewProps {
  initialEvent: EventObj;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  modalIndex: number;
}

const HorizontalBar = () => <View style={styles.bar} />;

function eventsAreEqual(a: EventObj, b: EventObj): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export const EventExpandedView = ({ initialEvent, bottomSheetModalRef, modalIndex }: ExpandedViewProps) => {
  const { deleteEvent, createEvent, editEvent, uniqueCalendars } = useCalendarEvents();
  const [event, setEvent] = useState<EventObj>(initialEvent);

  const baselineRef = useRef<EventObj>(initialEvent);
  const hasChanges = !eventsAreEqual(event, baselineRef.current);

  useEffect(() => {
    setEvent(initialEvent);
    baselineRef.current = initialEvent;
  }, [initialEvent]);

  const recurrence = useMemo(() => {
    const targetCalendar = uniqueCalendars.find((cal) => cal.id === event.calendarId);
    if (!targetCalendar) return null;
    const foundEvent = targetCalendar.events.find((e) => e.id === event.recurringEventId);
    if (foundEvent?.recurrence) event.recurrence = foundEvent.recurrence;
    return foundEvent?.recurrence || null;
  }, [event.id, event.calendarId, uniqueCalendars]);

  const updateField = (field: keyof EventObj, value: any) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    console.log(event);
  }, [event]);

  const [titleHeight, setTitleHeight] = useState(0);

  const handleSave = () => {
    editEvent(event);
    baselineRef.current = event;
    setEvent({ ...event });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      {/* TITLE — multiline, grows downward */}
      <TextInput
        style={[styles.title, titleHeight > 0 && { height: titleHeight }]}
        value={event.title}
        onChangeText={(text) => updateField('title', text)}
        onContentSizeChange={(e) => setTitleHeight(e.nativeEvent.contentSize.height)}
        onFocus={() => bottomSheetModalRef.current?.snapToIndex(1)}
        placeholder="New Event"
        placeholderTextColor="#c9c8c6"
        multiline
        scrollEnabled={false}
      />

      {/* TIME / DATE / ALL-DAY / RECURRENCE */}
      <EventTimeDatePicker event={event} onUpdate={updateField} />

      <HorizontalBar />
      <PlaceSearchBar onLocationSelect={() => {}} />

      {/* PROPERTIES BLOCK — flat rows */}
      <View style={styles.listBlock}>
        <View style={styles.listRow}>
          <Text style={styles.icon}>📍</Text>
          <TextInput
            style={styles.listInput}
            value={event.location}
            onChangeText={(text) => updateField('location', text)}
            placeholder="Add location"
            placeholderTextColor="#c9c8c6"
          />
        </View>

        <View style={styles.listDivider} />

        <View style={styles.listRow}>
          <View style={[styles.calDot, { backgroundColor: event.calendar?.calendarCustomColor || '#3B82F6' }]} />
          <Text style={styles.listText} numberOfLines={1}>
            {event.organizer}
          </Text>
        </View>

        <View style={styles.listDivider} />

        <View style={styles.listRow}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.listTextMuted}>
            {event.reminders.useDefault
              ? 'Default reminders'
              : `${event.reminders.overrides?.length || 0} custom reminder${event.reminders.overrides?.length === 1 ? '' : 's'}`}
          </Text>
        </View>
      </View>

      <HorizontalBar />

      {/* DESCRIPTION */}
      <TextInput
        style={styles.descriptionInput}
        value={event.description}
        onChangeText={(text) => updateField('description', text)}
        placeholder="Add description…"
        placeholderTextColor="#c9c8c6"
        multiline
        scrollEnabled={false}
      />

      <HorizontalBar />

      {/* ACTIONS */}
      <View style={styles.actionBlock}>
        {event.id && hasChanges ? (
          <Pressable style={({ pressed }) => [styles.btn, styles.primaryBtn, pressed && styles.primaryBtnPressed]} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>Save Changes</Text>
          </Pressable>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.btn, styles.secondaryBtn, pressed && styles.btnPressed]}
            onPress={() => createEvent(event)}
          >
            <Text style={styles.secondaryBtnText}>{event.id ? 'Duplicate' : 'Create Event'}</Text>
          </Pressable>
          {event.id ? (
            <Pressable
              style={({ pressed }) => [styles.btn, styles.deleteBtn, pressed && styles.deleteBtnPressed]}
              onPress={() => deleteEvent(event)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bar: { height: 1, backgroundColor: '#f0f0ee', marginVertical: 16 },

  // Title — no fixed height, wraps naturally
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text.main,
    lineHeight: 34,
    paddingVertical: 4,
    marginBottom: 4,
    // no fixed height — grows/shrinks via onContentSizeChange
  },

  // Properties list
  listBlock: { marginVertical: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  listDivider: { height: 1, backgroundColor: '#f0f0ee' },
  icon: { fontSize: 16, width: 20, textAlign: 'center' },
  calDot: { width: 13, height: 13, borderRadius: 3, marginLeft: 2, marginRight: 1 },
  listInput: { flex: 1, fontSize: 15, color: '#37352f', padding: 0 },
  listText: { flex: 1, fontSize: 15, color: '#37352f' },
  listTextMuted: { flex: 1, fontSize: 15, color: '#9b9b97' },

  // Description
  descriptionInput: {
    fontSize: 15,
    color: '#37352f',
    lineHeight: 22,
    minHeight: 80,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },

  // Buttons
  actionBlock: { gap: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: { backgroundColor: '#2383e2' },
  primaryBtnPressed: { backgroundColor: '#1d6ebc' },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  secondaryBtn: { backgroundColor: '#f1f1ef' },
  btnPressed: { backgroundColor: '#e4e4e1' },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: '#37352f' },
  deleteBtn: { backgroundColor: '#fff0f0' },
  deleteBtnPressed: { backgroundColor: '#fde0e0' },
  deleteBtnText: { fontSize: 14, fontWeight: '500', color: '#d44c47' },
});
