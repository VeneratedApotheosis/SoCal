import { HEADER_HEIGHT } from '@/utility/constants';
import { COLORS } from '@/utility/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from './contexts/auth-context';
import { useCalendarIndex } from './contexts/calendar-index-context';
import { useUIContext } from './contexts/ui-context';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function CalendarHeader() {
  const { jwtToken } = useAuthContext();
  const navigation = useNavigation();
  const { currentMonthText } = useCalendarIndex();
  const { now } = useUIContext();
  const handleSnapToToday = () => {};
  const today = new Date();

  const animatedProps = useAnimatedProps(
    () =>
      ({
        text: currentMonthText.value,
      }) as any,
  );

  return (
    <SafeAreaView edges={['top']}>
      {jwtToken && (
        <View style={styles.headerContainer}>
          {/* --- Waffle --- */}
          <View style={{ justifyContent: 'center' }}>
            <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.waffle}>
              <Ionicons name="menu" size={28} color="black" />
            </Pressable>
          </View>

          {/* --- Date --- */}
          <View style={{ justifyContent: 'center' }}>
            <AnimatedTextInput
              style={styles.headerText}
              editable={false}
              animatedProps={animatedProps}
              value={today.toLocaleString('default', { month: 'long' })} // Fallback initialization
            />
          </View>

          {/* --- Extra Buttons on the Right --- */}

          <View style={styles.headerButtonContainer}>
            <View style={{ justifyContent: 'center' }}>
              <Pressable style={styles.headerButton} onPress={handleSnapToToday}>
                <Text style={{ fontWeight: 500, fontSize: 16 }}>{now.toLocaleString('default', { day: 'numeric' })}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    backgroundColor: COLORS.background.mutedLight,
    padding: 16,
    gap: 10,
    alignItems: 'stretch',
  },
  waffle: {
    alignSelf: 'flex-start',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    padding: 0,
  },
  headerButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    padding: 2,
    gap: 10,
  },
  headerButton: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    fontWeight: '700',

    // --- iOS Shadows ---
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',

    // --- Android Shadows ---
    elevation: 3,
  },
});
