import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, DECORATIVE, FONT_WEIGHTS, homeScreenStyles, LAYOUT, RADII, SPACING, TYPOGRAPHY } from './homeScreenStyles';

export default function AboutSection() {
  const team = [
    { initials: 'AS', name: 'Alex Song', role: 'Frontend & UX', bg: '#f87171' as const },
    { initials: 'CW', name: 'Chelsea Wang', role: 'Product & Design', bg: '#a78bfa' as const },
    { initials: 'KH', name: 'Kenan Hu', role: 'Backend & Calendar Sync', bg: '#4ade80' as const },
  ];

  return (
    <View nativeID="about" style={styles.aboutSection}>
      <View style={styles.aboutGlow} />
      <View style={homeScreenStyles.sectionContainer}>
        <View style={homeScreenStyles.sectionHeader}>
          <Text style={homeScreenStyles.blueEyebrow}>ABOUT</Text>
          <Text style={homeScreenStyles.sectionTitle}>Why we built SoCal.</Text>
          <Text style={homeScreenStyles.sectionDescription}>
            We're a group of friends who got tired of the endless "are you free?" texts. We were all on Google Calendar, but there was no
            easy way to see each other's schedules without awkward sharing and constant manual checking. So we built SoCal — the layer on
            top of Google Calendar that groups actually need.
          </Text>
        </View>

        <View style={styles.teamGrid}>
          {team.map((m) => (
            <View key={m.name} style={styles.teamCard}>
              <View style={[styles.teamAvatar, { backgroundColor: m.bg }]}>
                <Text style={styles.teamAvatarText}>{m.initials}</Text>
              </View>
              <Text style={styles.teamName}>{m.name}</Text>
              <Text style={styles.teamRole}>{m.role}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aboutSection: {
    position: 'relative',
    paddingVertical: 96,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  aboutGlow: {
    position: 'absolute',
    width: DECORATIVE.largeGlow,
    height: DECORATIVE.largeGlowHeight,
    borderRadius: RADII.pill,
    alignSelf: 'center',
    top: 100,
    backgroundColor: COLORS.purpleGlow,
  },
  teamGrid: {
    flexDirection: 'row',
    gap: SPACING.xxl,
  },
  teamCard: {
    flex: 1,
    alignItems: 'center',
    padding: 32,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.black07,
  },
  teamAvatar: {
    width: 64,
    height: LAYOUT.navHeight,
    borderRadius: RADII.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.l,
  },
  teamAvatarText: {
    color: 'COLORS.white',
    fontSize: TYPOGRAPHY.large,
    fontWeight: FONT_WEIGHTS.bold,
  },
  teamName: {
    color: 'COLORS.white',
    fontSize: TYPOGRAPHY.body,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 4,
  },
  teamRole: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.medium,
    textAlign: 'center',
  },
});
