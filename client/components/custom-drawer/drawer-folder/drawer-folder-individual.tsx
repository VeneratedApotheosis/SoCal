import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { getPositions, toTitleCase } from '@/utility/drawerUtil';
import { getIconColor } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getFolderIndividual } from '../customDrawer';
import FolderSettingsModal from './drawer-folder-settings-modal';

const menuHeight = 150;
const menuWidth = 150;

export default function FolderIndividual({ calId }: { calId: string }) {
  const [isVisible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<View>(null);
  const { theme } = useUIContext();
  const styles = getFolderIndividual(theme.isDark);
  const iconColor = getIconColor(theme.isDark);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();

  return (
    <View style={styles.folderContainer}>
      <View style={styles.folderFront}>
        <Ionicons name={'folder-outline'} size={16} color={iconColor} />
        <Text style={styles.sectionHeaderText}>{toTitleCase(calId)}</Text>
      </View>
      <View style={styles.folderFront}>
        <Pressable
          ref={buttonRef}
          onPress={() => {
            getPositions(buttonRef, setMenuPos, menuHeight, menuWidth, SCREEN_WIDTH, SCREEN_HEIGHT);
            setVisible(true);
          }}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
        >
          <Ionicons name={'ellipsis-horizontal-outline'} size={16} color={iconColor} />
        </Pressable>
        {/* <Ionicons name={'chevron-up-outline'} size={16} />
        <Ionicons name={'chevron-down-outline'} size={16} /> */}
        <FolderSettingsModal isVisible={isVisible} setVisible={setVisible} calId={calId} top={menuPos.top} left={menuPos.left} />
      </View>
    </View>
  );
}
