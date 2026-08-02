import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useProfileContext } from '@/components/contexts/profile-context';
import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { useShareCalendar } from '@/hooks/sharingCalendars/useShareCalendar';
import { useAuth } from '@/hooks/useAuth';
import { globalParameterStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { accessRole } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { getShareModalStyles } from '../settingsContainerStyles';

const maxWidth = 400;

export interface ShareModalProps {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShareModal({ isVisible, setVisible }: ShareModalProps) {
  const { familyProfiles } = useProfileContext();
  const { calendarObjs = [] } = useCalendarObjects();
  const { share, isLoading } = useShareCalendar();
  const { getValidJwt } = useAuth();

  const { theme } = useUIContext();
  const styles = getShareModalStyles(theme.isDark);
  const globalStyles = globalParameterStyles(theme.isDark);

  // ─── Owned Calendars calculation ───────────────────────────────────────────────────────────

  const [email, setEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [accessRole, setAccessRole] = useState<accessRole>('reader');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const SafeTextInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ─── Dimensions ───────────────────────────────────────────────────────────

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();
  const width = Math.min(SCREEN_WIDTH * 0.8, maxWidth);
  const height = SCREEN_HEIGHT * 0.8;
  const top = (SCREEN_HEIGHT - height) / 2;
  const left = (SCREEN_WIDTH - width) / 2;

  // ─── Owned Calendars calculation ───────────────────────────────────────────────────────────

  const ownedCalendars = useMemo(() => {
    if (!familyProfiles?.parent?.email || !calendarObjs) return [];

    return calendarObjs.filter((cal) => {
      return cal?.owner === true;
      //return cal;
    });
  }, [calendarObjs, familyProfiles]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]));
  };

  const handleShareClick = async () => {
    const jwtToken = await getValidJwt();
    if (!email || selectedIds.length === 0 || !jwtToken) return;

    setStatus(null);
    fadeAnim.stopAnimation();
    fadeAnim.setValue(0);
    let allSuccess = true;

    //send POST req to share
    for (const id of selectedIds) {
      const result = await share(id, email, jwtToken, accessRole);

      if (!result.success) allSuccess = false;
    }

    if (allSuccess) {
      setStatus('success');
      setEmail('');
      setSelectedIds([]);
    } else {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (status) {
      fadeAnim.setValue(1);

      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setStatus(null);
        }
      });
    }
  }, [status]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setVisible(false);
        Keyboard.dismiss();
      }}
    >
      {/* --- BACKDROP BUTTON --- */}
      <Pressable style={styles.backDrop} onPress={() => setVisible(false)} />

      <View style={[, styles.container, { flex: 1, maxHeight: height, width: width, top: top, left: left }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* --- Title --- */}
          <View style={styles.headerContainer}>
            <View style={{ gap: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 'auto',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={styles.title}>Share Calendars</Text>
                <Ionicons name="information-circle-outline" size={20} />
              </View>
              <Text style={styles.subtitle}>Enter recipient's email:</Text>
            </View>

            {/* --- Share Button --- */}
            <Pressable
              style={({ pressed }) => [
                styles.shareButton,
                (!email || selectedIds.length === 0 || isLoading) && styles.shareButtonDisabled,
                pressed && globalStyles.pressedButton,
              ]}
              onPress={handleShareClick}
              disabled={!email || selectedIds.length === 0 || isLoading}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isLoading ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.shareButtonText}>Sharing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="arrow-forward-outline" color={'white'} size={16} />
                    <Text style={styles.shareButtonText}>Share</Text>{' '}
                  </>
                )}
              </View>
            </Pressable>
          </View>

          {/* --- Email Input --- */}
          <SafeTextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {/* --- Error Indicator --- */}
          <Animated.View style={{ opacity: fadeAnim, height: 24, justifyContent: 'center', marginBottom: 10 }}>
            {status === 'error' && <Text style={styles.errorText}>Error: Failed to share one or more calendars</Text>}

            {status === 'success' && <Text style={styles.successText}>Calendars shared successfully!</Text>}
          </Animated.View>

          {/* --- Accesss Level --- */}
          <View style={styles.headerContainer}>
            <View style={{ gap: 4 }}>
              <Text style={styles.title}>Access Level</Text>
            </View>
          </View>

          <View style={globalStyles.toggleButtonContainer}>
            <Pressable
              style={({ pressed }) => [
                globalStyles.toggleButtonSegment,
                accessRole === 'reader' && globalStyles.toggleButtonActiveSegement,
                pressed && globalStyles.pressedButton,
              ]}
              onPress={() => setAccessRole('reader')}
            >
              <Text style={[globalStyles.smallButtonText, accessRole === 'reader' && globalStyles.activeSmallButtonText]}>reader</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                globalStyles.toggleButtonSegment,
                accessRole === 'writer' && globalStyles.toggleButtonActiveSegement,
                ,
                pressed && globalStyles.pressedButton,
              ]}
              onPress={() => setAccessRole('writer')}
            >
              <Text style={[globalStyles.smallButtonText, accessRole === 'writer' && globalStyles.activeSmallButtonText]}>writer</Text>
            </Pressable>
          </View>

          {/* --- Calendar Selection List --- */}
          <Text style={styles.sectionTitle}>Calendars</Text>
          <View style={styles.calendarsContainer}>
            {ownedCalendars.length === 0 ? (
              <Text style={styles.emptyText}>No owned calendars found.</Text>
            ) : (
              ownedCalendars.map((cal) => {
                const isSelected = selectedIds.includes(cal.calendarId);
                return (
                  <Pressable
                    key={cal.calendarId}
                    style={({ pressed }) => [
                      styles.calendarItem,
                      isSelected && styles.calendarItemActive,
                      pressed && globalStyles.pressedButton,
                    ]}
                    onPress={() => toggleSelection(cal.calendarId)}
                  >
                    <Text style={[styles.calendarText, isSelected && styles.calendarTextActive]}>{cal.calendarName}</Text>
                    {isSelected && <Ionicons name="checkmark-outline" color={COLORS.primary} size={16} />}
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
