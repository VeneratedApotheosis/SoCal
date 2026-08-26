import DayContainer from '@/components/multiDayContainer/day-container';
import { getEventCardStyles } from '@/components/multiDayContainer/multiDayStyles';
import { WEB_WHITE_X_PADDING, WEB_WHITE_Y_PADDING } from '@/utility/constants';
import { lightenColor } from '@/utility/eventColorUtil';
import { addDays } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { FONT_WEIGHTS, RADII, SPACING, TYPOGRAPHY } from './homeScreenStyles';

export function MockCalendar() {
  const styles = mockCalendarStyles;
  const scrollY = useSharedValue<number>(0);
  const currentAllDayHeight = useSharedValue<number>(0);

  const isDraggingCreate = useSharedValue<boolean>(false);
  const dragStartDayIdx = useSharedValue<number>(-1);
  const dragStartMins = useSharedValue<number>(0);
  const dragCurrentMins = useSharedValue<number>(0);
  const today = new Date();

  const webContainerRef = useRef<any>(null);
  useEffect(() => {
    if (Platform.OS !== 'web' || !webContainerRef.current) return;
    const node = webContainerRef.current;

    const handleWheel = (e: WheelEvent) => {
      const isHorizontalScroll = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontalScroll) return;

      const minScroll = -currentAllDayHeight.value;
      const maxScroll = 500;
      scrollY.value = Math.max(minScroll, Math.min(scrollY.value + e.deltaY, maxScroll));
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // ─── Get Width of Mock Container ───────────────────────────────────────────────────────────

  const [boxWidth, setBoxWidth] = useState(0);

  const handleLayout = (event: any) => {
    try {
      const { width, height, x, y } = event.nativeEvent.layout;
      setBoxWidth(width);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.padding} onLayout={handleLayout}>
      <Animated.View ref={webContainerRef} style={{ width: '100%', height: 0 }}></Animated.View>
      <View style={styles.calendar}>
        <DayContainer
          day={addDays(today, -1)}
          dayWidth={Math.floor((boxWidth - 2 * WEB_WHITE_X_PADDING) / 3)}
          hourHeight={40}
          eventsWithLayout={[]}
          allDayEvents={[]}
          scrollY={scrollY}
          currentAllDayHeight={currentAllDayHeight}
          handlePress={() => {}}
          newEvent={null}
          selectedEventId={null}
          isVisible={false}
          dragStartDayIdx={dragStartDayIdx}
          dragStartMin={dragStartMins}
          dragCurrentDayMin={dragCurrentMins}
          isDraggingCreate={isDraggingCreate}
        />
        <DayContainer
          day={addDays(today, 0)}
          dayWidth={Math.floor((boxWidth - 2 * WEB_WHITE_X_PADDING) / 3)}
          hourHeight={40}
          eventsWithLayout={[]}
          allDayEvents={[]}
          scrollY={scrollY}
          currentAllDayHeight={currentAllDayHeight}
          handlePress={() => {}}
          newEvent={null}
          selectedEventId={null}
          isVisible={false}
          dragStartDayIdx={dragStartDayIdx}
          dragStartMin={dragStartMins}
          dragCurrentDayMin={dragCurrentMins}
          isDraggingCreate={isDraggingCreate}
        />
        <DayContainer
          day={addDays(today, 1)}
          dayWidth={Math.floor((boxWidth - 2 * WEB_WHITE_X_PADDING) / 3)}
          hourHeight={40}
          eventsWithLayout={[]}
          allDayEvents={[]}
          scrollY={scrollY}
          currentAllDayHeight={currentAllDayHeight}
          handlePress={() => {}}
          newEvent={null}
          selectedEventId={null}
          isVisible={false}
          dragStartDayIdx={dragStartDayIdx}
          dragStartMin={dragStartMins}
          dragCurrentDayMin={dragCurrentMins}
          isDraggingCreate={isDraggingCreate}
        />
      </View>
    </View>
  );
}

export function MockEvent({
  color,
  top,
  height,
  left,
  width,
  offset,
  opacity,
  selectedThisEvent,
  text,
}: {
  color: string;
  top: number;
  height: number;
  left: number;
  width: number;
  offset: number;
  opacity: number;
  selectedThisEvent: boolean;
  text: string;
}) {
  const styles = getEventCardStyles(false);
  const rawColor = color;
  const borderColor = lightenColor(rawColor, 'border', false);
  const textColor = lightenColor(rawColor, 'text', false);

  return (
    <Pressable
      onPress={() => {}}
      delayLongPress={0}
      style={[
        styles.eventContainer,
        {
          top: top,
          height: height,
          width: width,
          left: left,
          zIndex: offset,
          elevation: offset,
          opacity: opacity,
        },
      ]}
      hitSlop={5}
    >
      {/* --- EVENT LEFT BAR --- */}
      <View
        style={[
          styles.event,
          {
            backgroundColor: rawColor,
            borderLeftWidth: 6,
            borderWidth: 0,
            borderLeftColor: borderColor,
            borderColor: borderColor,
            opacity: 1,
          },
          selectedThisEvent && { backgroundColor: borderColor, borderLeftColor: borderColor },
        ]}
      >
        <View style={{ overflow: 'hidden' }}>
          {/* --- EVENT TITLE --- */}
          <Text
            style={[styles.eventText, { color: selectedThisEvent ? rawColor : textColor }]}
            numberOfLines={Math.floor((height - 8) / 13)}
          >
            {text}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const mockCalendarStyles = StyleSheet.create({
  padding: {
    paddingHorizontal: WEB_WHITE_X_PADDING,
    paddingVertical: WEB_WHITE_Y_PADDING,
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: 500,
    flex: 1,
    overflow: 'hidden',
    boxShadow: '10px 10px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  calendar: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  calendarHeader: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'COLORS.border',
  },

  calendarTitle: {
    color: 'COLORS.calendarTitle',
    fontSize: TYPOGRAPHY.body,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  calendarHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },

  sevenDays: {
    color: 'COLORS.secondaryText',
    backgroundColor: 'COLORS.controlBackground',
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADII.small,
    fontSize: TYPOGRAPHY.small,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: RADII.large,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: 'COLORS.white',
    fontSize: TYPOGRAPHY.small,
    fontWeight: FONT_WEIGHTS.bold,
  },

  dayHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'COLORS.border',
  },

  dayHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.s,
  },

  dayLabel: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.small,
    fontWeight: FONT_WEIGHTS.medium,
  },

  dayNumber: {
    color: 'COLORS.darkText',
    fontSize: TYPOGRAPHY.large,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: 2,
  },

  activeBlue: {
    color: 'COLORS.primary',
  },

  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  hourLabel: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.micro,
    textAlign: 'right',
    paddingRight: SPACING.s,
    marginTop: -6,
  },

  hourLine: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'COLORS.gridLine',
  },

  mockEvent: {
    position: 'absolute',
    borderLeftWidth: 3,
    borderRadius: RADII.small,
    paddingHorizontal: 5,
    paddingVertical: 2,
    overflow: 'hidden',
  },

  mockEventTitle: {
    fontSize: TYPOGRAPHY.micro,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 12,
  },

  mockEventTime: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.tiny,
    lineHeight: 11,
  },

  calendarUsers: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: 'COLORS.border',
    backgroundColor: 'COLORS.softBackground',
  },

  userLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  userDot: {
    width: 8,
    height: 8,
    borderRadius: RADII.small,
  },

  userName: {
    color: 'COLORS.secondaryText',
    fontSize: TYPOGRAPHY.small,
  },
});
