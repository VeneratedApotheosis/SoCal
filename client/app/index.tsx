//Libraries
import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

//Components
import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';
import SettingsModal from '@/components/settingsContainer/settings-modal';
import WelcomeScreen from '@/components/welcome-screen';

//Global Contexts
import CalendarHeader from '@/components/calendarHeader/calendar-header';
import { EventsContext } from '@/components/contexts/calendar-events-context';
import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useUIContext } from '@/components/contexts/ui-context';
import FixedDrawer from '@/components/custom-drawer/drawer-web';
import { useWebScrollbarStyle } from '@/components/scrollIndicator';
import WebSettingsPortal from '@/components/settingsContainer/web-settings-portal';
import { WEB_MUTED_PADDING, WEB_WHITE_X_PADDING, WEB_WHITE_Y_PADDING } from '@/utility/constants';
import { getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { AuthContext } from '../components/contexts/auth-context';

export default function Index() {
  const { calendarType, validJwt } = useContext(AuthContext);
  const { allEvents } = useContext(EventsContext);
  const { isLoginVisible, setLoginVisible, theme } = useUIContext();
  const styles = indexStyles(theme.isDark);
  const { isWeb, fixedSidebar } = useScreenSize();
  useWebScrollbarStyle();

  return validJwt ? (
    <>
      <CalendarHeader />
      {isWeb ? (
        <View style={[styles.web]}>
          {!!fixedSidebar && <FixedDrawer />}
          <View style={styles.roundedEdges}>
            {calendarType.type === 'D' && <MultiDayContainer calendarType={calendarType} events={allEvents} />}
            {calendarType.type === 'W' && <MonthContainer calendarType={calendarType} events={allEvents} />}
            <WebSettingsPortal isVisible={isLoginVisible} onClose={() => setLoginVisible(false)} />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {calendarType.type === 'D' && <MultiDayContainer calendarType={calendarType} events={allEvents} />}
          {calendarType.type === 'W' && <MonthContainer calendarType={calendarType} events={allEvents} />}
          <SettingsModal isVisible={isLoginVisible} onClose={() => setLoginVisible(false)} />
        </View>
      )}
    </>
  ) : (
    <WelcomeScreen />
  );
}

export const indexStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    web: {
      flex: 1,
      padding: WEB_MUTED_PADDING,
      paddingTop: 0,
      ...baseTheme.backgroundMuted,
      flexDirection: 'row',
    },
    roundedEdges: {
      paddingHorizontal: WEB_WHITE_X_PADDING,
      paddingVertical: WEB_WHITE_Y_PADDING,
      ...baseTheme.background,
      flex: 1,
      borderRadius: 16,
    },
  });
};
