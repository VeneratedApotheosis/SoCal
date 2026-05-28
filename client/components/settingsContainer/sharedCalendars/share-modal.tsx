import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useShareCalendar } from '@/hooks/sharingCalendars/useShareCalendar';
import { globalStyles } from '@/utility/globalStyles';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import { shareRole } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthContext } from '../../contexts/auth-context';

export const shareModalRef = createRef<BottomSheetModal>();

export default function ShareModal() {
  const [email, setEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [accessRole, setAccessRole] = useState<shareRole>('reader');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const snapPoints = useMemo(() => ['95%'], []);
  const SafeTextInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { familyProfiles } = useAuthContext();
  const { calendarObjs = [] } = useCalendarObjects();
  const { share, isLoading, error, clearError } = useShareCalendar();
  const { jwtToken } = useAuthContext();

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
                  {/* Optional: Add a checkmark icon or indicator here if you have Ionicons */}
                  {isSelected && <Ionicons name="checkmark-outline" color={COLORS.primary} size={16} />}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Share Button */}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 10,
  },
  title: {
    fontSize: SIZES.l,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text.main,
  },
  subtitle: {
    fontSize: SIZES.s,
    fontWeight: FONT_WEIGHTS.light,
    color: COLORS.textLight,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: SIZES.m,
    color: '#1A1A1A',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  sectionTitle: {
    fontSize: SIZES.l,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text.main,
    marginBottom: 12,
  },
  scrollContent: {
    padding: 24,
  },
  emptyText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  calendarsContainer: {
    gap: 12,
    flexDirection: 'column',
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  calendarItemActive: {
    backgroundColor: '#E8F0FE',
    borderColor: COLORS.primary,
  },
  calendarText: {
    fontSize: SIZES.m,
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.light,
  },
  calendarTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginTop: 'auto',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  shareButtonDisabled: { backgroundColor: '#A0C2F9' },
  shareButtonText: {
    color: 'white',
    fontSize: SIZES.l,
    fontWeight: FONT_WEIGHTS.medium,
  },
  errorText: {
    color: '#EA4335',
    fontSize: SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
    backgroundColor: '#FEEBEE',
    padding: 4,
    borderRadius: 8,
  },
  successText: {
    color: '#3eea35',
    fontSize: SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
    backgroundColor: '#ebfeee',
    padding: 4,
    borderRadius: 8,
  },
});
