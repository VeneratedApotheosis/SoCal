import { useUIContext } from '@/components/contexts/ui-context';
import { useAuth } from '@/hooks/useAuth';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { ActivityIndicator, Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface DeleteAccountModalInterface {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DeleteAccountModal({ isVisible, setVisible }: DeleteAccountModalInterface) {
  const { theme } = useUIContext();
  const styles = getSortModalStyles(theme.isDark);
  const { handleDeleteAccount, isDeleting, error } = useAuth();

  const handleSave = async () => {
    await handleDeleteAccount();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!isDeleting) {
          setVisible(false);
          Keyboard.dismiss();
        }
      }} // Handles Android hardware back button><Modal/>);
    >
      {/* --- BACKDROP BUTTON --- */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          setVisible(false);
        }}
      />
      {/* --- CENTERED SETTINGS BOX --- */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <View style={[styles.menuBox]}>
          <Text style={styles.title}>Are you Sure?</Text>
          <Text style={styles.bodyText}>
            Deleting your account is permanent. It will remove your user profile from our database and delete all local data. Your personal
            Google Calendar account will not be affected.
          </Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && !isDeleting && styles.pressedButton]}
              onPress={() => setVisible(false)}
              disabled={isDeleting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sortButton, pressed && !isDeleting && styles.pressedButton]}
              onPress={handleSave}
              disabled={isDeleting}
            >
              {isDeleting ? <ActivityIndicator color="white" /> : <Text style={styles.deleteText}>Delete</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const getSortModalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuBox: {
      ...baseTheme.background,
      borderRadius: 8,
      padding: 16,
      width: '80%', // Takes up a nice chunk of the screen width
      maxWidth: 300,
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
      elevation: 10,
    },
    pressedButton: {
      transform: [{ scale: 0.9 }],
    },
    centeredContainer: {
      ...StyleSheet.absoluteFillObject,
      ...baseFlexStyles.centerAll,
    },
    title: {
      ...baseText.subtitle,
      marginBottom: 12,
    },
    bodyText: {
      ...baseText.body,
      marginBottom: 8,
      lineHeight: 20,
    },
    errorText: {
      ...baseText.body,
      color: '#ef4444',
      marginBottom: 8,
      fontSize: 14,
    },
    buttonRow: {
      paddingTop: 16,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    sortButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      ...baseTheme.backgroundBlue,
    },
    cancelText: {
      ...baseText.subtleColor,
      fontWeight: '500',
    },
    sortText: {
      ...baseText.subtitle,
      fontWeight: '600',
      color: 'white',
    },
    deleteText: {
      ...baseText.subtitle,
      fontWeight: '600',
      color: 'white',
    },
  });
};
