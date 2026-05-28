import { EVENT_OFFSET } from '@/utility/constants';
import { EventObj, EventWithOffset } from '@/utility/types';
import { useUIContext } from '../contexts/ui-context';

import React, { memo, useMemo } from 'react';

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

const lightStyles = getEventCardStyles(false);
const darkStyles = getEventCardStyles(true);

//TODO: MAKE THIS LOOK PRETTY
function EventContainer({ eventWithOffset, dayWidth, hourHeight, onSelect, isVisible, selectedEvent }: EventContainerProps) {
  const { event, offset, maxOffset } = eventWithOffset;
  const { colorCache, theme } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;
  console.log('rendering event');

  //position on screen
  const layout = useMemo(() => {
    return getEventLayout(event, offset, maxOffset, hourHeight, dayWidth, EVENT_OFFSET);
  }, [event, offset, hourHeight, dayWidth]);

  const selectedThisEvent = !!selectedEvent && isVisible && selectedEvent.id === event.id;
  const totalOffset = selectedThisEvent ? 200 : offset + 100;

  //color on screen
  const { rawColor, borderColor, textColor } = useMemo(() => {
    const baseColor = colorCache.getCalendarColor(event.calendarId);
    const raw = lightenColor(baseColor, 'raw');
    return {
      rawColor: raw,
      borderColor: lightenColor(raw, 'border'),
      textColor: lightenColor(raw, 'text'),
    };
  }, [colorCache.allCaches, colorCache.activeCacheId, event.calendarId]);

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
