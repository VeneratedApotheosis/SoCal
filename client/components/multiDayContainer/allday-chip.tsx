import { ALL_DAY_HEIGHT, EVENT_GAP } from '@/utility/constants';
import { lightenColor } from '@/utility/eventUtils';
import { getEventCardStyles } from '@/utility/globalStyles';
import { EventObj } from '@/utility/types';
import React, { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';

export interface AllDayChipProps {
  event: EventObj;
  dayWidth: number;
  selectedEvent: EventObj | null;
  isVisible: boolean;
  handlePress: (event: EventObj) => void;
}

const AllDayChip = ({ event, dayWidth, selectedEvent, isVisible, handlePress }: AllDayChipProps) => {
  const { colorCache, theme } = useUIContext();
  const styles = getEventCardStyles(theme.isDark);

  const selectedThisEvent = useMemo(() => {
    if (!selectedEvent || !isVisible) return false;
    return selectedEvent.id === event.id;
  }, [selectedEvent, isVisible]);

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
      onPress={() => handlePress(event)}
      style={[
        styles.eventContainer,
        {
          height: ALL_DAY_HEIGHT,
          width: dayWidth - EVENT_GAP,
          position: 'relative',
        },
      ]}
    >
      <View
        style={[
          styles.event,
          { backgroundColor: rawColor, borderLeftColor: borderColor, padding: 3 },
          selectedThisEvent && { backgroundColor: borderColor, borderLeftColor: borderColor },
        ]}
      >
        <Text style={[styles.eventText, { color: textColor }, selectedThisEvent && { color: rawColor }]} numberOfLines={1}>
          {event.title}
        </Text>
      </View>
    </Pressable>
  );
};

export default memo(AllDayChip);
