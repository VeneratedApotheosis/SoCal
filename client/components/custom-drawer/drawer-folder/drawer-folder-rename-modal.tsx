import { useCalendarGroupsContext } from '@/components/contexts/calendar-groups-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { getFolderRenameModal } from '../customDrawer';

export interface FolderSettingsRenameModalInterface {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setParentVisible: React.Dispatch<React.SetStateAction<boolean>>;
  calId: string;
  top: number;
  left: number;
}

export default function FolderSettingsRenameModal({
  isVisible,
  setVisible,
  setParentVisible,
  calId,
  top,
  left,
}: FolderSettingsRenameModalInterface) {
  const [newName, setNewName] = useState(calId || '');
  const inputRef = useRef<TextInput>(null);
  const { calendarGroups } = useCalendarGroupsContext();
  const { theme } = useUIContext();
  const styles = getFolderRenameModal(theme.isDark);

  useEffect(() => {
    if (isVisible) {
      setNewName(calId || '');
      // Small timeout ensures the modal is fully rendered before focusing the keyboard
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible, calId]);

  const handleSave = () => {
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== calId) {
      calendarGroups.renameGroup(calId, trimmedName);
    }
    setVisible(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setVisible(false);
        Keyboard.dismiss();
      }} // Handles Android hardware back button><Modal/>);
    >
      {/* --- BACKDROP BUTTON --- */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          setVisible(false);
          setTimeout(() => {
            setParentVisible(false);
          }, 50);
        }}
      />
      {/* --- CENTERED SETTINGS BOX --- */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <View style={[styles.menuBox]}>
          <Text style={styles.title}>Rename Calendar</Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="New calendar name"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            selectTextOnFocus // Highlights the old name immediately so they can just start typing
          />

          <View style={styles.buttonRow}>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedButton]} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedButton]} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
