import { useAuth } from '@/hooks/useAuth';
import { baseFlexStyles } from '@/utility/globalStyles';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { GoogleWeb } from './google-icon';
import { COLORS, FONT_WEIGHTS, LAYOUT, Logo, RADII, SPACING, textStyles, TYPOGRAPHY } from './homeScreenStyles';

//TODO: FIX MOBILE INTERFACE

export default function Navbar({
  scrollY,
  isDesktop,
  onNavigate,
}: {
  scrollY: number;
  isDesktop: boolean;
  onNavigate: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const styles = navBarStyles(false);
  const links =
    Platform.OS === 'web'
      ? [
          { label: 'Features', id: 'features' },
          { label: 'About', id: 'about' },
          { label: 'Privacy Policy', id: 'footer' },
        ]
      : [
          { label: 'Features', id: 'features' },
          { label: 'About', id: 'about' },
          { label: 'GitHub', id: 'github' },
          { label: 'Privacy Policy', id: 'footer' },
        ];

  const go = (id: string) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  const { promptAsync } = useAuth();

  return (
    <View style={[styles.navbar, scrollY > 20 && styles.navbarScrolled]}>
      <Pressable style={styles.brand} onPress={() => go('top')}>
        <Logo />
        <Text style={styles.brandText}>SoCal</Text>
      </Pressable>

      {isDesktop ? (
        <View style={styles.desktopNav}>
          {links.map((link) => (
            <Pressable key={link.label} onPress={() => go(link.id)} style={styles.navLink}>
              <Text style={styles.navLinkText}>{link.label}</Text>
            </Pressable>
          ))}
          {Platform.OS === 'web' && (
            <Pressable
              key={'github'}
              onPress={() => window.open('https://github.com/VeneratedApotheosis/SoCal', '_blank', 'noopener,noreferrer')}
              style={styles.navLink}
            >
              <Text style={styles.navLinkText}>{'GitHub'}</Text>
            </Pressable>
          )}
          <View style={styles.loginButton}>
            <GoogleWeb onPress={() => promptAsync()} />
          </View>
        </View>
      ) : (
        <Pressable style={styles.menuButton} onPress={() => setMenuOpen((v) => !v)}>
          <View style={[styles.menuLine, menuOpen && styles.menuLineTop]} />
          <View style={[styles.menuLine, menuOpen && styles.menuLineMiddle]} />
          <View style={[styles.menuLine, menuOpen && styles.menuLineBottom]} />
        </Pressable>
      )}

      {!isDesktop && menuOpen && (
        <View style={styles.mobileMenu}>
          {links.map((link) => (
            <Pressable key={link.label} onPress={() => go(link.id)} style={styles.mobileNavLink}>
              <Text style={styles.navLinkText}>{link.label}</Text>
            </Pressable>
          ))}
          <View style={[styles.loginButton, { overflow: 'visible', backgroundColor: 'blue' }]}>
            <GoogleWeb onPress={() => promptAsync()} />
          </View>
        </View>
      )}
    </View>
  );
}

const navBarStyles = (isDark: boolean) => {
  return StyleSheet.create({
    navbar: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 100,
      height: LAYOUT.navHeight,
      paddingHorizontal: SPACING.xxl,
      ...baseFlexStyles.rowBetween,
      backgroundColor: COLORS.navBackground,
    },
    navbarScrolled: {
      borderBottomColor: COLORS.white08,
    },
    brand: {
      ...baseFlexStyles.rowLeft,
      gap: SPACING.s,
    },
    brandText: {
      ...textStyles.brand,
    },
    desktopNav: {
      ...baseFlexStyles.rowLeft,
      gap: SPACING.xxl,
    },
    navLink: {
      paddingVertical: SPACING.s,
    },
    navLinkText: {
      color: COLORS.text.secondary,
      fontSize: TYPOGRAPHY.medium,
      fontWeight: FONT_WEIGHTS.regular,
    },
    loginButton: {
      ...baseFlexStyles.rowLeft,
      gap: SPACING.s,
      paddingHorizontal: SPACING.l,
      paddingVertical: 10,
      borderRadius: RADII.medium,
      backgroundColor: COLORS.white,
    },

    loginText: {
      color: COLORS.text.dark,
      fontSize: TYPOGRAPHY.medium,
      fontWeight: FONT_WEIGHTS.medium,
    },

    //MOBILE
    menuButton: {
      padding: SPACING.s,
      gap: SPACING.xs,
    },

    menuLine: {
      width: 20,
      height: 2,
      borderRadius: RADII.xsmall,
      backgroundColor: 'COLORS.white',
    },

    menuLineTop: {
      transform: [{ rotate: '45deg' }, { translateY: 7 }],
    },

    menuLineMiddle: {
      opacity: 0,
    },

    menuLineBottom: {
      transform: [{ rotate: '-45deg' }, { translateY: -7 }],
    },

    mobileMenu: {
      position: 'absolute',
      top: LAYOUT.navHeight,
      left: 0,
      right: 0,
      paddingHorizontal: SPACING.xxl,
      paddingTop: 12,
      paddingBottom: 24,
      gap: SPACING.l,
      backgroundColor: COLORS.mobileMenuBackground,
      borderTopWidth: 1,
      borderTopColor: 'COLORS.white08',
    },

    mobileNavLink: {
      paddingVertical: 4,
    },
  });
};
