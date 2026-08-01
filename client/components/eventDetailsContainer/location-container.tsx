import { COLORS } from '@/utility/theme';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePlacesAutocomplete } from '../../hooks/usePlacesAutocomplete';
import { useUIContext } from '../contexts/ui-context';
import { locationStyles } from './eventDetailsStyles';

export interface LocationContainerProps {
  initialValue: string;
  onLocationSelect: ({ address }: { address: string }) => void;
  editable: boolean;
  inputColor: string;
}

export default function LocationContainer({ initialValue, onLocationSelect, editable, inputColor }: LocationContainerProps) {
  const { theme } = useUIContext();
  const styles = locationStyles(theme.isDark);
  const listColor = theme.isDark ? COLORS.text.lightGray : COLORS.text.darkGray;

  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const { predictions, getPredictions, selectPlace } = usePlacesAutocomplete({
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
          style={[styles.textInput, inputValue.length === 0 && { fontStyle: 'italic' }]}
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
