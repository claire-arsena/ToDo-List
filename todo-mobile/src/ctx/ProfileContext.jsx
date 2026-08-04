import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PROFILES = [
  { id: 'claire', name: 'Claire', role: 'full', color: '#d81b60', defaultPin: '1234', avatar: '👧' },
  { id: 'alban', name: 'Alban', role: 'full', color: '#1e88e5', defaultPin: '5678', avatar: '👦' },
  { id: 'clara', name: 'Clara', role: 'full', color: '#8e24aa', defaultPin: '4321', avatar: '👩' },
  { id: 'marielle', name: 'Marielle', role: 'restricted', color: '#ff9800', defaultPin: '0000', avatar: '👩‍💼' },
];

const ACTIVE_PROFILE_KEY = '@todo_active_profile_v1';
const PINS_KEY = '@todo_profile_pins_v1';
const VISIBLE_SCHEDULES_KEY = '@todo_visible_schedules_v1';

export const ProfileContext = createContext();

export function ProfileContextProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = useState('claire');
  const [pins, setPins] = useState({
    claire: '1234',
    alban: '5678',
    clara: '4321',
    marielle: '0000',
  });
  const [visibleSchedules, setVisibleSchedules] = useState({
    claire: true,
    alban: true,
    clara: true,
  });
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Load profile settings from storage
  useEffect(() => {
    (async () => {
      try {
        const savedProfile = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
        if (savedProfile && PROFILES.some(p => p.id === savedProfile)) {
          setActiveProfileId(savedProfile);
        }

        const savedPins = await AsyncStorage.getItem(PINS_KEY);
        if (savedPins) {
          setPins(JSON.parse(savedPins));
        }

        const savedSchedules = await AsyncStorage.getItem(VISIBLE_SCHEDULES_KEY);
        if (savedSchedules) {
          setVisibleSchedules(JSON.parse(savedSchedules));
        }
      } catch (e) {
        console.error('Error loading profile context:', e);
      } finally {
        setIsProfileLoaded(true);
      }
    })();
  }, []);

  // Save active profile
  useEffect(() => {
    if (isProfileLoaded) {
      AsyncStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    }
  }, [activeProfileId, isProfileLoaded]);

  // Save pins
  useEffect(() => {
    if (isProfileLoaded) {
      AsyncStorage.setItem(PINS_KEY, JSON.stringify(pins));
    }
  }, [pins, isProfileLoaded]);

  // Save visible schedules
  useEffect(() => {
    if (isProfileLoaded) {
      AsyncStorage.setItem(VISIBLE_SCHEDULES_KEY, JSON.stringify(visibleSchedules));
    }
  }, [visibleSchedules, isProfileLoaded]);

  const currentProfile = PROFILES.find((p) => p.id === activeProfileId) || PROFILES[0];

  const verifyPin = (profileId, pinInput) => {
    const correctPin = pins[profileId] || PROFILES.find((p) => p.id === profileId)?.defaultPin;
    return pinInput === correctPin;
  };

  const switchProfile = (profileId, pinInput) => {
    if (verifyPin(profileId, pinInput)) {
      setActiveProfileId(profileId);
      return { success: true };
    }
    return { success: false, error: 'Code PIN incorrect' };
  };

  const updatePin = (profileId, oldPin, newPin) => {
    if (!verifyPin(profileId, oldPin)) {
      return { success: false, error: 'Ancien code PIN incorrect' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, error: 'Le nouveau code PIN doit comporter au moins 4 chiffres' };
    }
    setPins((prev) => ({ ...prev, [profileId]: newPin }));
    return { success: true };
  };

  const toggleScheduleVisibility = (profileId) => {
    setVisibleSchedules((prev) => ({
      ...prev,
      [profileId]: !prev[profileId],
    }));
  };

  const canAccessSchedules = currentProfile.role === 'full';

  return (
    <ProfileContext.Provider
      value={{
        profiles: PROFILES,
        activeProfileId,
        currentProfile,
        pins,
        visibleSchedules,
        isProfileLoaded,
        verifyPin,
        switchProfile,
        updatePin,
        toggleScheduleVisibility,
        canAccessSchedules,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
