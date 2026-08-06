import { calendarObj, CalendarView } from '@/utility/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

//Global Contexts
import { useAuthContext } from '../contexts/auth-context';
import { useUIContext } from '../contexts/ui-context';

import { toTitleCase } from '@/utility/drawerUtil';
import { globalParameterStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { Plus } from 'lucide-react-native';
import { useCalendarGroupsContext } from '../contexts/calendar-groups-context';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useProfileContext } from '../contexts/profile-context';
import { useScreenSize } from '../contexts/screen-size-context';
import { getColorPaletteStyles } from '../settingsContainer/settingsContainerStyles';
import { getDrawerStyles } from './customDrawer';
import DraggableCalendar from './drawer-draggable-calendar';

export default function CustomDrawerContent(props: any) {
  const { validJwt, calendarType, setCalendarType } = useAuthContext();
  const { familyProfiles } = useProfileContext();
  const userId = familyProfiles && familyProfiles.parent ? familyProfiles.parent.id : null;
  const { fixedSidebar, isWeb } = useScreenSize();
  const { toggleCalendar, calViewMode: viewMode, resetViewMode, suppressOther } = useCalendarObjects();
  const { calendarGroups } = useCalendarGroupsContext();

  const { setLoginVisible, theme: uiTheme } = useUIContext();
  const hoverIndex = useSharedValue<number | null>(null);
  const activeIndex = useSharedValue<number | null>(null);
  const isHovering = useSharedValue<boolean>(false);
  const drawerScrollViewRef = useRef<ScrollView>(null);

  const themeStyles = getColorPaletteStyles(uiTheme.isDark);
  const styles = getDrawerStyles(uiTheme.isDark);
  const globalStyles = globalParameterStyles(uiTheme.isDark);

  //Both Folders and Calendars are mapped to Draggable Flatlist in flatData
  const flatData = useMemo(() => {
    if (calendarGroups.groupedCalendars.length === 0)
      return [] as {
        id: string;
        folder: boolean;
        calendar: calendarObj | null;
      }[];

    const filtered = calendarGroups.groupedCalendars.map((group) => {
      const filteredCals = group.calendars.filter((c) => !c.shown.suppressed);
      return {
        id: group.id,
        calendars: filteredCals,
        userId: group.userId,
      };
    });

    return filtered.flatMap((group) => [
      { id: group.id, folder: true, calendar: null as calendarObj | null },
      ...group.calendars.map((cal) => {
        return { id: group.id, folder: false, calendar: cal as calendarObj | null };
      }),
    ]);
  }, [calendarGroups.groupedCalendars, suppressOther]);

  const getButtonStyle = (option: CalendarView, pressed: boolean) => [
    styles.viewButton,
    calendarType === option && globalStyles.activeButton,
    calendarType === option && { backgroundColor: uiTheme.isDark ? COLORS.background.dark : COLORS.background.light },
    pressed && globalStyles.pressedButton,
  ];

  //open up settings/login page
  const handleSettingspress = () => {
    setLoginVisible(true);
    if (!fixedSidebar) props.navigation.closeDrawer();
  };

  // ─── Math to Calculate where to put Calendar Object ───────────────────────────────────────────────────────────

  const handleDrop = (thisIndex: number, newIndex: number): void => {
    const movingItem = flatData[thisIndex];
    if (!movingItem || movingItem.folder || !movingItem.calendar) return;

    // Identify Source and Destination Folders
    let safeNewIndex = Math.max(0, Math.min(newIndex, flatData.length - 1));

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
    if (sourceGroupIdx < destGroupIdx) {
      safeNewIndex++;
    }
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
    } else if (userId) {
      calendarGroups.updateMultipleGroups([
        { id: sourceGroup.id, userId: userId, calendars: updatedSourceCals },
        { id: destGroup.id, userId: userId, calendars: updatedDestCals },
      ]);
    }
  };

  // ─── Smth is being expanded but i have no clue what ───────────────────────────────────────────────────────────

  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(35);
  const animatedHeight = useSharedValue(0);

  const toggleExpand = (contentHeight: number) => {
    // Toggle the boolean state
    const nextState = !isExpanded;
    setIsExpanded(nextState);

    animatedHeight.value = withSpring(nextState ? contentHeight : 0, {
      stiffness: 100, // Default was ~100. Lower = slower.
      damping: 15, // Default was ~15. Higher = less bouncy/slower.
    });
  };

  useEffect(() => {
    toggleExpand(contentHeight);
  }, [viewMode]);

  if (!validJwt) return null;

  return (
    <SafeAreaView style={[styles.headerContainer, { padding: fixedSidebar ? 0 : 20 }]}>
      {/* --- USER INFO --- */}
      {!fixedSidebar && (
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
      )}
      <ScrollView ref={drawerScrollViewRef}>
        {/* --- CALENDAR TYPE TOGGLE --- */}
        {!isWeb && (
          <View style={styles.viewToggleContainer}>
            <Text style={styles.headerText}>View Mode</Text>
            {[1, 2, 3, 7].map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setCalendarType({ type: 'D', num: option });
                  if (!fixedSidebar) props.navigation.closeDrawer();
                }}
                style={({ pressed }) => getButtonStyle({ type: 'D', num: option }, pressed)}
              >
                <Text style={[globalStyles.smallButtonText, calendarType.num === option && globalStyles.activeSmallButtonText]}>
                  {`${option} days`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        {/* --- CALENDAR VISIBILITY TOGGLE --- */}
        <View style={{ marginBottom: 10 }}>
          <Text style={[styles.headerText]}>Calendars</Text>
          {viewMode !== 'default' && (
            <Pressable
              style={({ pressed }) => [themeStyles.viewModeButton, pressed && themeStyles.actionButtonPressed, { flex: 1 }]}
              onPress={() => resetViewMode()}
            >
              <Text style={themeStyles.viewModeText}>remove {viewMode}</Text>
            </Pressable>
          )}
          <View style={{ gap: 6 }}>
            {flatData.map((data, index) => (
              <DraggableCalendar
                key={data.folder ? `folder-${data.id}` : `cal-${data.calendar?.calendarId}`}
                cal={data}
                onDrop={handleDrop}
                toggleCalendar={toggleCalendar}
                thisIndex={index}
                hoverIndex={hoverIndex}
                activeIndex={activeIndex}
                isHovering={isHovering}
                drawerScrollViewRef={drawerScrollViewRef}
              />
            ))}
          </View>
        </View>
        <View style={{}}>
          <Pressable
            style={({ pressed }) => [
              themeStyles.actionButton,
              { paddingVertical: 8, backgroundColor: uiTheme.isDark ? COLORS.background.dark : COLORS.background.light },
              pressed && themeStyles.actionButtonPressed,
            ]}
            onPress={() => {
              if (isHovering.get() === false) {
                calendarGroups.addGroup(null);
              }
            }}
          >
            <Plus size={16} color={uiTheme.isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark} style={themeStyles.plusIcon} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
