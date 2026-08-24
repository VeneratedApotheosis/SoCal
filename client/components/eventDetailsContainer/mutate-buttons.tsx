import { getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { EventObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useUIContext } from '../contexts/ui-context';
import { eventViewStyles } from './eventDetailsStyles';

export interface MutateButtonProps {
  editableEvent: boolean;
  creatingEvent: boolean;
  hasChanges: boolean;
  timeError: boolean;
  event: EventObj;
  closeModal: () => void;
  handleEditModal: () => void;
  handleDeleteModal: () => void;
}

export const MutateButtons = ({
  editableEvent,
  creatingEvent,
  hasChanges,
  timeError,
  event,
  closeModal,
  handleEditModal,
  handleDeleteModal,
}: MutateButtonProps) => {
  const { theme } = useUIContext();
  const styles = eventViewStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);

  const { mutateEvent } = useCalendarEvents();

  const blueText =
    hasChanges && event.title !== '' && !timeError
      ? theme.isDark
        ? COLORS.text.light
        : COLORS.text.light
      : theme.isDark
        ? COLORS.primaryy.mutedTextLight
        : COLORS.primaryy.mutedTextDark;

  const blueBackgorund =
    hasChanges && event.title !== '' && !timeError
      ? theme.isDark
        ? COLORS.primaryy.light
        : COLORS.primaryy.dark
      : theme.isDark
        ? COLORS.primaryy.mutedBackgroundDark
        : COLORS.primaryy.mutedBackgroundLight;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
      {editableEvent && creatingEvent && (
        <>
          <Pressable
            style={[styles.mutateButtons, { flex: 1, backgroundColor: blueBackgorund }]}
            onPress={() => {
              if (editableEvent && creatingEvent && event.title !== '' && !timeError) {
                closeModal();
                mutateEvent.createEvent(event);
              }
            }}
          >
            <Ionicons name={'add-outline'} size={16} color={blueText} />
            <Text style={[styles.mutateButtonsText, { color: blueText }]}>Create Event</Text>
          </Pressable>
          <Pressable
            style={styles.mutateButtons}
            onPress={() => {
              closeModal();
            }}
          >
            <Text style={styles.mutateButtonsText}>Cancel</Text>
          </Pressable>
        </>
      )}

      {editableEvent && !creatingEvent && (
        <>
          <Pressable
            style={[styles.mutateButtons, { backgroundColor: blueBackgorund }]}
            onPress={() => {
              if (hasChanges && !timeError) handleEditModal();
            }}
          >
            <Text style={[styles.mutateButtonsText, { color: blueText }]}>Save Changes</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={styles.mutateButtons}
              onPress={() => {
                closeModal();
              }}
            >
              <Text style={styles.mutateButtonsText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.mutateButtons}
              onPress={() => {
                closeModal();
                mutateEvent.createEvent(event);
              }}
            >
              <Ionicons name={'copy-outline'} size={16} color={iconColor} />
            </Pressable>
            <Pressable style={styles.mutateButtons} onPress={handleDeleteModal}>
              <Ionicons name={'trash-outline'} size={16} color={iconColor} />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};
