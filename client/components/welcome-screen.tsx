import { useAuth } from '@/hooks/useAuth'; // Adjust this path to wherever useAuth lives
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles, globalStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthContext } from './contexts/auth-context';
import { useUIContext } from './contexts/ui-context';

export default function WelcomeScreen() {
  const { promptAsync, isLoading } = useAuth();
  const { validJwt } = useAuthContext();
  const { theme } = useUIContext();
  const styles = welcomeScreenStyles(theme.isDark);
  console.log(isLoading);

  return (
    <View style={styles.homepg}>
      {/* --- calendar icon --- */}
      <View style={styles.logoContainer}>
        <Animated.View entering={FadeInUp.duration(600).delay(600)} style={styles.iconCircle}>
          <MaterialCommunityIcons name="calendar-month" size={60} color={theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark} />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(600).delay(400)}>
          <Text style={styles.appName}>SoCal</Text>
        </Animated.View>
        {/* <Animated.View entering={FadeInUp.duration(600).delay(400)}>
          <Text style={styles.appDescription}>insert description</Text>
        </Animated.View> */}
      </View>

      {/* --- login button --- */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && globalStyles.pressedButton]}
          onPress={() => promptAsync()}
          disabled={isLoading} // It's good practice to disable the button while loading
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Loading...</Text>
          ) : validJwt ? (
            <Text style={styles.buttonText}>Welcome Back</Text>
          ) : (
            <Text style={styles.buttonText}>Sign in with Google</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const welcomeScreenStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    homepg: {
      flex: 1,
      ...baseTheme.background,
      padding: 24,
      ...baseFlexStyles.centerAll,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    iconCircle: {
      width: 100,
      height: 100,
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      borderRadius: 30,
      ...baseFlexStyles.centerAll,
      marginBottom: 20,
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
    appName: {
      fontSize: 32,
      fontWeight: '800',
      ...baseText.defaultColor,
      letterSpacing: -0.5,
    },
    appDescription: {
      fontSize: 16,
      color: '#666',
      marginTop: 8,
    },
    buttonContainer: {
      width: '100%',
      maxWidth: 280,
    },
    button: {
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
      ...baseFlexStyles.centerAll,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
    },
  });
};
