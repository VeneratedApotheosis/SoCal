import { useUIContext } from '@/components/contexts/ui-context';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles, getIconColor, globalParameterStyles } from '@/utility/globalStyles';
import { FONT_WEIGHTS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface InformationIconProps {
  size: number;
  title: string;
  description: string;
  children?: ReactNode;
}

export default function InformationIcon({ size, title, description, children }: InformationIconProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { theme } = useUIContext();
  const styles = informationIconStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);
  const parameterizedStyles = globalParameterStyles(theme.isDark);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setIsModalVisible(true)} style={styles.iconPressable}>
        <Ionicons name="information-circle-outline" size={size} color={iconColor} />
      </Pressable>

      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={() => setIsModalVisible(false)} />

        {/* Modal Content */}
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{title}</Text>
            {!children ? <Text style={styles.modalDescription}>{description}</Text> : <View style={{ flex: 1 }}>{children}</View>}
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && parameterizedStyles.pressedButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const informationIconStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: { ...baseFlexStyles.centerAll },
    iconPressable: { ...baseFlexStyles.centerAll },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      ...baseFlexStyles.centerAll,
    },
    centeredView: {
      flex: 1,
      ...baseFlexStyles.centerAll,
    },
    modalView: {
      ...baseTheme.background,
      margin: 20,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      elevation: 5,
      maxWidth: 300,
    },
    modalTitle: {
      ...baseText.title,
      marginBottom: 12,
      textAlign: 'center',
    },
    modalDescription: {
      ...baseText.body,
      textAlign: 'center',
    },
    cancelButton: {
      marginTop: 12,
      width: '100%',
      maxWidth: 200,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 20,
      ...baseFlexStyles.centerAll,
    },
    cancelButtonText: {
      ...baseText.subtitle,
      fontWeight: FONT_WEIGHTS.heavy,
    },
  });
};
