import { calendarObj } from '@/utility/types';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

//Global Contexts
import { useAuthContext } from '../contexts/auth-context';
import { useUIContext } from '../contexts/ui-context';

import { toTitleCase } from '@/utility/drawerUtil';
import { getColorPaletteStyles, globalStyles } from '@/utility/globalStyles';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import { Plus } from 'lucide-react-native';
import { useCalendarGroups } from '../contexts/calendar-groups-context';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import DraggableCalendar from './drawer-draggable-calendar';

export default function CustomDrawerContent(props: any) {
  const { jwtToken, calendarType, setCalendarType, familyProfiles } = useAuthContext();
  const { setCalendarObj } = useCalendarObjects();
  const { calendarGroups } = useCalendarGroups();
  const { setLoginVisible, theme: uiTheme } = useUIContext();
  const themeStyles = getColorPaletteStyles(uiTheme.isDark);
  const hoverIndex = useSharedValue<number | null>(null);
  const activeIndex = useSharedValue<number | null>(null);

  //Both Folders and Calendars are mapped to Draggable Flatlist in flatData
  const flatData = useMemo(() => {
    return calendarGroups.groupedCalendars.flatMap((group) => [
      { id: group.id, folder: true, calendar: null as calendarObj | null },
      ...group.calendars.map((cal) => {
        return { id: group.id, folder: false, calendar: cal as calendarObj | null };
      }),
    ]);
  }, [calendarGroups.groupedCalendars]);

  const getButtonStyle = (option: '1' | '2' | '3' | 'W' | 'M', pressed: boolean) => [
    styles.viewButton,
    calendarType === option && globalStyles.activeButton,
    pressed && globalStyles.pressedButton,
  ];

  //toggle visibility of specific calendar
  const toggleCalendar = useCallback(
    (id: string) => {
      setCalendarObj((prev) => {
        const next = prev.map((cal) => (cal.calendarId === id ? { ...cal, shown: !cal.shown } : cal));
        return next;
      });
    },
    [setCalendarObj],
  );

  //open up settings/login page
  const handleSettingspress = () => {
    setLoginVisible(true);
    props.navigation.closeDrawer();
  };

  const handleDrop = (thisIndex: number, newIndex: number): void => {
    const movingItem = flatData[thisIndex];
    if (!movingItem || movingItem.folder || !movingItem.calendar) return;

    // Identify Source and Destination Folders
    let currentGroupIdx = -1;
    const safeNewIndex = Math.max(0, Math.min(newIndex, flatData.length - 1));

    const getGroupIndexAtFlatIndex = (targetIdx: number): number => {
      let groupIdx = -1;
      for (let i = 0; i < targetIdx; i++) {
        if (flatData[i].folder) {
          groupIdx++;
        }
      }
      return groupIdx;
    };

    let sourceGroupIdx = getGroupIndexAtFlatIndex(thisIndex);
    if (thisIndex > newIndex) {
      if (flatData[thisIndex].folder) sourceGroupIdx++;
    }
    let destGroupIdx = getGroupIndexAtFlatIndex(safeNewIndex);
    if (thisIndex < newIndex) {
      if (flatData[safeNewIndex].folder) destGroupIdx++;
    }

    if (sourceGroupIdx === -1 || destGroupIdx === -1) return;

    const sourceGroup = calendarGroups.groupedCalendars[sourceGroupIdx];
    const destGroup = calendarGroups.groupedCalendars[destGroupIdx];
    if (!sourceGroup || !destGroup) return;

    // Remove from Source Group
    const updatedSourceCals = sourceGroup.calendars.filter((c) => c.calendarId !== movingItem.calendar?.calendarId);

    // Insert into Destination Group
    const updatedDestCals =
      sourceGroup.id === destGroup.id
        ? [...updatedSourceCals] // If same group, start with the filtered list
        : [...destGroup.calendars];

    // Calculate relative index within the destination folder
    let targetRelIndex = 0;
    let foundTargetFolder = false;
    for (let i = 0; i < safeNewIndex; i++) {
      const item = flatData[i];
      if (item.folder && item.id === destGroup.id) {
        foundTargetFolder = true;
        targetRelIndex = 0;
        continue;
      }
      if (foundTargetFolder && !item.folder) {
        targetRelIndex += 1;
      }
    }
    updatedDestCals.splice(targetRelIndex, 0, movingItem.calendar);

    // Update the Context
    if (sourceGroup.id === destGroup.id) {
      calendarGroups.updateSingleGroup(destGroup.id, updatedDestCals);
    } else {
      calendarGroups.updateMultipleGroups([
        { id: sourceGroup.id, calendars: updatedSourceCals },
        { id: destGroup.id, calendars: updatedDestCals },
      ]);
    }
  };

  if (!jwtToken) return null;

  return (
    <SafeAreaView style={styles.headerContainer}>
      {/* --- USER INFO --- */}
      <View style={styles.profile}>
        <Pressable onPress={handleSettingspress} style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ width: 42, height: 42, backgroundColor: '#4986e7', borderRadius: 8 }}></View>
          <View>
            <Text style={styles.username}>
              {familyProfiles && familyProfiles.parent ? toTitleCase(familyProfiles.parent.name) : 'Username'}
            </Text>
            <Text style={styles.email}>{familyProfiles && familyProfiles.parent ? familyProfiles.parent.email : 'Email'}</Text>
          </View>
        </Pressable>
      </View>
      <ScrollView>
        {/* --- CALENDAR TYPE TOGGLE --- */}
        <View style={styles.viewToggleContainer}>
          <Text style={styles.headerText}>View Mode</Text>
          {['1', '2', '3'].map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setCalendarType(option as '1' | '2' | '3' | 'W' | 'M');
                props.navigation.closeDrawer();
              }}
              style={({ pressed }) => getButtonStyle(option as '1' | '2' | '3' | 'W' | 'M', pressed)}
            >
              <Text style={[globalStyles.smallButtonText, calendarType === option && globalStyles.activeSmallButtonText]}>
                {option === 'W' ? 'week' : option === 'M' ? 'month' : `${option} day${option !== '1' ? 's' : ''}`}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* --- CALENDAR VISIBILITY TOGGLE --- */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.headerText}>Calendars</Text>
          {flatData.map((data, index) => (
            <DraggableCalendar
              key={data.folder ? `folder-${data.id}` : `cal-${data.calendar?.calendarId}`}
              cal={data}
              onDrop={handleDrop}
              toggleCalendar={toggleCalendar}
              thisIndex={index}
              hoverIndex={hoverIndex}
              activeIndex={activeIndex}
            />
          ))}
        </View>
        <View style={{}}>
          <Pressable
            style={({ pressed }) => [themeStyles.actionButton, { paddingVertical: 8 }, pressed && themeStyles.actionButtonPressed]}
            onPress={() => calendarGroups.addGroup(null)}
          >
            <Plus size={16} color={uiTheme.isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark} style={themeStyles.plusIcon} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  headerText: {
    fontSize: 14,
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.heavy,
  },
  profile: {
    height: 42,
    marginBottom: 20,
  },
  username: {
    fontSize: SIZES.l,
    marginBottom: 4,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text.main,
  },
  email: {
    fontSize: SIZES.s,
    color: COLORS.textLight,
  },
  viewToggleContainer: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  viewButton: {
    padding: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
});
