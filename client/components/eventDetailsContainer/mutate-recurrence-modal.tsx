import { useUIContext } from '@/components/contexts/ui-context';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { getDeleteModalStyles } from './eventDetailsStyles';

export interface CalendarSettingsModal {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (option: 'all' | 'this' | 'following') => void;
  handleEdit: (option: 'all' | 'this' | 'following') => void;
  options: { value: string; label: string }[];
  type: 'delete' | 'edit';
}

export default function MutateRecurrenceModal({ isVisible, setVisible, handleDelete, handleEdit, options, type }: CalendarSettingsModal) {
  const { theme } = useUIContext();
  const styles = getDeleteModalStyles(theme.isDark);
  const [mutateScope, setMutateScope] = useState<string>('this');

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setVisible(false);
      }}
    >
      {/* --- BACKDROP BUTTON --- */}
      <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Title */}
          <Text style={styles.modalTitle}>{type === 'delete' ? 'Delete recurring event' : 'Edit recurring event'}</Text>

          {/* Radio Options */}
          <View style={styles.radioGroup}>
            {options.map(({ value, label }) => (
              <Pressable
                key={value}
                onPress={() => setMutateScope(value)}
                style={({ pressed }) => [styles.radioRow, { opacity: pressed ? 0.7 : 1 }]}
              >
                {/* Radio Ring */}
                <View style={[styles.radioOuter, mutateScope === value && styles.radioOuterActive]}>
                  {mutateScope === value && <View style={styles.radioInner} />}
                </View>

                {/* Label */}
                <Text style={styles.radioText}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.footerRow}>
            <Pressable onPress={() => setVisible(false)} style={({ pressed }) => [styles.btnCancel, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setVisible(false);
                if (mutateScope === 'all' || mutateScope === 'this' || mutateScope === 'following') {
                  if (type === 'delete') handleDelete(mutateScope);
                  else if (type === 'edit') handleEdit(mutateScope);
                }
              }}
              style={({ pressed }) => [styles.btnDone, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.btnDoneText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
