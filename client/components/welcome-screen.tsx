import { useAuth } from '@/hooks/useAuth'; // Adjust this path to wherever useAuth lives
import { globalStyles } from '@/utility/globalStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const { promptAsync, isLoading, jwtToken } = useAuth();
  return (
    <View style={styles.homepg}>
      {/* --- calendar icon --- */}
      <View style={styles.logoContainer}>
        <Animated.View entering={FadeInUp.duration(600).delay(600)} style={styles.iconCircle}>
          <MaterialCommunityIcons name="calendar-month" size={60} color="#4285F4" />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(600).delay(400)}>
          <Text style={styles.appName}>Calendar App</Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(600).delay(400)}>
          <Text style={styles.appDescription}>insert description</Text>
        </Animated.View>
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
          ) : jwtToken ? (
            <Text style={styles.buttonText}>Welcome Back</Text>
          ) : (
            <Text style={styles.buttonText}>Sign in with Google</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homepg: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#ebf4ff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
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
    backgroundColor: '#4285F4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
