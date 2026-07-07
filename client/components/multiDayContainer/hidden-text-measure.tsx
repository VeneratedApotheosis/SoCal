import { HOUR_LABEL_WIDTH } from '@/utility/constants';
import { getBasicTypographyStyles } from '@/utility/globalStyles';
import { EventObj } from '@/utility/types';
import React from 'react';
import { Text, View } from 'react-native';
import { useScreenSize } from '../contexts/screen-size-context';
import { useUIContext } from '../contexts/ui-context';
import { AllDayStyles } from './multiDayStyles';

export interface TextMeasurerProps {
  extraLongAllday: EventObj[];
  setWidthsDictionary: React.Dispatch<React.SetStateAction<{}>>;
  widthsDictionary: {};
}

export default function TextMeasurer({ extraLongAllday, setWidthsDictionary, widthsDictionary }: TextMeasurerProps) {
  const { theme } = useUIContext();
  const baseText = getBasicTypographyStyles(theme.isDark);
  const left = AllDayStyles.marginLeft + AllDayStyles.borderLeftWidth + AllDayStyles.padding;
  const SCREEN_WIDTH = useScreenSize().width;

  return (
    <View
      style={{
        position: 'absolute',
        left: left + HOUR_LABEL_WIDTH,
        maxWidth: SCREEN_WIDTH - 2 * left,
        opacity: 0,
        zIndex: -1,
        flexDirection: 'column',
      }}
    >
      {extraLongAllday.map((e, index) => {
        return (
          <View key={e.id} style={{ flexDirection: 'row' }}>
            <View
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                console.log(`Measured: Width: ${width}, Title: ${e.id}`);
                setWidthsDictionary((prev) => ({
                  ...prev,
                  [e.id]: width,
                }));
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...baseText.caption,
                }}
              >
                {e.title}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
