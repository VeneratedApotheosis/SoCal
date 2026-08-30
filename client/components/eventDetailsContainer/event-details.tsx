import { EventObj } from '@/utility/types';

import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import { eventDetailStyles } from './eventDetailsStyles';
import { EventExpandedView } from './expanded-view';

interface Props {
  isVisible: boolean;
  event: EventObj | null;
  onClose: () => void;
  setNewEvent?: React.Dispatch<React.SetStateAction<EventObj | null>>;
  newEvent?: EventObj | null;
}

export default function EventDetails({ isVisible, event, onClose, setNewEvent, newEvent }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['20%', '98%'], []);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const { theme } = useUIContext();
  const styles = eventDetailStyles(theme.isDark);
  const [fakeNewEvent, setFakeNewEvent] = useState<EventObj | null>(null);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      if (currentIndex !== -1) bottomSheetModalRef.current?.dismiss();
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
      handleIndicatorStyle={styles.handleIndicator}
      onChange={(index) => {
        Keyboard.dismiss();
        setCurrentIndex(index);
      }}
      index={0}
      onDismiss={onClose}
      stackBehavior="push"
    >
      <BottomSheetScrollView style={styles.container}>
        {event && (
          <EventExpandedView
            initialEvent={event}
            bottomSheetModalRef={bottomSheetModalRef}
            onClose={onClose}
            newEvent={newEvent || fakeNewEvent}
            setNewEvent={setNewEvent || setFakeNewEvent}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
