//Libraries
import { useContext } from 'react';
import { LogBox, View } from 'react-native';

//Components
import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';
import SettingsModal from '@/components/settingsContainer/settings-modal';
import WelcomeScreen from '@/components/welcome-screen';

//Global Contexts
import { EventsContext } from '@/components/contexts/calendar-events-context';
import { UIContext } from '@/components/contexts/ui-context';
import { AuthContext } from '../components/contexts/auth-context';

LogBox.ignoreLogs(['[Reanimated] ...']);

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const { calendarType, jwtToken } = useContext(AuthContext);
  const { allEvents } = useContext(EventsContext);
  const { isLoginVisible, setLoginVisible } = useContext(UIContext);

  // --- DISPLAY ---
  return jwtToken ? (
    <View style={{ flex: 1 }}>
      {calendarType.type === 'D' && <MultiDayContainer calendarType={calendarType} events={allEvents} />}

      {calendarType.type === 'W' && <MonthContainer numWeeks={6} />}

      <SettingsModal isVisible={isLoginVisible} onClose={() => setLoginVisible(false)} />
    </View>
  ) : (
    <WelcomeScreen />
  );
}
