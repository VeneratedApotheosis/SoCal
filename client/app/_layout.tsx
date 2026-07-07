import Ionicons from '@expo/vector-icons/Ionicons';
import { Drawer } from 'expo-router/drawer';

import CalendarHeader from '../components/calendarHeader/calendar-header';
import CustomDrawerContent from '../components/custom-drawer/drawer-container';

//Proivders
import { EventsProvider } from '@/components/contexts/calendar-events-context';
import { GroupsProvider } from '@/components/contexts/calendar-groups-context';
import { DateProvider } from '@/components/contexts/calendar-index-context';
import { CalendarObjectsProvider } from '@/components/contexts/calendar-obj-context';
import { RangeProvider } from '@/components/contexts/calendar-range-context';
import { ScreenSizeProvider } from '@/components/contexts/screen-size-context';
import { TimeZoneProvider } from '@/components/contexts/time-zone-context';
import { UIProvider } from '@/components/contexts/ui-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../components/contexts/auth-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenSizeProvider>
        <AuthProvider>
          <DateProvider>
            <CalendarObjectsProvider>
              <TimeZoneProvider>
                <EventsProvider>
                  <GroupsProvider>
                    <RangeProvider>
                      <UIProvider>
                        <BottomSheetModalProvider>
                          <Drawer
                            drawerContent={(props) => <CustomDrawerContent {...props} />}
                            screenOptions={{
                              drawerStyle: {},
                              swipeEnabled: false,
                            }}
                          >
                            <Drawer.Screen
                              name="index"
                              options={{
                                header: ({ options }) => <CalendarHeader />,
                                headerTransparent: false,
                                headerTitle: 'Calender',
                                drawerLabel: 'Calendar',
                                drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
                              }}
                            />
                          </Drawer>
                        </BottomSheetModalProvider>
                      </UIProvider>
                    </RangeProvider>
                  </GroupsProvider>
                </EventsProvider>
              </TimeZoneProvider>
            </CalendarObjectsProvider>
          </DateProvider>
        </AuthProvider>
      </ScreenSizeProvider>
    </GestureHandlerRootView>
  );
}
