import { EventsContext } from '@/components/contexts/calendar-events-context'; // Adjust path
import { EventObj } from '@/utility/types'; // Adjust path
import React, { useContext } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

const TestWriteButton = () => {
  const { createEvent, isWriting } = useContext(EventsContext);

  const handleTestWrite = async () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1);

    const endDate = new Date(testDate);
    endDate.setHours(testDate.getHours() + 1);

    const testEvent: EventObj = {
      id: '',
      title: 'Context Test Event',
      description: 'Testing write through EventsContext.',
      location: 'App',
      organizer: '', 
      allDay: false,
      startDate: testDate,
      endDate: endDate,
      eventType: 'default',
      sequence: 0,
      reminders: { useDefault: true },
      calendar: { id: 'primary' } as any,
    };

    try {
      await createEvent(testEvent);
      Alert.alert("Success", "Event added via context!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Write failed");
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isWriting && styles.disabled]} 
      onPress={handleTestWrite} 
      disabled={isWriting}
    >
      {isWriting ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>Write Test Event</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  disabled: {
    backgroundColor: '#A0C3FF',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TestWriteButton;