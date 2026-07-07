import { COLORS } from '@/utility/theme';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePlacesAutocomplete } from '../../hooks/usePlacesAutocomplete';
import { useAuthContext } from '../contexts/auth-context';
import { useUIContext } from '../contexts/ui-context';
import { locationStyles } from './eventDetailsStyles';

export interface LocationContainerProps {
  initialValue: string;
  onLocationSelect: ({ address }: { address: string }) => void;
  editable: boolean;
}

export default function LocationContainer({ initialValue, onLocationSelect, editable }: LocationContainerProps) {
  const { jwtToken } = useAuthContext();
  const { theme } = useUIContext();
  const styles = locationStyles(theme.isDark);
  const inputColor = COLORS.text.lightGray;
  const listColor = theme.isDark ? COLORS.text.lightGray : COLORS.text.darkGray;

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
    onLocationSelect({ address: text });
    setInputValue(text);
    getPredictions(text);
  };

  const handleRowPress = async (item: any) => {
    const chosenPlaceName = await selectPlace(item);
    if (chosenPlaceName) {
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
          placeholderTextColor={inputColor}
          editable={editable}
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
              <Text numberOfLines={1} style={{ color: listColor, fontSize: 14 }}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
