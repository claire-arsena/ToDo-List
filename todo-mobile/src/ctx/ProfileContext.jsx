import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALLOWED_PROFILES = [
  { id: 'claire', name: 'Claire', role: 'full', defaultColor: '#d81b60', defaultPin: '1234' },
  { id: 'alban', name: 'Alban', role: 'full', defaultColor: '#1e88e5', defaultPin: '5678' },
  { id: 'clara', name: 'Clara', role: 'full', defaultColor: '#8e24aa', defaultPin: '4321' },
  { id: 'marielle', name: 'Marielle', role: 'restricted', defaultColor: '#ff9800', defaultPin: '0000' },
];

export const THEMES = {
  rose: { key: 'rose', name: 'Rose', primary: '#d81b60', deep: '#c2185b', tint: 'rgba(216, 27, 96, 0.12)' },
  blue: { key: 'blue', name: 'Bleu', primary: '#1e88e5', deep: '#1565c0', tint: 'rgba(30, 136, 229, 0.12)' },
  green: { key: 'green', name: 'Vert', primary: '#2ecc71', deep: '#27ae60', tint: 'rgba(46, 204, 113, 0.12)' },
};

const ACTIVE_PROFILE_KEY = '@todo_active_profile_v5';
const PINS_KEY = '@todo_profile_pins_v5';
const APP_MODE_KEY = '@todo_app_mode_v5';
const THEME_KEY = '@todo_theme_color_v5';
const VISIBLE_SCHEDULES_KEY = '@todo_visible_schedules_v5';

export const ProfileContext = createContext();

export function ProfileContextProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [pins, setPins] = useState({
    claire: '1234',
    alban: '5678',
    clara: '4321',
    marielle: '0000',
  });
  const [appMode, setAppMode] = useState('personal'); // 'personal' | 'university'
  const [themeKey, setThemeKey] = useState('rose'); // 'rose' | 'blue' | 'green'
  const [visibleSchedules, setVisibleSchedules] = useState({
    claire: true,
    alban: true,
    clara: true,
  });
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Load configuration from storage
  useEffect(() => {
    (async () => {
      try {
        const savedPins = await AsyncStorage.getItem(PINS_KEY);
        if (savedPins) {
          setPins(JSON.parse(savedPins));
        }

        const savedActive = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
        if (savedActive && ALLOWED_PROFILES.some((p) => p.id === savedActive)) {
          setActiveProfileId(savedActive);
        }

        const savedMode = await AsyncStorage.getItem(APP_MODE_KEY);
        if (savedMode && (savedMode === 'personal' || savedMode === 'university')) {
          setAppMode(savedMode);
        }

        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme && THEMES[savedTheme]) {
          setThemeKey(savedTheme);
        }

        const savedSchedules = await AsyncStorage.getItem(VISIBLE_SCHEDULES_KEY);
        if (savedSchedules) {
          setVisibleSchedules(JSON.parse(savedSchedules));
        }
      } catch (e) {
        console.error('Error loading ProfileContext:', e);
      } finally {
        setIsProfileLoaded(true);
      }
    })();
  }, []);

  // Authenticate login into profile with PIN
  const loginProfile = async (profileId, pinInput) => {
    const correctPin = pins[profileId] || ALLOWED_PROFILES.find((p) => p.id === profileId)?.defaultPin;
    if (pinInput.trim() !== correctPin) {
      return { success: false, error: 'Code PIN incorrect ! Accès refusé à ce profil.' };
    }

    setActiveProfileId(profileId);
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    return { success: true };
  };

  const updateProfilePin = async (profileId, oldPin, newPin) => {
    const correctPin = pins[profileId] || ALLOWED_PROFILES.find((p) => p.id === profileId)?.defaultPin;
    if (oldPin.trim() !== correctPin) {
      return { success: false, error: 'Ancien code PIN incorrect.' };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'Le nouveau code PIN doit comporter au moins 4 chiffres.' };
    }

    const updatedPins = { ...pins, [profileId]: newPin.trim() };
    setPins(updatedPins);
    await AsyncStorage.setItem(PINS_KEY, JSON.stringify(updatedPins));
    return { success: true };
  };

  const logoutProfile = async () => {
    setActiveProfileId(null);
    await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
  };

  // Toggle App Mode ('personal' vs 'university')
  const toggleAppMode = async () => {
    const nextMode = appMode === 'personal' ? 'university' : 'personal';
    setAppMode(nextMode);
    await AsyncStorage.setItem(APP_MODE_KEY, nextMode);
  };

  // Change Theme Color
  const changeTheme = async (key) => {
    if (THEMES[key]) {
      setThemeKey(key);
      await AsyncStorage.setItem(THEME_KEY, key);
    }
  };

  const toggleScheduleVisibility = async (profileId) => {
    const updated = {
      ...visibleSchedules,
      [profileId]: !visibleSchedules[profileId],
    };
    setVisibleSchedules(updated);
    await AsyncStorage.setItem(VISIBLE_SCHEDULES_KEY, JSON.stringify(updated));
  };

  const currentProfile = ALLOWED_PROFILES.find((p) => p.id === activeProfileId) || null;
  const currentTheme = THEMES[themeKey] || THEMES.rose;
  const canAccessSchedules = currentProfile && currentProfile.role === 'full';

  return (
    <ProfileContext.Provider
      value={{
        allowedProfiles: ALLOWED_PROFILES,
        activeProfileId,
        currentProfile,
        pins,
        appMode,
        currentTheme,
        themeKey,
        visibleSchedules,
        isProfileLoaded,
        loginProfile,
        updateProfilePin,
        logoutProfile,
        toggleAppMode,
        changeTheme,
        toggleScheduleVisibility,
        canAccessSchedules,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
