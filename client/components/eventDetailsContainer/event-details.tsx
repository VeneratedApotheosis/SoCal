import { EventObj } from '@/utility/types';

import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { EventExpandedView } from './expanded-view';

interface Props {
  isVisible: boolean;
  event: EventObj | null;
  onClose: () => void;
}

export default function EventDetails({ isVisible, event, onClose }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['20%', '98%'], []);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      containerStyle={{ pointerEvents: 'box-none' }}
      animationConfigs={{
        duration: 250,
      }}
      handleStyle={styles.handleContainer}
      onChange={(index) => {
        setCurrentIndex(index);
        if (index === -1) {
          onClose();
        }
      }}
      stackBehavior="push"
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {event && <EventExpandedView initialEvent={event} bottomSheetModalRef={bottomSheetModalRef} modalIndex={currentIndex} />}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleContainer: {
    backgroundColor: 'white', // Matches your sheet color
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Shadow logic
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // Negative height pushes shadow UP
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  timeRow: {
    fontSize: 18,
    color: '#374151', // Darker gray for the "Actionable" time
    fontWeight: '500',
    lineHeight: 24,
  },
  dateRow: {
    fontSize: 16,
    color: '#6B7280', // Lighter gray for the date
    marginTop: 2,
  },
});
