import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePlacesAutocomplete } from '../../hooks/usePlacesAutocomplete';
import { useAuthContext } from '../contexts/auth-context';

export interface LocationContainerProps {
  initialValue: string;
  onLocationSelect: ({ address }: { address: string }) => void;
}

export default function LocationContainer({ initialValue, onLocationSelect }: LocationContainerProps) {
  const { jwtToken } = useAuthContext();
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Extract token string safely or fallback to null
  const tokenString = jwtToken?.sessionToken || null;

  const { predictions, getPredictions, selectPlace } = usePlacesAutocomplete({
    jwtToken: tokenString,
    onLocationSelect,
  });
  const handleTextChange = (text: string) => {
    setInputValue(text);
    getPredictions(text);
  };

  const handleRowPress = async (item: any) => {
    const chosenPlaceName = await selectPlace(item);
    if (chosenPlaceName) {
      console.log(chosenPlaceName);
      setInputValue(chosenPlaceName);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputValue}
          onChangeText={handleTextChange}
          placeholder="Search for a location..."
          placeholderTextColor="#888"
        />
      </View>
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.place_id}
          style={styles.listView}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleRowPress(item)}>
              <Text numberOfLines={1} style={{ color: '#333', fontSize: 14 }}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    zIndex: 1,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
  },
  textInput: {
    height: 48,
    color: '#333',
    fontSize: 16,
    //borderWidth: 1,
    //borderColor: '#ccc',
    //borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  listView: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    elevation: 3,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 220,
  },
  row: {
    padding: 13,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
