import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALLOWED_PROFILES = [
  { id: 'claire', name: 'Claire', role: 'full', defaultColor: '#d81b60' },
  { id: 'alban', name: 'Alban', role: 'full', defaultColor: '#1e88e5' },
  { id: 'clara', name: 'Clara', role: 'full', defaultColor: '#8e24aa' },
  { id: 'marielle', name: 'Marielle', role: 'restricted', defaultColor: '#ff9800' },
];

export const THEMES = {
  rose: { key: 'rose', name: 'Rose', primary: '#d81b60', deep: '#c2185b', tint: 'rgba(216, 27, 96, 0.12)' },
  blue: { key: 'blue', name: 'Bleu', primary: '#1e88e5', deep: '#1565c0', tint: 'rgba(30, 136, 229, 0.12)' },
  green: { key: 'green', name: 'Vert', primary: '#2ecc71', deep: '#27ae60', tint: 'rgba(46, 204, 113, 0.12)' },
};

const ACTIVE_PROFILE_KEY = '@todo_active_profile_v4';
const REGISTERED_PROFILES_KEY = '@todo_registered_profiles_v4';
const APP_MODE_KEY = '@todo_app_mode_v4';
const THEME_KEY = '@todo_theme_color_v4';
const VISIBLE_SCHEDULES_KEY = '@todo_visible_schedules_v4';

export const ProfileContext = createContext();

export function ProfileContextProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [registeredProfiles, setRegisteredProfiles] = useState({}); // { claire: { pin: '1234' }, ... }
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
        const savedReg = await AsyncStorage.getItem(REGISTERED_PROFILES_KEY);
        let parsedReg = {};
        if (savedReg) {
          parsedReg = JSON.parse(savedReg);
          setRegisteredProfiles(parsedReg);
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

  // Check if profile has registered PIN
  const isProfileRegistered = (profileId) => {
    return !!registeredProfiles[profileId];
  };

  // Create & Register profile with secret PIN
  const registerProfile = async (profileId, pinCode) => {
    const found = ALLOWED_PROFILES.find((p) => p.id === profileId);
    if (!found) {
      return { success: false, error: 'Prénom non autorisé.' };
    }
    if (!pinCode || pinCode.trim().length < 4) {
      return { success: false, error: 'Le code PIN doit comporter au moins 4 chiffres.' };
    }

    const updated = {
      ...registeredProfiles,
      [found.id]: { pin: pinCode.trim(), createdAt: new Date().toISOString() },
    };
    setRegisteredProfiles(updated);
    setActiveProfileId(found.id);

    await AsyncStorage.setItem(REGISTERED_PROFILES_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, found.id);
    return { success: true };
  };

  // Authenticate login into registered profile with PIN
  const loginProfile = async (profileId, pinInput) => {
    const target = registeredProfiles[profileId];
    if (!target) {
      return { success: false, error: 'Ce profil n\'est pas encore créé.' };
    }
    if (target.pin !== pinInput.trim()) {
      return { success: false, error: 'Code PIN incorrect ! Accès refusé à ce profil.' };
    }

    setActiveProfileId(profileId);
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
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
        registeredProfiles,
        activeProfileId,
        currentProfile,
        appMode,
        currentTheme,
        themeKey,
        visibleSchedules,
        isProfileLoaded,
        isProfileRegistered,
        registerProfile,
        loginProfile,
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
