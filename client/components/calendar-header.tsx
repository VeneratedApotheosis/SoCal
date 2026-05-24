import { HEADER_HEIGHT } from '@/utility/constants';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from './contexts/auth-context';
import { DateContext } from './contexts/calendar-index-context';

export default function CalendarHeader(props: any) {
  const { jwtToken } = useAuthContext();
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { curDate, setCurDate } = useContext(DateContext);
  const handleSnapToToday = () => {
    const today = new Date();
    setCurDate(today);
  };

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
            <Text style={styles.headerDateText}>{curDate.toLocaleString('default', { month: 'long' })}</Text>
          </View>

          {/* --- Extra Buttons on the Right --- */}

          <View style={styles.headerButtonContainer}>
            <View style={{ justifyContent: 'center' }}>
              <Pressable style={styles.headerButton} onPress={handleSnapToToday}>
                <Text style={{ fontWeight: 500, fontSize: 16 }}>{currentDate.toLocaleString('default', { day: 'numeric' })}</Text>
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
  headerDateText: {
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: SIZES.xl,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // --- Android Shadows ---
    elevation: 3,
  },
});
