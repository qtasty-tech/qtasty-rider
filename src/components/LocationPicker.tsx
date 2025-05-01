import React, { useState, useEffect } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const mapContainerStyle = {
  width: "100%",
  height: "400px", // Increased height for better visibility
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 40.7128, // New York City as fallback
  lng: -74.006,
};

interface LocationPickerProps {
  onLocationUpdate: (coords: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationUpdate,
  initialLocation,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    initialLocation || defaultCenter
  );
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(
    initialLocation || defaultCenter
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false); // Set initial state to false (map hidden)

  // Fetch user's current location on mount if no initial location provided
  useEffect(() => {
    if (initialLocation) return;

    fetchCurrentLocation();
  }, [initialLocation]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setCenter(pos);
        setMarkerPosition(pos);
        setIsLocating(false);
      },
      (err) => {
        setLocationError(`Error getting location: ${err.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle the marker drag event
  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPosition(newPos);
    setIsSaved(false); // Reset saved state when location changes
  };

  // Handle map click to place marker
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPosition(newPos);
    setIsSaved(false); // Reset saved state when location changes
  };

  // Save the location when the button is clicked
  const handleSaveLocation = () => {
    onLocationUpdate(markerPosition);
    setIsSaved(true);

    // Reset saved confirmation after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  // Toggle the visibility of the map
  const toggleMapVisibility = () => {
    setIsMapVisible((prevState) => !prevState);
  };

  if (loadError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading map: {loadError.message || "Could not load Google Maps"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {locationError && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {!isLoaded ? (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={mapContainerStyle}>
            <div className="flex flex-col items-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
              <p className="text-gray-500">Loading map...</p>
            </div>
          </div>
        ) : isMapVisible ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onClick={handleMapClick}
            options={{
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              zoomControl: true,
            }}
          >
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleDragEnd}
              animation={google.maps.Animation.DROP}
            />
          </GoogleMap>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={fetchCurrentLocation}
          disabled={isLocating || !isLoaded}
          className="flex items-center gap-2"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {isLocating ? "Locating..." : "Use My Location"}
        </Button>

        <Button
          variant="default"
          onClick={handleSaveLocation}
          disabled={!isLoaded || isLocating}
          className="flex items-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              Location Saved
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Save Location
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={toggleMapVisibility}
          className="flex items-center gap-2"
        >
          {isMapVisible ? "Hide Map" : "Show Map"}
        </Button>
      </div>

      {isLoaded && (
        <div className="text-sm text-gray-500">
          <p>Selected coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
