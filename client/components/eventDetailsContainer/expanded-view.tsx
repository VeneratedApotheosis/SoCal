import { COLORS } from '@/utility/theme';
import { EventObj } from '@/utility/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useUIContext } from '../contexts/ui-context';
import CalendarObjView from './calendar-obj-view';
import { eventViewStyles } from './eventDetailsStyles';
import { EventTimeDatePicker } from './expanded-view-time';
import PlaceSearchBar from './location-container';
import { MutateButtons } from './mutate-buttons';
import MutateRecurrenceModal from './mutate-recurrence-modal';

interface ExpandedViewProps {
  initialEvent: EventObj;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  onClose: () => void;
  setNewEvent: React.Dispatch<React.SetStateAction<EventObj | null>>;
  newEvent: EventObj | null;
}

export function eventsAreEqual(a: EventObj, b: EventObj): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export const EventExpandedView = ({ initialEvent, bottomSheetModalRef, onClose, setNewEvent, newEvent }: ExpandedViewProps) => {
  const { mutateEvent, uniqueCalendars } = useCalendarEvents();
  const { theme } = useUIContext();
  const { calendarObjs } = useCalendarObjects();
  const styles = eventViewStyles(theme.isDark);
  const inputColor = theme.isDark ? COLORS.text.subtleDark : COLORS.text.lightGray;

  const [event, setEvent] = useState<EventObj>(initialEvent);
  const [creatingEvent, setCreatingEvent] = useState<boolean>(initialEvent.id === '');
  const [editableEvent, setEditableEvent] = useState<boolean>(false);
  const [recurringEvent, setRecurringEvent] = useState<boolean>(false);
  const [firstRecurringEvent, setFirstRecurringEvent] = useState<boolean>(false);
  const baselineRef = useRef<EventObj>(initialEvent);
  const hasChanges = !eventsAreEqual(event, baselineRef.current);
  const [error, setError] = useState<boolean>(false);

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
    if (newEvent) {
      setNewEvent((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
    }
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

  // ─── Title and Description Heigth Calc ───────────────────────────────────────────────────────────

  const [titleHeight, setTitleHeight] = useState(36);
  const [descriptionHeight, setDescriptionHeight] = useState(36);
  const titleInputRef = useRef<any>(null);
  const descriptionInputRef = useRef<any>(null);

  const handleWebTitleChange = (event: any) => {
    if (Platform.OS === 'web') {
      const el = event.target;
      el.style.height = '0px';
      const nextHeight = Math.max(40, el.scrollHeight);

      el.style.height = `${nextHeight}px`;
      setTitleHeight(nextHeight);
    }
  };

  const handleWebDescriptionChange = (event: any) => {
    if (Platform.OS === 'web') {
      const el = event.target;
      el.style.height = '0px';
      const nextHeight = Math.max(40, el.scrollHeight);

      el.style.height = `${nextHeight}px`;
      setDescriptionHeight(nextHeight);
    }
  };

  //update height when base event changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Resize Title
      if (titleInputRef.current) {
        const el = titleInputRef.current;
        el.style.height = '0px';
        const nextHeight = Math.max(40, el.scrollHeight);
        el.style.height = `${nextHeight}px`;
        setTitleHeight(nextHeight);
      }

      // Resize Description (if you have one)
      if (descriptionInputRef.current) {
        const el = descriptionInputRef.current;
        el.style.height = '0px';
        const nextHeight = Math.max(40, el.scrollHeight);
        el.style.height = `${nextHeight}px`;
        setDescriptionHeight(nextHeight);
      }
    }
  }, [event.title]);

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

  console.log(error);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.card}>
          <TextInput
            ref={titleInputRef}
            style={[styles.titleInput, { height: titleHeight }, event.title.length === 0 && { fontStyle: 'italic' }]}
            value={event.title}
            onChangeText={(text) => updateField('title', text)}
            onFocus={() => bottomSheetModalRef.current?.snapToIndex(1)}
            onChange={Platform.OS === 'web' ? handleWebTitleChange : undefined}
            onContentSizeChange={Platform.OS !== 'web' ? (e) => setTitleHeight(e.nativeEvent.contentSize.height) : undefined}
            placeholder="Add Title..."
            placeholderTextColor={inputColor}
            multiline={true}
            scrollEnabled={false}
            editable={editableEvent}
          />
        </View>
        {/* Time */}
        <View style={[styles.card, { flex: 1 }]}>
          <EventTimeDatePicker event={event} editable={editableEvent} onUpdate={updateField} setError={setError} />
        </View>
        {/* Place */}
        <View style={[styles.card, { zIndex: 10, padding: 0 }]}>
          <PlaceSearchBar
            initialValue={event.location}
            onLocationSelect={handleLocationSelect}
            editable={editableEvent}
            inputColor={inputColor}
          />
        </View>
        {/* Calendar Obj */}
        <View style={styles.card}>
          <CalendarObjView calendarId={event.calendarId} creatingEvent={creatingEvent} calendarObjectSelect={handleCalendarObjectSelect} />
        </View>
        {/* Description */}
        <View style={styles.card}>
          <TextInput
            style={[
              styles.descriptionInput,
              {
                minHeight: 0,
                height: descriptionHeight,
              },
              event.description.length === 0 && { fontStyle: 'italic' },
            ]}
            ref={descriptionInputRef}
            value={event.description}
            onChangeText={(text) => updateField('description', text)}
            onChange={Platform.OS === 'web' ? handleWebDescriptionChange : undefined}
            onContentSizeChange={Platform.OS !== 'web' ? (e) => setDescriptionHeight(e.nativeEvent.contentSize.height) : undefined}
            placeholder="Add description…"
            placeholderTextColor={inputColor}
            multiline
            scrollEnabled={false}
            editable={editableEvent}
          />
        </View>
        {/* Mutate Buttons */}
        <MutateButtons
          editableEvent={editableEvent}
          creatingEvent={creatingEvent}
          hasChanges={hasChanges}
          event={event}
          closeModal={closeModal}
          handleEditModal={handleEditModal}
          handleDeleteModal={handleDeleteModal}
          timeError={error}
        />
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
    </View>
  );
};
