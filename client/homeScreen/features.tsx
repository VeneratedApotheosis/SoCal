import { useScreenSize } from '@/components/contexts/screen-size-context';
import DraggableCalendar from '@/components/custom-drawer/drawer-draggable-calendar';
import { DATE_HEADER_HEIGHT, DEFAULT_COLORS, WEB_DATE_HEADER_PADDING, WEB_WHITE_X_PADDING, WEB_WHITE_Y_PADDING } from '@/utility/constants';
import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ScrollView as RNGHScrollView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { GoogleLogoWeb } from './google-icon';
import { COLORS, DECORATIVE, FONT_WEIGHTS, homeScreenStyles, LAYOUT, Logo, RADII, SPACING, TYPOGRAPHY } from './homeScreenStyles';
import { MockCalendar, MockEvent } from './mock-calendar';
import MockSharedCalendars from './mock-share-calendar';

function CheckIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Path d="M2 5l2.5 2.5L8 3" stroke="#4f8ef7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FeaturePlaceholder({
  children,
  label = 'screenshot / animation',
  width,
  height,
  position,
  top,
}: {
  children: React.ReactNode;
  label?: string;
  width?: number;
  height?: number;
  position?: 'relative' | 'absolute';
  top?: number;
}) {
  return (
    <>
      {position && position === 'absolute' ? (
        <View style={[styles.featurePlaceholder, { backgroundColor: 'transparent', overflow: 'visible' }]}>
          <View
            style={[
              styles.featurePlaceholder,
              !!width && { width: width },
              !!height && { height: height },
              !!top && { top: top },
              !!position && { position: position },
            ]}
          >
            {children || (
              <View style={styles.placeholderContent}>
                <View style={styles.placeholderLine} />
                <Text style={styles.placeholderText}>{label}</Text>
                <View style={styles.placeholderLine} />
              </View>
            )}
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.featurePlaceholder,
            !!width && { width: width },
            !!height && { height: height },
            !!top && { top: top },
            !!position && { position: position },
          ]}
        >
          {children || (
            <View style={styles.placeholderContent}>
              <View style={styles.placeholderLine} />
              <Text style={styles.placeholderText}>{label}</Text>
              <View style={styles.placeholderLine} />
            </View>
          )}
        </View>
      )}
    </>
  );
}

function SidebarMockup() {
  const groups: {
    id: string;
    folder: boolean;
    calendar: calendarObj | null;
  }[] = [
    {
      id: 'Owner',
      folder: true,
      calendar: null,
    },
    {
      id: 'James@gmail.com',
      folder: false,
      calendar: {
        calendarName: 'James@gmail.com',
        calendarId: '1',
        calendarDefaultColor: DEFAULT_COLORS[10],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
    {
      id: 'Schedule',
      folder: false,
      calendar: {
        calendarName: 'Schedule',
        calendarId: '2',
        calendarDefaultColor: DEFAULT_COLORS[4],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
    {
      id: 'Meetings',
      folder: false,
      calendar: {
        calendarName: 'Meetings',
        calendarId: '3',
        calendarDefaultColor: DEFAULT_COLORS[7],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
    {
      id: 'Josh',
      folder: false,
      calendar: null,
    },
    {
      id: 'josh@gmail.com',
      folder: false,
      calendar: {
        calendarName: 'josh@gmail.com',
        calendarId: '4',
        calendarDefaultColor: DEFAULT_COLORS[11],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
    {
      id: 'Shift Work',
      folder: false,
      calendar: {
        calendarName: 'Shift Work',
        calendarId: '5',
        calendarDefaultColor: DEFAULT_COLORS[2],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
    {
      id: 'Assignments',
      folder: false,
      calendar: {
        calendarName: 'Assignments',
        calendarId: '6',
        calendarDefaultColor: DEFAULT_COLORS[12],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
    {
      id: 'Jose',
      folder: false,
      calendar: null,
    },
    {
      id: 'Reminders',
      folder: false,
      calendar: {
        calendarName: 'Reminders',
        calendarId: '7',
        calendarDefaultColor: DEFAULT_COLORS[5],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
    {
      id: 'Workouts',
      folder: false,
      calendar: {
        calendarName: 'Workouts',
        calendarId: '8',
        calendarDefaultColor: DEFAULT_COLORS[8],
        owner: true,
        accessRole: 'owner',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        dataOwner: 'me',
      },
    },
  ];

  const hoverIndex = useSharedValue<number | null>(null);
  const activeIndex = useSharedValue<number | null>(null);
  const isHovering = useSharedValue<boolean>(false);
  const drawerScrollViewRef = useRef<RNGHScrollView>(null);

  return (
    <View style={{ padding: 16, borderRadius: 16, backgroundColor: 'white', flex: 1 }}>
      <RNGHScrollView style={[styles.mockLight]} ref={drawerScrollViewRef}>
        {groups.map((data, index) => (
          <DraggableCalendar
            key={data.folder ? `folder-${data.id}` : `cal-${data.calendar?.calendarId}`}
            cal={data}
            onDrop={() => {}}
            toggleCalendar={(id: string) => {}}
            thisIndex={index}
            hoverIndex={hoverIndex}
            activeIndex={activeIndex}
            isHovering={isHovering}
            drawerScrollViewRef={drawerScrollViewRef}
            backgroundColor="#fff"
          />
        ))}
      </RNGHScrollView>
    </View>
  );
}

function IsolationMockup() {
  const { isWeb } = useScreenSize();

  const webContainerRef = useRef<any>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const handleLayout = (event: any) => {
    try {
      const { width, height, x, y } = event.nativeEvent.layout;
      setBoxWidth(Math.floor((width - 2 * WEB_WHITE_X_PADDING) / 3));
    } catch (e) {
      console.log(e);
    }
  };
  const top = DATE_HEADER_HEIGHT + isWeb * WEB_DATE_HEADER_PADDING * 2 + WEB_WHITE_Y_PADDING;

  return (
    <View style={{ flex: 1 }} onLayout={handleLayout}>
      <Animated.View ref={webContainerRef} style={{ width: '100%', height: 0 }}></Animated.View>
      <MockCalendar />
      <MockEvent
        color={DEFAULT_COLORS[8]}
        top={top + 40 * 0.5}
        height={40 * 1.5}
        left={WEB_WHITE_X_PADDING}
        width={boxWidth - 10}
        offset={5}
        opacity={1}
        selectedThisEvent={false}
        text={'ECE 3 Lecture'}
      />
      <MockEvent
        color={DEFAULT_COLORS[8]}
        top={top + 40 * 4}
        height={40 * 2}
        left={WEB_WHITE_X_PADDING}
        width={boxWidth - 10}
        offset={5}
        opacity={1}
        selectedThisEvent={false}
        text={'CS 33 Lecture'}
      />
      <MockEvent
        color={DEFAULT_COLORS[8]}
        top={top + 40 * 0.5}
        height={40 * 1}
        left={WEB_WHITE_X_PADDING + boxWidth}
        width={boxWidth - 10}
        offset={5}
        opacity={1}
        selectedThisEvent={false}
        text={'ECE 3 Lab'}
      />
      <MockEvent
        color={DEFAULT_COLORS[8]}
        top={top + 40 * 6}
        height={40 * 1.5}
        left={WEB_WHITE_X_PADDING + boxWidth * 1.5}
        width={boxWidth / 2 - 10}
        offset={6}
        opacity={1}
        selectedThisEvent={false}
        text={'Math 32B Lecture'}
      />
      <MockEvent
        color={DEFAULT_COLORS[8]}
        top={top + 40 * 0.5}
        height={40 * 1.5}
        left={WEB_WHITE_X_PADDING + boxWidth * 2}
        width={boxWidth - 10}
        offset={5}
        opacity={1}
        selectedThisEvent={false}
        text={'ECE 3 Lecture'}
      />
      <MockEvent
        color={DEFAULT_COLORS[8]}
        top={top + 40 * 4}
        height={40 * 2}
        left={WEB_WHITE_X_PADDING + boxWidth * 2}
        width={boxWidth - 10}
        offset={5}
        opacity={1}
        selectedThisEvent={false}
        text={'CS 33 Lecture'}
      />
      <MockEvent
        color={DEFAULT_COLORS[2]}
        top={top + 40 * 1.5}
        height={40 * 1}
        left={WEB_WHITE_X_PADDING + boxWidth / 2}
        width={boxWidth / 2 - 10}
        offset={6}
        opacity={0.4}
        selectedThisEvent={false}
        text={'Meeting with Mr. Smtih'}
      />
      <MockEvent
        color={DEFAULT_COLORS[2]}
        top={top + 40 * 3.5}
        height={40 * 3.5}
        left={WEB_WHITE_X_PADDING + boxWidth / 2}
        width={boxWidth / 2 - 10}
        offset={6}
        opacity={0.4}
        selectedThisEvent={false}
        text={'Studying for Exam'}
      />
      <MockEvent
        color={DEFAULT_COLORS[2]}
        top={top + 40 * 0}
        height={40 * 2}
        left={WEB_WHITE_X_PADDING + boxWidth * 1.5}
        width={boxWidth / 2 - 10}
        offset={6}
        opacity={0.4}
        selectedThisEvent={false}
        text={'Physics 1C'}
      />
      <MockEvent
        color={DEFAULT_COLORS[2]}
        top={top + 40 * 4.5}
        height={40 * 2}
        left={WEB_WHITE_X_PADDING + boxWidth * 1}
        width={boxWidth - 10}
        offset={5}
        opacity={0.4}
        selectedThisEvent={false}
        text={'Math 61 Lecture'}
      />
      <MockEvent
        color={DEFAULT_COLORS[2]}
        top={top + 40 * 1}
        height={40 * 2}
        left={WEB_WHITE_X_PADDING + boxWidth * 2.5}
        width={boxWidth / 2 - 10}
        offset={6}
        opacity={0.4}
        selectedThisEvent={false}
        text={'Physics Lab'}
      />
      <MockEvent
        color={DEFAULT_COLORS[2]}
        top={top + 40 * 4.5}
        height={40 * 1}
        left={WEB_WHITE_X_PADDING + boxWidth * 2.5}
        width={boxWidth / 2 - 10}
        offset={5}
        opacity={0.4}
        selectedThisEvent={false}
        text={'Lunch with Jose'}
      />
    </View>
  );
}

function SharingMockup() {
  return <MockSharedCalendars />;
}

function SyncMockup() {
  return (
    <View style={{ padding: 16, borderRadius: 32, flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', gap: 40 }}>
        <Logo size={100} />
        <Ionicons size={100} name="code-outline" />
        <GoogleLogoWeb width={100} height={100} onPress={() => {}} />
      </View>
    </View>
  );
}

type Feature = {
  id: string;
  tag: string;
  title: string;
  imageLeft: boolean;
  body: string | string[];
  list?: string[];
  render: () => React.ReactNode;
  width?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  shift?: {
    position: 'relative' | 'absolute';
    top: number;
  };
};

const FEATURES: Feature[] = [
  {
    id: 'grouping',
    tag: 'Calendar Grouping',
    title: "Everyone's schedule, one place.",
    imageLeft: false,
    body: "Stop asking your friends \"are you free\"? Share each other's calendars: SoCal elegantly merges multiple Google Calendars into a single unified view, organized however you like. Whether it's your roommates, your study group, or your team, you get one clean view with everyone's commitments visible at a glance.",
    render: () => <SidebarMockup />,
    dimensions: {
      width: 400,
      height: 450,
    },
    shift: {
      position: 'relative',
      top: 0,
    },
  },
  {
    id: 'isolation',
    tag: 'Isolation Mode',
    title: 'Zero in on what matters.',
    imageLeft: true,
    body: [
      'Isolate your calendar, and everyone else fades into the background.',
      'Perfect for coordinating one-on-one plans without noise from the whole group.',
      'Instantly toggle back to the full group view with one click.',
    ],
    render: () => <IsolationMockup />,
    dimensions: {
      width: 500,
      height: 400,
    },
    shift: {
      position: 'absolute',
      top: -100,
    },
  },
  {
    id: 'sharing',
    tag: 'Sharing Controls',
    title: 'Always know who sees what.',
    imageLeft: false,
    body: 'Sharing calendars should feel safe, not scary. SoCal gives you a clear, real-time view of exactly who has access to your calendars.',
    list: [
      'Browse shared access by user or by individual calendar.',
      'See a badge count of how many calendars each person can view.',
      'Revoke access at any time without leaving the app.',
    ],
    render: () => <SharingMockup />,
    dimensions: {
      width: 500,
      height: 325,
    },
    shift: {
      position: 'absolute',
      top: -25,
    },
  },
  {
    id: 'sync',
    tag: 'Google Calendar Sync',
    title: 'Real-time sync with Google Calendar.',
    imageLeft: true,
    body: [
      'SoCal reads directly from Google Calendar, perfectly in sync.',
      'Events you add in SoCal appear in Google Calendar instantly.',
      'All event types supported: single, recurring, all-day, and multi-day.',
      'Never re-enter an event. Your data lives in Google, SoCal just makes it better.',
    ],
    render: () => <SyncMockup />,
  },
];

export default function FeatureSection() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  return (
    <View nativeID="features" style={styles.featuresSection}>
      <View style={homeScreenStyles.sectionContainer}>
        <View style={homeScreenStyles.sectionHeader}>
          <Text style={homeScreenStyles.blueEyebrow}>FEATURES</Text>
          <Text style={homeScreenStyles.sectionTitle}>Built for groups, not just individuals.</Text>
          <Text style={homeScreenStyles.sectionDescription}>
            Google Calendar was designed for one person. SoCal extends it for the way you actually live: with other people.
          </Text>
        </View>

        <View style={styles.featureList}>
          {FEATURES.map((f) => {
            const text = (
              <View style={[styles.featureText, desktop && styles.featureHalf]}>
                <Text style={styles.featureTag}>{f.tag}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>

                {Array.isArray(f.body) ? (
                  <View style={styles.bulletList}>
                    {f.body.map((item, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <View style={styles.checkCircle}>
                          <CheckIcon />
                        </View>
                        <Text style={styles.featureBody}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.featureBody}>{f.body}</Text>
                )}

                {f.list && (
                  <View style={styles.bulletList}>
                    {f.list.map((item, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <View style={styles.checkCircle}>
                          <CheckIcon />
                        </View>
                        <Text style={styles.featureBody}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );

            const image =
              !!f.dimensions && !!f.shift ? (
                <FeaturePlaceholder width={f.dimensions.width} height={f.dimensions.height} position={f.shift.position} top={f.shift.top}>
                  {f.render()}
                </FeaturePlaceholder>
              ) : (
                <FeaturePlaceholder>{f.render()}</FeaturePlaceholder>
              );

            return (
              <View key={f.id} style={[styles.featureRow, desktop && styles.featureRowDesktop]}>
                {desktop && f.imageLeft ? image : text}
                {desktop && f.imageLeft ? text : image}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  featuresSection: {
    backgroundColor: COLORS.pageBackground,
    paddingVertical: 96,
  },
  featureList: {
    gap: 40,
  },
  featureRow: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.xxxl,
  },

  featureRowDesktop: {
    flexDirection: 'row',
  },

  featureRowImageLeft: {},

  featureHalf: {
    flex: 1,
  },

  featureText: {
    width: '100%',
  },

  featurePlaceholder: {
    aspectRatio: 16 / 9,
    minHeight: 300,
    overflow: 'hidden',
    borderRadius: RADII.xl,
    backgroundColor: COLORS.white,
  },

  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s,
  },

  placeholderLine: {
    width: 32,
    height: 2,
    borderRadius: RADII.xsmall,
    backgroundColor: 'COLORS.placeholderLine',
  },

  placeholderText: {
    color: 'COLORS.placeholderText',
    fontSize: TYPOGRAPHY.small,
  },

  featureTag: {
    alignSelf: 'flex-start',
    color: COLORS.primaryy.soft,
    backgroundColor: COLORS.primaryy.background,
    paddingHorizontal: SPACING.m,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    fontSize: TYPOGRAPHY.small,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 1.5,
    marginBottom: SPACING.l,
  },

  featureTitle: {
    color: 'COLORS.pageBackground',
    fontSize: TYPOGRAPHY.featureTitle,
    lineHeight: TYPOGRAPHY.featureTitleLineHeight,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -1,
    marginBottom: SPACING.xl,
  },

  featureBody: {
    flex: 1,
    color: 'COLORS.bodyText',
    fontSize: TYPOGRAPHY.body,
    lineHeight: TYPOGRAPHY.bodyLineHeightSmall,
  },

  bulletList: {
    gap: SPACING.m,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.m,
  },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: RADII.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    backgroundColor: COLORS.primaryy.background,
  },

  mockLight: {
    flex: 1,
    paddingHorizontal: SPACING.l,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  syncMock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    backgroundColor: 'COLORS.panelBackground',
  },

  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.l,
  },

  iconCard: {
    width: 56,
    height: 56,
    borderRadius: RADII.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'COLORS.white',
    borderWidth: 1,
    borderColor: 'COLORS.border',
    shadowColor: 'COLORS.black',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  arrows: {
    width: 48,
    alignItems: 'center',
  },

  arrowBlue: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.medium,
  },

  arrowPurple: {
    color: 'COLORS.purple',
    fontSize: TYPOGRAPHY.medium,
  },

  arrowLine: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.arrowLine,
    marginTop: -3,
  },

  arrowLineReverse: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.arrowLine,
    marginTop: 6,
  },

  syncText: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.small,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING.l,
  },

  aboutSection: {
    position: 'relative',
    paddingVertical: 96,
    backgroundColor: 'COLORS.pageBackground',
    overflow: 'hidden',
  },

  aboutGlow: {
    position: 'absolute',
    width: DECORATIVE.largeGlow,
    height: DECORATIVE.largeGlowHeight,
    borderRadius: RADII.dot,
    alignSelf: 'center',
    top: 100,
    backgroundColor: 'COLORS.purpleGlow',
  },

  lightSectionTitle: {
    color: 'COLORS.white',
    fontSize: TYPOGRAPHY.display,
    lineHeight: TYPOGRAPHY.displayLineHeight,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -1.5,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },

  lightSectionDescription: {
    color: 'COLORS.mutedText',
    fontSize: TYPOGRAPHY.large,
    lineHeight: TYPOGRAPHY.largeLineHeight,
    maxWidth: LAYOUT.aboutDescriptionMaxWidth,
    textAlign: 'center',
  },

  teamGrid: {
    flexDirection: 'row',
    gap: SPACING.xxl,
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

  footer: {
    paddingVertical: 48,
    backgroundColor: 'COLORS.pageBackground',
    borderTopWidth: 1,
    borderTopColor: 'COLORS.white07',
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
    gap: SPACING.m,
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
