import Ionicons from '@expo/vector-icons/Ionicons';
import { Drawer } from 'expo-router/drawer';

import CustomDrawerContent from '../components/custom-drawer/drawer-container';

//Proivders
import { EventsProvider } from '@/components/contexts/calendar-events-context';
import { GroupsProvider } from '@/components/contexts/calendar-groups-context';
import { DateProvider } from '@/components/contexts/calendar-index-context';
import { CalendarObjectsProvider } from '@/components/contexts/calendar-obj-context';
import { RangeProvider } from '@/components/contexts/calendar-range-context';
import { HourHeightProvider } from '@/components/contexts/hour-height-context';
import { ProfileProvider } from '@/components/contexts/profile-context';
import { ScreenSizeProvider } from '@/components/contexts/screen-size-context';
import { TimeZoneProvider } from '@/components/contexts/time-zone-context';
import { UIProvider } from '@/components/contexts/ui-context';
import { PORTAL_HOME_NAME } from '@/utility/constants';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../components/contexts/auth-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenSizeProvider>
        <AuthProvider>
          <ProfileProvider>
            <DateProvider>
              <CalendarObjectsProvider>
                <TimeZoneProvider>
                  <EventsProvider>
                    <GroupsProvider>
                      <RangeProvider>
                        <UIProvider>
                          <HourHeightProvider>
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
                                    headerShown: false,
                                    headerTransparent: false,
                                    headerTitle: 'Calender',
                                    drawerLabel: 'Calendar',
                                    drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
                                  }}
                                />
                              </Drawer>
                              <PortalHost name={PORTAL_HOME_NAME} />
                            </BottomSheetModalProvider>
                          </HourHeightProvider>
                        </UIProvider>
                      </RangeProvider>
                    </GroupsProvider>
                  </EventsProvider>
                </TimeZoneProvider>
              </CalendarObjectsProvider>
            </DateProvider>
          </ProfileProvider>
        </AuthProvider>
      </ScreenSizeProvider>
    </GestureHandlerRootView>
  );
}
