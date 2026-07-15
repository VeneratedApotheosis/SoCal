import { EventWithLayout } from '@/utility/types';
import React from 'react';
import { View } from 'react-native';
import AllDayEvents from './all-day-events';

// --- CONSTANTS ---
const GRID_COLOR = '#f0f0f0';
export interface DayBoxProps {
  day: Date;
  weekHeight: number;
  dayWidth: number;
  event: EventWithLayout[];
}

export default function DayBox({ day, weekHeight, dayWidth, event }: DayBoxProps) {
  return (
    <View
      style={{
        width: dayWidth,
        height: weekHeight,
        borderWidth: 1,
        borderColor: GRID_COLOR,
        flex: 1,
      }}
    >
      {event.map((event, idx) => {
        const key = event && event.event ? event.event.id + day.toISOString() : idx + day.toISOString();
        return (
          <AllDayEvents
            key={key}
            event={event.event}
            day={day}
            layout={event}
            handlePress={() => {}}
            dayWidth={dayWidth}
            isVisible={false}
            selectedEventId={'selectedEventId'}
            isDummy={event.dummy}
            idx={idx}
          />
        );
      })}
    </View>
  );
}
