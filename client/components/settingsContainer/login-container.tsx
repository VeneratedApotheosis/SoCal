import {
  getSettingBackgroundStyles,
  getSettingCardStyles,
  getSettingProfileStyles,
} from '@/components/settingsContainer/settingsContainerStyles';
import { useAuth } from '@/hooks/useAuth';
import { toTitleCase } from '@/utility/drawerUtil';
import { globalStyles } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useAuthContext } from '../contexts/auth-context';
import { useProfileContext } from '../contexts/profile-context';
import { useUIContext } from '../contexts/ui-context';
import SharedCalendars from './sharedCalendars/shared-calendars';
import SuscribedCalendars from './suscribedCalendars/suscribed-calendars';

export default function Login() {
  const authProps = useAuthContext();
  const { familyProfiles } = useProfileContext();
  const { theme } = useUIContext();
  const cardStyles = getSettingCardStyles(theme.isDark);
  const rootStyles = getSettingBackgroundStyles(theme.isDark);
  const profileStyles = getSettingProfileStyles(theme.isDark);
  const { handleLogout } = useAuth();

  return (
    <View style={rootStyles.tabContainer}>
      {/* --- profile --- */}
      <View style={[cardStyles.container, profileStyles.profileContainer]}>
        {familyProfiles?.parent && familyProfiles?.parent.picture && (
          <Image
            source={{ uri: familyProfiles?.parent.picture }}
            style={profileStyles.profileIconContainer}
            resizeMode="contain"
            onError={(error) => console.log('Image Error:', error.nativeEvent.error)}
          />
        )}
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
          <Text style={profileStyles.usernameText}>
            {familyProfiles && familyProfiles.parent ? toTitleCase(familyProfiles.parent.name) : 'Username'}
          </Text>
          <Text style={profileStyles.emailText}>{familyProfiles && familyProfiles.parent ? familyProfiles.parent.email : 'Email'}</Text>
        </View>
        {/* --- logout button --- */}
        <View style={profileStyles.buttonContainer}>
          {authProps.validJwt && (
            <Pressable
              style={({ pressed }) => [profileStyles.button, pressed && globalStyles.pressedButton]}
              onPress={() => handleLogout()}
            >
              <Ionicons name={'log-out-outline'} style={profileStyles.buttonText} size={20} />
              <Text style={profileStyles.buttonText}>Log Out</Text>
            </Pressable>
          )}
        </View>
      </View>
      <SharedCalendars />
      <SuscribedCalendars />
    </View>
  );
}
