import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { useShareCalendar } from '@/hooks/sharingCalendars/useShareCalendar';
import { globalParameterStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { accessRole } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useAuthContext } from '../../contexts/auth-context';
import { getShareModalStyles } from '../settingsContainerStyles';

export const shareModalRef = createRef<BottomSheetModal>();

export default function ShareModal() {
  const [email, setEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [accessRole, setAccessRole] = useState<accessRole>('reader');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const snapPoints = useMemo(() => ['95%'], []);
  const SafeTextInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { familyProfiles } = useAuthContext();
  const { calendarObjs = [] } = useCalendarObjects();
  const { share, isLoading, error, clearError } = useShareCalendar();
  const { jwtToken } = useAuthContext();

  const { theme } = useUIContext();
  const styles = getShareModalStyles(theme.isDark);
  const globalStyles = globalParameterStyles(theme.isDark);

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
    if (!email || selectedIds.length === 0 || !jwtToken) return;

    setStatus(null);
    fadeAnim.stopAnimation();
    fadeAnim.setValue(0);
    let allSuccess = true;

    //send POST req to share
    for (const id of selectedIds) {
      const result = await share(id, email, jwtToken.sessionToken, accessRole);

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

  //backdrop to close modal
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" opacity={0} />,
    [],
  );

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
    <BottomSheetModal
      ref={shareModalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={styles.modalBackground}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      keyboardBehavior="interactive"
      stackBehavior="push"
      enableHandlePanningGesture
    >
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
