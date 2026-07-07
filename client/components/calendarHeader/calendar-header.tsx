import { getHeaderStyles, getIconColor } from '@/utility/globalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { DeviceEventEmitter, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../contexts/auth-context';
import { useCalendarIndex } from '../contexts/calendar-index-context';
import { useUIContext } from '../contexts/ui-context';
import { FetchStatusIcon } from './fetch-status-icon';

export default function CalendarHeader() {
  const { jwtToken } = useAuthContext();
  const navigation = useNavigation();
  const { currentMonthText } = useCalendarIndex();
  const { now, theme } = useUIContext();
  const styles = getHeaderStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);
  const handleJumpToToday = () => {
    // Fire off the signal instantly
    DeviceEventEmitter.emit('JUMP_TO_TODAY');
  };

  return (
    <SafeAreaView edges={['top']}>
      {jwtToken && (
        <View style={styles.headerContainer}>
          {/* --- Waffle --- */}
          <View style={{ justifyContent: 'center' }}>
            <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.waffle}>
              <Ionicons name="menu" size={28} color={iconColor} />
            </Pressable>
          </View>

          {/* --- Date --- */}
          <View style={{ justifyContent: 'center' }}>
            <TextInput style={styles.headerText} editable={false} value={currentMonthText} />
          </View>

          {/* --- Extra Buttons on the Right --- */}

          <View style={styles.headerButtonContainer}>
            <FetchStatusIcon isLoading={false} />
            <View style={{ justifyContent: 'center' }}>
              <Pressable style={styles.headerButton} onPress={handleJumpToToday}>
                <Text style={styles.headerButtonText}>{now.toLocaleString('default', { day: 'numeric' })}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
