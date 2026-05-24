import { EVENT_OFFSET } from '@/utility/constants';
import { EventObj, EventWithOffset } from '@/utility/types';
import { UIContext } from '../contexts/ui-context';

import React, { memo, useContext, useMemo } from 'react';

import { lightenColor } from '@/utility/eventUtils';
import { Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { getEventLayout } from '@/utility/eventUtils';
import { getEventCardStyles } from '@/utility/globalStyles';

export interface EventContainerProps {
  eventWithOffset: EventWithOffset;
  dayWidth: number;
  hourHeight: number;
  onSelect: (event: EventObj) => void;
  isVisible: boolean;
  selectedEvent: EventObj | null;
}

//TODO: MAKE THIS LOOK PRETTY
function EventContainer({ eventWithOffset, dayWidth, hourHeight, onSelect, isVisible, selectedEvent }: EventContainerProps) {
  const { event, offset, maxOffset } = eventWithOffset;
  const { colorCache, theme } = useContext(UIContext);
  const styles = getEventCardStyles(theme.isDark);

  //position on screen
  const layout = useMemo(() => {
    return getEventLayout(event, offset, maxOffset, hourHeight, dayWidth, EVENT_OFFSET);
  }, [event, offset, hourHeight, dayWidth]);

  const selectedThisEvent = useMemo(() => {
    if (!selectedEvent || !isVisible) return false;
    return selectedEvent.id === eventWithOffset.event.id;
  }, [selectedEvent, isVisible]);

  const totalOffset: number = useMemo(() => {
    if (!selectedThisEvent) return offset + 100;
    else return 200;
  }, [selectedEvent, offset]);

  //color on screen
  const rawColor = useMemo(() => {
    let c = colorCache.getCalendarColor(event.calendarId);
    return lightenColor(c, 'raw');
  }, [colorCache.allCaches, colorCache.activeCacheId, event.calendarId]);
  const borderColor = useMemo(() => {
    return lightenColor(rawColor, 'border');
  }, [rawColor]);
  const textColor = useMemo(() => {
    return lightenColor(rawColor, 'text');
  }, [rawColor]);

  return (
    <Pressable
      onPress={() => onSelect(event)}
      delayLongPress={0}
      style={[
        styles.eventContainer,
        {
          ...layout,
          zIndex: totalOffset,
          elevation: totalOffset, // Required for Android layering
        },
      ]}
      hitSlop={5}
    >
      {/* --- EVENT LEFT BAR --- */}
      <View
        style={[
          styles.event,
          { backgroundColor: rawColor, borderLeftColor: borderColor },
          selectedThisEvent && { backgroundColor: borderColor, borderLeftColor: borderColor },
        ]}
      >
        {/* --- EVENT TITLE --- */}
        <Text style={[styles.eventText, { color: textColor }, selectedThisEvent && { color: rawColor }]} numberOfLines={1}>
          {event.title}
        </Text>
      </View>
    </Pressable>
  );
}

// 2. Create the custom comparison function
const areEqual = (prevProps: EventContainerProps, nextProps: EventContainerProps) => {
  // Check layout-affecting props
  if (prevProps.dayWidth !== nextProps.dayWidth) return false;
  if (prevProps.hourHeight !== nextProps.hourHeight) return false;
  if (prevProps.isVisible !== nextProps.isVisible) return false;

  // Check if the event data itself changed
  if (prevProps.eventWithOffset.event.id !== nextProps.eventWithOffset.event.id) return false;
  if (prevProps.eventWithOffset.offset !== nextProps.eventWithOffset.offset) return false;
  if (prevProps.eventWithOffset.maxOffset !== nextProps.eventWithOffset.maxOffset) return false;

  // Check selection logic: Only re-render if THIS specific event's selection status changed
  const wasSelected = prevProps.selectedEvent?.id === prevProps.eventWithOffset.event.id;
  const isSelected = nextProps.selectedEvent?.id === nextProps.eventWithOffset.event.id;

  if (wasSelected !== isSelected) return false;

  // If we made it here, nothing important changed. Skip the re-render!
  return true;
};

// 3. Export the memoized component
export default memo(EventContainer, areEqual);
