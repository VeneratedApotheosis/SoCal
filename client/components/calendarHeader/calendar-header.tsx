import { WEB_MUTED_PADDING } from '@/utility/constants';
import { getHeaderStyles, getIconColor } from '@/utility/globalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { DeviceEventEmitter, Pressable, Text, TextInput, View } from 'react-native';
import { useAuthContext } from '../contexts/auth-context';
import { useCalendarIndex } from '../contexts/calendar-index-context';
import { useScreenSize } from '../contexts/screen-size-context';
import { useUIContext } from '../contexts/ui-context';
import CalendarTypePicker from './calendar-type';
import { FetchStatusIcon } from './fetch-status-icon';

export default function CalendarHeader() {
  const { validJwt } = useAuthContext();
  const navigation = useNavigation();
  const { currentMonthText } = useCalendarIndex();
  const { now, theme, sideBar, setLoginVisible } = useUIContext();
  const { isWeb, fixedSidebar, headerHeight } = useScreenSize();
  const styles = getHeaderStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);
  const handleJumpToToday = () => {
    DeviceEventEmitter.emit('JUMP_TO_TODAY');
  };

  const wafflePress = () => {
    if (fixedSidebar) {
      sideBar.setSidebarExpanded((prev) => !prev);
      sideBar.setSidebarLoading(true);
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  const handleSettingspress = () => {
    setLoginVisible(true);
  };

  return (
    <>
      {validJwt ? (
        <View
          style={[
            styles.headerContainer,
            { paddingHorizontal: 16 + isWeb * WEB_MUTED_PADDING, paddingTop: isWeb ? 15 : 0, height: headerHeight },
          ]}
        >
          {/* --- Waffle --- */}
          <View style={{ justifyContent: 'center' }}>
            <Pressable onPress={wafflePress} style={styles.waffle}>
              <Ionicons name="menu" size={28} color={iconColor} />
            </Pressable>
          </View>

          {/* --- Date --- */}
          <View style={{ justifyContent: 'center' }}>
            <TextInput style={styles.headerText} editable={false} value={currentMonthText} />
          </View>

          {/* --- Extra Buttons on the Right --- */}

          <View style={styles.headerButtonContainer}>
            <FetchStatusIcon />
            {!!isWeb && <CalendarTypePicker />}
            <View style={{ justifyContent: 'center' }}>
              <Pressable onPress={handleSettingspress}>
                <Ionicons name={'settings-outline'} size={24} color={iconColor} />
              </Pressable>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Pressable style={styles.headerButton} onPress={handleJumpToToday}>
                <Text style={styles.headerButtonText}>{now.toLocaleString('default', { day: 'numeric' })}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <></>
      )}
    </>
  );
}
