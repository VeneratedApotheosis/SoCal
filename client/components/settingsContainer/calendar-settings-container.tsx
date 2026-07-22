import { getSettingBackgroundStyles } from '@/components/settingsContainer/settingsContainerStyles';
import { View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import CalendarSettingsToggles from './calendarSettings/multi-day-event-toggle';
import TimeZoneSelector from './calendarSettings/set-time-zone';

export default function CalendarSettingsContainer() {
  const { theme } = useUIContext();
  const rootStyles = getSettingBackgroundStyles(theme.isDark);

  return (
    <View style={rootStyles.tabContainer}>
      <TimeZoneSelector />
      <CalendarSettingsToggles />
    </View>
  );
}
