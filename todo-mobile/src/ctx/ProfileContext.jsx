import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALLOWED_PROFILES = [
  { id: 'claire', name: 'Claire', role: 'full', defaultColor: '#d81b60' },
  { id: 'alban', name: 'Alban', role: 'full', defaultColor: '#1e88e5' },
  { id: 'clara', name: 'Clara', role: 'full', defaultColor: '#8e24aa' },
  { id: 'marielle', name: 'Marielle', role: 'restricted', defaultColor: '#ff9800' },
];

export const THEMES = {
  rose: { key: 'rose', name: 'Rose iOS', primary: '#d81b60', deep: '#c2185b', tint: 'rgba(216, 27, 96, 0.12)' },
  blue: { key: 'blue', name: 'Bleu Ocean', primary: '#1e88e5', deep: '#1565c0', tint: 'rgba(30, 136, 229, 0.12)' },
  green: { key: 'green', name: 'Vert Émeraude', primary: '#2ecc71', deep: '#27ae60', tint: 'rgba(46, 204, 113, 0.12)' },
};

const DEVICE_PROFILE_KEY = '@todo_device_profile_id_v3';
const APP_MODE_KEY = '@todo_app_mode_v3';
const THEME_KEY = '@todo_theme_color_v3';
const VISIBLE_SCHEDULES_KEY = '@todo_visible_schedules_v3';

export const ProfileContext = createContext();

export function ProfileContextProvider({ children }) {
  const [deviceProfileId, setDeviceProfileId] = useState(null); // Locked profile on this device
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
        const savedDeviceProfile = await AsyncStorage.getItem(DEVICE_PROFILE_KEY);
        if (savedDeviceProfile && ALLOWED_PROFILES.some((p) => p.id === savedDeviceProfile)) {
          setDeviceProfileId(savedDeviceProfile);
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

  // Bind profile permanently to this device
  const bindDeviceProfile = async (profileId, pinCode) => {
    const found = ALLOWED_PROFILES.find((p) => p.id === profileId);
    if (!found) {
      return { success: false, error: 'Prénom non autorisé.' };
    }
    setDeviceProfileId(found.id);
    await AsyncStorage.setItem(DEVICE_PROFILE_KEY, found.id);
    return { success: true };
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

  const currentProfile = ALLOWED_PROFILES.find((p) => p.id === deviceProfileId) || null;
  const currentTheme = THEMES[themeKey] || THEMES.rose;
  const canAccessSchedules = currentProfile && currentProfile.role === 'full';

  return (
    <ProfileContext.Provider
      value={{
        allowedProfiles: ALLOWED_PROFILES,
        deviceProfileId,
        currentProfile,
        appMode,
        currentTheme,
        themeKey,
        visibleSchedules,
        isProfileLoaded,
        bindDeviceProfile,
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
