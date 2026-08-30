import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import AboutSection from './about';
import FeatureSection from './features';
import Footer from './footer';
import Hero from './hero';
import Navbar from './nav-bar';

WebBrowser.openBrowserAsync('https://example.com');

export default function Homescreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const sectionPositions = useMemo(
    () => ({
      top: 0,
      features: 850,
      about: 2700,
      footer: 3500,
    }),
    [],
  );

  const navigate = (id: string) => {
    if (id === 'github') {
      const openGithub = async () => {
        const url = 'https://github.com';
        const supported = await Linking.canOpenURL(url);

        if (supported) {
          await Linking.openURL(url);
        }
        await openGithub();
      };
    }
    scrollRef.current?.scrollTo({
      y: sectionPositions[id as keyof typeof sectionPositions] ?? 0,
      animated: true,
    });
  };

  return (
    <View nativeID="top" style={styles.app}>
      <Navbar scrollY={scrollY} isDesktop={isDesktop} onNavigate={navigate} />

      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Hero />
        <FeatureSection />
        <AboutSection />
        <Footer onNavigate={navigate} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: 'COLORS.pageBackground',
  },
});
