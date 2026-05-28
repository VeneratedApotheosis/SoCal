import { useCalendarGroups } from '@/components/contexts/calendar-groups-context';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
  const { calendarGroups } = useCalendarGroups();

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

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '80%', // Takes up a nice chunk of the screen width
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  colorButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  pressedButton: {
    transform: [{ scale: 0.9 }],
  },
  centeredContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  cancelText: {
    color: '#666',
    fontWeight: '500',
  },
  saveText: {
    color: '#4285F4', // Google Blue to match your calendar defaults
    fontWeight: '600',
  },
});
