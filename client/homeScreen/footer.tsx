import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_WEIGHTS, homeScreenStyles, LAYOUT, Logo, SPACING, TYPOGRAPHY } from './homeScreenStyles';

export default function Footer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const contact = () => Linking.openURL('mailto:contact@socal.app');

  return (
    <View nativeID="footer" style={styles.footer}>
      <View style={homeScreenStyles.sectionContainer}>
        <View style={styles.footerInner}>
          <View style={{ height: '100%', justifyContent: 'center' }}>
            <Pressable style={styles.brand} onPress={() => onNavigate('top')}>
              <Logo />
              <Text style={styles.footerBrand}>SoCal</Text>
            </Pressable>
            <Text style={styles.footerDescription}>Google Calendar, organized for groups.</Text>
          </View>

          <View style={styles.footerLinks}>
            <Text style={styles.footerEyebrow}>LINKS</Text>
            <Pressable onPress={() => onNavigate('footer')}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.footerLink}>GitHub</Text>
            </Pressable>
            <Pressable onPress={contact}>
              <Text style={styles.footerLink}>Contact Us</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  footer: {
    paddingVertical: 48,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.gridLine,
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.xxxl,
  },

  footerBrand: {
    color: 'COLORS.white',
    fontSize: TYPOGRAPHY.large,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  footerDescription: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.medium,
    marginTop: SPACING.m,
    maxWidth: LAYOUT.footerDescriptionMaxWidth,
  },

  copyright: {
    color: 'COLORS.faintText',
    fontSize: TYPOGRAPHY.small,
    marginTop: SPACING.l,
  },

  footerLinks: {
    gap: SPACING.s,
    minWidth: 160,
  },

  footerEyebrow: {
    color: 'COLORS.faintLabel',
    fontSize: TYPOGRAPHY.small,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  footerLink: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.medium,
  },
});
