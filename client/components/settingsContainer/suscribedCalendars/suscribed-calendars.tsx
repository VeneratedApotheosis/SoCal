import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useUIContext } from '@/components/contexts/ui-context';
import DropDownCard from '@/components/dropdown-card';
import { calendarObj } from '@/utility/types';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getSharedCalStyles, getSubscribedCalStyles } from '../settingsContainerStyles';
import SuscribedCalendarIndividual from './suscribed-calendar-individual';

export default function SuscribedCalendars() {
  const { calendarObjs } = useCalendarObjects();
  const { theme: uiTheme } = useUIContext();
  const styles = getSubscribedCalStyles(uiTheme.isDark);
  const accordionStyles = getSharedCalStyles(uiTheme.isDark);

  // Only calendars with shared users
  const subscribedCalendars: { dataOwner: string; calendars: calendarObj[] }[] = useMemo(() => {
    if (!calendarObjs) return [];

    // 1. Filter out owned calendars and group by `dataOwner` (defaulting to 'other')
    const grouped = calendarObjs
      .filter((cal) => cal.owner === false)
      .reduce<Record<string, calendarObj[]>>((acc, cal) => {
        const owner = cal.dataOwner || 'other';
        if (!acc[owner]) {
          acc[owner] = [];
        }
        acc[owner].push(cal);
        return acc;
      }, {});

    // 2. Transform into array and sort alphabetically with 'other' at the end
    return Object.entries(grouped)
      .map(([dataOwner, calendars]) => ({
        dataOwner,
        calendars,
      }))
      .sort((a, b) => {
        const isAOther = a.dataOwner.toLowerCase() === 'other';
        const isBOther = b.dataOwner.toLowerCase() === 'other';

        // Always push 'other' to the end
        if (isAOther && !isBOther) return 1;
        if (!isAOther && isBOther) return -1;

        // Otherwise, sort alphabetically
        return a.dataOwner.localeCompare(b.dataOwner);
      });
  }, [calendarObjs]);

  const [expandedId, setExpandedId] = useState<string[]>([]);

  // Helper to toggle accordion
  const handleToggle = (id: string) => {
    setExpandedId((prev) => {
      const containsId = prev.find((p) => p === id);
      if (containsId) return prev.filter((p) => p !== id);
      else return [...prev, id];
    });
  };

  return (
    <DropDownCard title={'Subscribed Calendars'} iconName="today-outline">
      <View style={[styles.listContainer]}>
        {/* View Mode: Calendars */}
        {subscribedCalendars.length === 0 ? (
          <Text style={styles.emptyText}>No shared calendars found.</Text>
        ) : (
          subscribedCalendars.map((group) => {
            const isExpanded = expandedId.find((p) => p === group.dataOwner);
            return (
              <View
                key={group.dataOwner}
                style={isExpanded ? accordionStyles.selectedAccordionContainer : accordionStyles.accordionContainer}
              >
                <Pressable
                  style={({ pressed }) => [accordionStyles.accordionHeader, pressed && accordionStyles.pressedButton]}
                  onPress={() => handleToggle(group.dataOwner)}
                >
                  <Text style={accordionStyles.accordionTitle}>{group.dataOwner}</Text>
                  <View style={accordionStyles.badge}>
                    <Text style={accordionStyles.badgeText}>{group.calendars.length}</Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={accordionStyles.accordionContent}>
                    {group.calendars.map((cal, idx) => (
                      <SuscribedCalendarIndividual cal={cal} key={cal.calendarId} />
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </DropDownCard>
  );
}
