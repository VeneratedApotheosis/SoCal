import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import GooglePlacesTextInput from 'react-native-google-places-textinput';

// Replace with your actual Google Places API Key
export interface PlaceSearchBarProps {
  onLocationSelect: ({ name, address }: { name: string; address: string }) => void;
}

export default function PlaceSearchBar({ onLocationSelect }: PlaceSearchBarProps) {
  const selectLocation = ({ data, details = null }: { data: GooglePlaceData; details: GooglePlaceDetail | null }) => {
    if (details) {
      const placeName = data.structured_formatting?.main_text || details.name;
      const fullAddress = details.formatted_address;

      const customCombinedAddress = `${placeName}, ${fullAddress}`;

      const selectedLocation = {
        name: placeName,
        address: customCombinedAddress,
      };

      onLocationSelect(selectedLocation);
    }
  };

  const handlePlaceSelect = (place: any) => {
    console.log('Selected place:', place);
  };

  console.log(process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY);

  return (
    <View style={styles.container}>
      <GooglePlacesTextInput apiKey={process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || ''} onPlaceSelect={handlePlaceSelect} />
      {/* <GooglePlacesAutocomplete
        placeholder="Search for event location..."
        fetchDetails={true} // Setting this to true gives you coordinates (lat/lng)
        onPress={(data, details = null) => selectLocation({ data, details })}
        query={{
          key: process.env.GOOGLE_PLACES_API_KEY,
          language: 'en',
          types: 'geocode',
        }}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
        }}
        debounce={400}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    zIndex: 1, // Crucial so the dropdown floats over other UI elements
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  listView: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
});
