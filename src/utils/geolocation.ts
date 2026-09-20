// ===============================================================
// GPS GEOFENCE & HAVERSINE DISTANCE UTILITIES
// ===============================================================

import { GymGeofenceSettings } from '../types';

export const DEFAULT_GYM_GEOFENCE: GymGeofenceSettings = {
  latitude: 20.2718, // Kanker, Chhattisgarh coordinates
  longitude: 81.4932,
  radiusMeters: 150, // 150 meters radius
  gymAddress: 'कौशिक फिटनेस, पुराना बस स्टैंड रोड, राजापारा, कांकेर (छ.ग.) 494334',
  isEnabled: true,
  allowManualSimulation: true,
};

// Maximum allowed geofence radius configured for the gym
export const MAX_GEOFENCE_RADIUS = 500;

/**
 * Calculates great-circle distance between two points in meters using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

/**
 * Format distance in meters or kilometers nicely
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Validates whether user coordinates fall within gym boundary
 */
export function checkGeofence(
  userLat: number,
  userLon: number,
  gymSettings: GymGeofenceSettings = DEFAULT_GYM_GEOFENCE
): {
  distanceMeters: number;
  isWithinRadius: boolean;
  formattedDistance: string;
  allowedRadius: number;
} {
  const distance = calculateDistance(
    userLat,
    userLon,
    gymSettings.latitude,
    gymSettings.longitude
  );

  return {
    distanceMeters: distance,
    isWithinRadius: distance <= gymSettings.radiusMeters,
    formattedDistance: formatDistance(distance),
    allowedRadius: gymSettings.radiusMeters,
  };
}

// Simulation Storage Keys
export type SimulationMode = 'real' | 'inside' | 'outside';
const SIMULATION_KEY = 'kf_gps_sim_mode';

export function getSimulationMode(): SimulationMode {
  try {
    const saved = localStorage.getItem(SIMULATION_KEY);
    if (saved === 'inside' || saved === 'outside' || saved === 'real') {
      return saved;
    }
  } catch (e) {
    // fallback
  }
  return 'inside'; // Default to inside so demo immediately works without blocking
}

export function setSimulationMode(mode: SimulationMode): void {
  try {
    localStorage.setItem(SIMULATION_KEY, mode);
  } catch (e) {
    // fallback
  }
}

/**
 * Retrieves coordinates based on real device GPS or simulated test mode
 */
export async function getDeviceCoordinates(
  gymSettings: GymGeofenceSettings = DEFAULT_GYM_GEOFENCE
): Promise<{
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  isSimulated: boolean;
  mode: SimulationMode;
}> {
  const mode = getSimulationMode();

  // Simulated: Inside Gym (approx 45 meters from gym center)
  if (mode === 'inside') {
    return {
      latitude: gymSettings.latitude + 0.0003,
      longitude: gymSettings.longitude + 0.0002,
      accuracyMeters: 10,
      isSimulated: true,
      mode: 'inside',
    };
  }

  // Simulated: Outside Gym (approx 406 meters away - strictly within 500 meters of gym center)
  if (mode === 'outside') {
    return {
      latitude: gymSettings.latitude + 0.0028,
      longitude: gymSettings.longitude + 0.0025,
      accuracyMeters: 10,
      isSimulated: true,
      mode: 'outside',
    };
  }

  // Real GPS from Browser
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Fallback if browser does not support geolocation
      resolve({
        latitude: gymSettings.latitude + 0.0003,
        longitude: gymSettings.longitude + 0.0002,
        isSimulated: true,
        mode: 'inside',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          isSimulated: false,
          mode: 'real',
        });
      },
      (_err) => {
        // Fallback gracefully on permission denial
        resolve({
          latitude: gymSettings.latitude + 0.0003,
          longitude: gymSettings.longitude + 0.0002,
          isSimulated: true,
          mode: 'inside',
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}
