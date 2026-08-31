import { ALL_DAY_HEIGHT } from '@/utility/constants';
import { createEventObj } from '@/utility/eventUtils';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { EventObj, EventWithLayout } from '@/utility/types';
import { addDays } from 'date-fns';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCalendarIndex } from '../contexts/calendar-index-context';
import { useScreenSize } from '../contexts/screen-size-context';
import { useTimeZoneContext } from '../contexts/time-zone-context';
import { useUIContext } from '../contexts/ui-context';
import { webEventWidth } from '../eventDetailsContainer/web-event-details';
import { getEventDayBounds } from '../multiDayContainer/day-container';
import AllDayEvents from './all-day-events';
import DayEventsModal from './more-modal';

export interface DayBoxProps {
  day: Date;
  weekHeight: number;
  dayWidth: number;
  event: EventWithLayout[];
  handlePress: (event: EventObj | null, newEvent: boolean, e: any) => void;
  newEvent: EventObj | null;
  selectedEventId: string | null;
}

export default function DayBox({ day, weekHeight, dayWidth, event, handlePress, newEvent, selectedEventId }: DayBoxProps) {
  const { theme, now } = useUIContext();
  const { currentMonthText } = useCalendarIndex();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();
  const { timeZone } = useTimeZoneContext();
  const style = getDayStyles(theme.isDark);
  const dayText = day.getDate() === 1 ? day.toLocaleString('default', { month: 'short' }) + ' ' + day.getDate() : day.getDate();

  const { newEventToday, newEventAllDay, newEventStartDate, newEventEndDate } = getEventDayBounds(newEvent, day);

  const isToday = useMemo(() => {
    if (!now || !day) return false;
    return now.toDateString() === day.toDateString();
  }, [now, day]);

  // # more calculation
  const numEvents = Math.floor(weekHeight / ALL_DAY_HEIGHT) - 1;
  const hasMore = event.length > numEvents;
  const numMore = event.length - numEvents + 1;
  const displayedEvents = event.length > numEvents ? event.slice(0, numEvents - 1) : event;

  // Color difference calculations
  const isElevated = day.getDay() === 0 || day.getDay() === 6;
  const thisMonth = currentMonthText === day.toLocaleString('default', { month: 'long' });

  const handleEventSelect = useCallback(
    (event: EventObj, e: any) => {
      handlePress(event, false, e);
    },
    [handlePress],
  );

  const createEventToday = useCallback(() => {
    const today = new Date(day);
    today.setHours(0, 0, 0, 0);
    const draftEvent = createEventObj(
      {
        startDate: today,
        endDate: addDays(today, 1),
        title: '',
        allDay: true,
      },
      timeZone,
    );
    handlePress(draftEvent, true, { x: SCREEN_WIDTH / 2 - webEventWidth / 2, y: SCREEN_HEIGHT / 2 });
  }, [SCREEN_WIDTH, webEventWidth, SCREEN_HEIGHT, day, timeZone, handlePress]);

  // ─── More Modal Stuff ───────────────────────────────────────────────────────────

  const handleMoreRef = useRef<View>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalX, setModalX] = useState<number>(-1000);
  const [modalY, setModalY] = useState<number>(-1000);

  const handleMore = () => {
    if (!handleMoreRef || !handleMoreRef.current) return;
    handleMoreRef.current.measure((x, y, width, height, pageX, pageY) => {
      setModalX(Math.floor(pageX + width / 2));
      setModalY(Math.floor(pageY + height / 2));
      setModalVisible(true);
    });
  };

  return (
    <>
      <Pressable
        onPress={() => createEventToday()}
        ref={handleMoreRef}
        style={[
          style.dayContainer,
          day.getDay() === 6 && { borderRightWidth: 1 },
          {
            backgroundColor: theme.isDark
              ? isElevated
                ? COLORS.background.elevatedDark
                : COLORS.background.dark
              : isElevated
                ? COLORS.background.elevatedLight
                : COLORS.background.light,
          },
          newEventToday && style.newEvent,
        ]}
      >
        <View style={style.dateTextContainer}>
          <Text
            style={[
              style.dateText,
              thisMonth && { fontWeight: '500' },
              !thisMonth && { color: theme.isDark ? COLORS.text.subtleDark : COLORS.text.subtleLight },
              isToday && style.todayText,
            ]}
          >
            {dayText}
          </Text>
        </View>
        {displayedEvents.map((event, idx) => {
          const key = event && event.event && event.event.id ? event.event.id + day.toISOString() : idx + day.toISOString();
          return (
            <AllDayEvents
              key={key}
              event={event.event}
              day={day}
              layout={event}
              handlePress={handleEventSelect}
              dayWidth={dayWidth}
              selectedEventId={selectedEventId}
              isDummy={event.dummy}
              idx={idx}
            />
          );
        })}
        {hasMore && (
          <Pressable style={{ paddingLeft: 6, height: ALL_DAY_HEIGHT }} onPress={handleMore}>
            <Text style={style.moreText}>{numMore + ' ' + 'more'}</Text>
          </Pressable>
        )}
      </Pressable>
      <DayEventsModal
        isVisible={modalVisible}
        setVisible={setModalVisible}
        x={modalX}
        y={modalY}
        events={event}
        dayWidth={dayWidth}
        day={day}
        handleEventSelect={handleEventSelect}
        selectedEventId={selectedEventId}
        createEventToday={createEventToday}
        newEventToday={newEventToday}
      />
    </>
  );
}

export const getDayStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    dayContainer: {
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      ...baseTheme.border,
      flex: 1,
    },
    newEvent: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
    },
    dateText: {
      ...baseText.body,
      fontSize: 14,
      textAlign: 'center',
      width: '100%',
      textAlignVertical: 'center',
    },
    dateTextContainer: {
      height: ALL_DAY_HEIGHT,
      ...baseFlexStyles.centerAll,
    },
    moreText: {
      ...baseText.body,
      fontSize: 12,
      fontWeight: '500',
      width: '100%',
      textAlignVertical: 'center',
    },
    todayText: { ...baseTheme.blueAccentColor, fontWeight: '500' },
  });
};
