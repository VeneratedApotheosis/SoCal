import { getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { EventObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useUIContext } from '../contexts/ui-context';
import CalendarObjView from './calendar-obj-view';
import { eventViewStyles } from './eventDetailsStyles';
import { EventTimeDatePicker } from './expanded-view-time';
import PlaceSearchBar from './location-container';
import MutateRecurrenceModal from './mutate-recurrence-modal';

interface ExpandedViewProps {
  initialEvent: EventObj;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  modalIndex: number;
  onClose: () => void;
}

export function eventsAreEqual(a: EventObj, b: EventObj): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const menuHeight = 116;
const menuWidth = 150;

export const EventExpandedView = ({ initialEvent, bottomSheetModalRef, modalIndex, onClose }: ExpandedViewProps) => {
  const { mutateEvent, uniqueCalendars } = useCalendarEvents();
  const { theme } = useUIContext();
  const { calendarObjs } = useCalendarObjects();
  const styles = eventViewStyles(theme.isDark);
  const inputColor = theme.isDark ? COLORS.text.light : COLORS.text.lightGray;
  const iconColor = getIconColor(theme.isDark);
  const [titleHeight, setTitleHeight] = useState(35);

  const [event, setEvent] = useState<EventObj>(initialEvent);
  const [creatingEvent, setCreatingEvent] = useState<boolean>(initialEvent.id === '');
  const [editableEvent, setEditableEvent] = useState<boolean>(false);
  const [recurringEvent, setRecurringEvent] = useState<boolean>(false);
  const [firstRecurringEvent, setFirstRecurringEvent] = useState<boolean>(false);
  const baselineRef = useRef<EventObj>(initialEvent);
  const hasChanges = !eventsAreEqual(event, baselineRef.current);

  // Update Local event
  useEffect(() => {
    if (initialEvent.recurringEventId) {
      const targetCalendar = uniqueCalendars.find((cal) => cal.id === initialEvent.calendarId);
      const foundEvent = targetCalendar?.events.find((e) => e.id === initialEvent.recurringEventId);

      if (foundEvent?.recurrence) {
        initialEvent.recurrence = foundEvent.recurrence;
        setRecurringEvent(true);
        if (foundEvent.startDate.getTime() === initialEvent.startDate.getTime()) {
          setFirstRecurringEvent(true);
        } else setFirstRecurringEvent(false);
      } else {
        setRecurringEvent(false);
        setFirstRecurringEvent(false);
      }
    } else {
      setRecurringEvent(false);
      setFirstRecurringEvent(false);
    }

    setEvent(initialEvent);
    baselineRef.current = initialEvent;
    setCreatingEvent(initialEvent.id === '');

    const cal = calendarObjs?.find((c) => c.calendarId === initialEvent.calendarId);
    if (!cal) setEditableEvent(true);
    else setEditableEvent(cal.accessRole === 'writer' || cal.accessRole === 'owner');
  }, [initialEvent, uniqueCalendars]);

  const updateField = (field: keyof EventObj, value: any) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
  };

  const closeModal = () => {
    initialEvent = { sequence: -1 } as EventObj;
    setCreatingEvent(false);
    setEditableEvent(false);
    setRecurringEvent(false);
    setFirstRecurringEvent(false);
    onClose();
  };

  const handleLocationSelect = ({ address }: { address: string }) => {
    updateField('location', address);
  };

  const handleCalendarObjectSelect = (calendarId: string) => {
    updateField('calendarId', calendarId);
  };

  const handleWebChange = (event: any) => {
    if (Platform.OS === 'web') {
      const el = event.target;
      el.style.height = '0px';
      const nextHeight = Math.max(40, el.scrollHeight);

      el.style.height = `${nextHeight}px`;
      setTitleHeight(nextHeight);
    }
  };

  // ─── Delete & Edit handlers ───────────────────────────────────────────────────────────

  const [mutateModalVisible, setMutateModalVisible] = useState(false);
  const [mutateRecurrenceType, setMutateRecurrenceType] = useState<'delete' | 'edit'>('delete');

  const handleDelete = (option: 'this' | 'following' | 'all') => {
    if (option === 'this') {
      mutateEvent.deleteSingleEvent(event);
    } else if (option === 'all') {
      mutateEvent.deleteAllRecurringEvents(event);
    } else if (option === 'following') {
      mutateEvent.deleteThisAndFollowingEvents(event);
    }

    closeModal();
  };

  const handleDeleteModal = () => {
    if (recurringEvent) {
      setMutateRecurrenceType('delete');
      setMutateModalVisible(true);
    } else handleDelete('this');
  };

  const handleEdit = (option: 'this' | 'following' | 'all') => {
    if (option === 'this') {
      mutateEvent.editEvent(event);
    } else if (option === 'all') {
      mutateEvent.editAllRecurringEvents(event);
    } else if (option === 'following') {
      mutateEvent.editThisAndFollowingEvents(event);
    }

    closeModal();
  };

  const handleEditModal = () => {
    if (recurringEvent) {
      setMutateRecurrenceType('edit');
      setMutateModalVisible(true);
    } else handleEdit('this');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {editableEvent && creatingEvent && (
            <Pressable
              style={[
                styles.card,
                {
                  padding: 8,
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  gap: 5,
                  alignItems: 'center',
                  marginBottom: 8,
                  backgroundColor:
                    hasChanges && event.title !== ''
                      ? theme.isDark
                        ? COLORS.primaryy.light
                        : COLORS.primaryy.dark
                      : theme.isDark
                        ? COLORS.primaryy.mutedBackgroundDark
                        : COLORS.primaryy.mutedBackgroundLight,
                },
              ]}
              onPress={() => {
                if (editableEvent && creatingEvent && event.title !== '') {
                  closeModal();
                  mutateEvent.createEvent(event);
                }
              }}
            >
              <Ionicons
                name={'add-outline'}
                size={16}
                color={
                  hasChanges && event.title !== ''
                    ? theme.isDark
                      ? COLORS.text.light
                      : COLORS.text.light
                    : theme.isDark
                      ? COLORS.primaryy.mutedTextLight
                      : COLORS.primaryy.mutedTextDark
                }
              />
              <Text
                style={{
                  marginRight: 5,
                  color:
                    hasChanges && event.title !== ''
                      ? theme.isDark
                        ? COLORS.text.light
                        : COLORS.text.light
                      : theme.isDark
                        ? COLORS.primaryy.mutedTextLight
                        : COLORS.primaryy.mutedTextDark,
                }}
              >
                Create Event
              </Text>
            </Pressable>
          )}
          {editableEvent && !creatingEvent && (
            <Pressable
              style={[
                styles.card,
                {
                  padding: 8,
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  gap: 5,
                  alignItems: 'center',
                  marginBottom: 8,
                  backgroundColor:
                    hasChanges && event.title !== ''
                      ? theme.isDark
                        ? COLORS.primaryy.light
                        : COLORS.primaryy.dark
                      : theme.isDark
                        ? COLORS.primaryy.mutedBackgroundDark
                        : COLORS.primaryy.mutedBackgroundLight,
                },
              ]}
              onPress={() => {
                if (hasChanges) handleEditModal();
              }}
            >
              <Text
                style={{
                  marginHorizontal: 5,
                  color:
                    hasChanges && event.title !== ''
                      ? theme.isDark
                        ? COLORS.text.light
                        : COLORS.text.light
                      : theme.isDark
                        ? COLORS.primaryy.mutedTextLight
                        : COLORS.primaryy.mutedTextDark,
                }}
              >
                Save Changes
              </Text>
            </Pressable>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {editableEvent && !creatingEvent && (
              <>
                <Pressable
                  style={[
                    styles.card,
                    {
                      padding: 8,
                      paddingHorizontal: 12,
                      alignSelf: 'flex-start',
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                      marginBottom: 8,
                    },
                  ]}
                  onPress={() => {
                    closeModal();
                    mutateEvent.createEvent(event);
                  }}
                >
                  <Ionicons name={'copy-outline'} size={16} color={iconColor} />
                </Pressable>
                <Pressable
                  style={[
                    styles.card,
                    {
                      padding: 8,
                      paddingHorizontal: 12,
                      alignSelf: 'flex-start',
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                      marginBottom: 8,
                    },
                  ]}
                  onPress={handleDeleteModal}
                >
                  <Ionicons name={'trash-outline'} size={16} color={iconColor} />
                </Pressable>
              </>
            )}
          </View>
        </View>
        {/* Title */}
        <View style={styles.card}>
          <TextInput
            style={[styles.titleInput, { height: titleHeight }]}
            value={event.title}
            onChangeText={(text) => updateField('title', text)}
            onFocus={() => bottomSheetModalRef.current?.snapToIndex(1)}
            onChange={Platform.OS === 'web' ? handleWebChange : undefined}
            onContentSizeChange={Platform.OS !== 'web' ? (e) => setTitleHeight(e.nativeEvent.contentSize.height) : undefined}
            placeholder="Add Title"
            placeholderTextColor={inputColor}
            multiline={true}
            scrollEnabled={false}
            editable={editableEvent}
          />
        </View>
        {/* Time */}
        <View style={styles.card}>
          <EventTimeDatePicker event={event} editable={editableEvent} onUpdate={updateField} />
        </View>
        {/* Place */}
        <View style={[styles.card, { zIndex: 10, padding: 0 }]}>
          <PlaceSearchBar initialValue={event.location} onLocationSelect={handleLocationSelect} editable={editableEvent} />
        </View>
        {/* Calendar Obj */}
        <View style={styles.card}>
          <CalendarObjView calendarId={event.calendarId} creatingEvent={creatingEvent} calendarObjectSelect={handleCalendarObjectSelect} />
        </View>
        {/* Description */}
        <View style={styles.card}>
          <TextInput
            style={styles.descriptionInput}
            value={event.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Add description…"
            placeholderTextColor={inputColor}
            multiline
            scrollEnabled={false}
            editable={editableEvent}
          />
        </View>
      </View>
      <MutateRecurrenceModal
        isVisible={mutateModalVisible}
        setVisible={setMutateModalVisible}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        options={
          firstRecurringEvent
            ? [
                { value: 'this', label: 'This event' },
                { value: 'following', label: 'This and following events' },
                { value: 'all', label: 'All events' },
              ]
            : [
                { value: 'this', label: 'This event' },
                { value: 'following', label: 'This and following events' },
                { value: 'all', label: 'All events' },
              ]
        }
        type={mutateRecurrenceType}
      />
    </>
  );
};
