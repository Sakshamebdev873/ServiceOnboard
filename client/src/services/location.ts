

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    // 1. Check if browser supports it
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    // Options for High Accuracy (GPS)
    const highAccuracyOptions = {
      enableHighAccuracy: true, // Force GPS
      timeout: 15000,           // Increased to 15 seconds (Mobile GPS is slow)
      maximumAge: 0,
    };

    // Options for Low Accuracy (Cell Towers/Wifi) - Fallback
    const lowAccuracyOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0,
    };

    // Success Handler
    const onSuccess = (position: GeolocationPosition) => {
      resolve(position);
    };

    // Error Handler for High Accuracy
    const onErrorHighAccuracy = (error: GeolocationPositionError) => {
      console.warn("High accuracy location failed, trying low accuracy...", error.message);
      
      // If error is PERMISSION_DENIED (Code 1), do not retry. User said No.
      if (error.code === error.PERMISSION_DENIED) {
        reject(new Error("Location permission denied. Please enable it in settings."));
        return;
      }

      // If Timeout (3) or Unavailable (2), try Low Accuracy
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onErrorLowAccuracy,
        lowAccuracyOptions
      );
    };

    // Error Handler for Low Accuracy (Final Failure)
    const onErrorLowAccuracy = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to retrieve location.";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable. Check your GPS.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out.";
          break;
      }
      
      reject(new Error(errorMessage));
    };

    // --- Start Request ---
    // First, try High Accuracy
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onErrorHighAccuracy,
      highAccuracyOptions
    );
  });
};

export const reverseGeocode = async (lat: string, lng: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=en`,
    {
      headers: { "User-Agent": "ServiceOnboardApp/1.0" },
    }
  );
  const data = await response.json();
  
  if (!data || !data.address) throw new Error("Address not found");

  const addr = data.address;
  return {
    city: addr.city || addr.state_district || addr.county || addr.town || addr.suburb || addr.village || "",
    state: addr.state || "",
    zipCode: addr.postcode || "",
    country: "India",
  };
};