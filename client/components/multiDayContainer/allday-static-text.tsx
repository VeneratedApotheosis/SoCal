import { ALL_DAY_HEIGHT, DATE_HEADER_HEIGHT, HOUR_LABEL_WIDTH } from '@/utility/constants';
import { getBasicTypographyStyles } from '@/utility/globalStyles';
import { AllDayPool } from '@/utility/types';
import { TextInput } from 'react-native';
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import { useUIContext } from '../contexts/ui-context';
import { AllDayStyles } from './multiDayStyles';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function AllDayPoolChip({
  index,
  eventPool,
  scrollX,
  widthsDictionary,
}: {
  index: number;
  eventPool: SharedValue<AllDayPool[]>;
  scrollX: SharedValue<number>;
  widthsDictionary: Record<string, number>;
}) {
  const { theme } = useUIContext();
  const baseText = getBasicTypographyStyles(theme.isDark);
  const left = AllDayStyles.marginLeft + AllDayStyles.borderLeftWidth + AllDayStyles.padding;

  // Animate Position and Color
  const animatedStyle = useAnimatedStyle(() => {
    const slot = eventPool.value[index];

    return {
      opacity: slot.isActive ? 1 : 0,
      top: DATE_HEADER_HEIGHT + slot.offset * ALL_DAY_HEIGHT,
      backgroundColor: 'transparent',
      transform: [{ translateY: slot.isActive ? 0 : -9999 }],
    };
  });

  //Animate Text Input
  const animatedProps = useAnimatedProps(() => {
    const slot = eventPool.value[index];

    return {
      text: slot.isActive ? slot.name : '',
      color: slot.isActive ? slot.color : 'transparent',
    } as any;
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const slot = eventPool.value[index];
    const length = widthsDictionary[eventPool.value[index].eventId] ?? 0;

    console.log(eventPool.value[index].eventId, length);

    return {
      color: slot.isActive ? slot.color : 'transparent',
      width: slot.isActive ? length : 0,
    };
  });

  const handleContentSizeChange = (event: any) => {
    const width = event.nativeEvent.contentSize.width;
    console.log(width);
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: HOUR_LABEL_WIDTH,
          height: ALL_DAY_HEIGHT - AllDayStyles.bottomMargin,
          justifyContent: 'center',
          zIndex: 300,
          paddingLeft: left,
        },
        animatedStyle,
      ]}
    >
      <AnimatedTextInput
        animatedProps={animatedProps}
        editable={false}
        onContentSizeChange={handleContentSizeChange}
        style={[{ ...baseText.caption }, animatedTextStyle]}
      />
    </Animated.View>
  );
}
