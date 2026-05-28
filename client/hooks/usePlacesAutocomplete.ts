import { useCallback, useState } from "react";
import { fetchPlacesAutocomplete, fetchPlacesDetails } from "../services/api";

export interface Prediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
  };
}

interface UsePlacesAutocompleteProps {
  jwtToken: string | null;
  onLocationSelect: ({ address }: { address: string }) => void;
}

export function usePlacesAutocomplete({ jwtToken, onLocationSelect }: UsePlacesAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPredictions = useCallback(async (text: string) => {
    if (!jwtToken || text.trim().length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPlacesAutocomplete(jwtToken, text);
      if (data.error) {
        setError(data.error);
        return;
      }
      setPredictions(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch predictions");
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken]);

  const selectPlace = useCallback(async (prediction: Prediction) => {
    if (!jwtToken) return null;

    setIsLoading(true);
    setError(null);

    try {
      const details = await fetchPlacesDetails(jwtToken, prediction.place_id);
      if (details.error) {
        setError(details.error);
        return null;
      }

      const placeName = prediction.structured_formatting?.main_text || details.name;
      const fullAddress = details.formatted_address;
      const customCombinedAddress = `${placeName}, ${fullAddress}`;

      onLocationSelect({
        address: customCombinedAddress
      });

      setPredictions([]);
      return fullAddress; // Returned to clear or update the TextInput value field
    } catch (err: any) {
      setError(err.message || "Failed to fetch place details");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, onLocationSelect]);

  return {
    predictions,
    isLoading,
    error,
    getPredictions,
    selectPlace,
    clearPredictions: useCallback(() => setPredictions([]), []),
  };
}