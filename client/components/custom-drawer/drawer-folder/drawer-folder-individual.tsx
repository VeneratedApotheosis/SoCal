import { DRAWER_DRAGGABLE_HEIGHT } from '@/utility/constants';
import { getPositions, toTitleCase } from '@/utility/drawerUtil';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FolderSettingsModal from './drawer-folder-settings-modal';

const menuHeight = 82;
const menuWidth = 150;

export default function FolderIndividual({ calId }: { calId: string }) {
  const [isVisible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<View>(null);

  return (
    <View style={styles.folderContainer}>
      <View style={styles.folderFront}>
        <Ionicons name={'folder-outline'} size={16} />
        <Text style={styles.sectionHeaderText}>{toTitleCase(calId)}</Text>
      </View>
      <View style={styles.folderFront}>
        <Pressable
          ref={buttonRef}
          onPress={() => {
            getPositions(buttonRef, setMenuPos, menuHeight, menuWidth);
            setVisible(true);
          }}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
        >
          <Ionicons name={'ellipsis-horizontal-outline'} size={16} />
        </Pressable>
        {/* <Ionicons name={'chevron-up-outline'} size={16} />
        <Ionicons name={'chevron-down-outline'} size={16} /> */}
        <FolderSettingsModal isVisible={isVisible} setVisible={setVisible} calId={calId} top={menuPos.top} left={menuPos.left} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  folderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 16,
    height: DRAWER_DRAGGABLE_HEIGHT,
  },
  folderFront: {
    flexDirection: 'row',
    marginTop: 'auto',
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
});
