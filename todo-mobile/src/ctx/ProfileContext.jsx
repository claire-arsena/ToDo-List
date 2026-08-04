import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALLOWED_PROFILES = [
  { id: 'claire', name: 'Claire', role: 'full', color: '#d81b60', avatar: '👧' },
  { id: 'alban', name: 'Alban', role: 'full', color: '#1e88e5', avatar: '👦' },
  { id: 'clara', name: 'Clara', role: 'full', color: '#8e24aa', avatar: '👩' },
  { id: 'marielle', name: 'Marielle', role: 'restricted', color: '#ff9800', avatar: '👩‍💼' },
];

const ACTIVE_PROFILE_KEY = '@todo_active_profile_v2';
const CREATED_PROFILES_KEY = '@todo_created_profiles_v2';
const VISIBLE_SCHEDULES_KEY = '@todo_visible_schedules_v2';

export const ProfileContext = createContext();

export function ProfileContextProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [createdProfiles, setCreatedProfiles] = useState({}); // { claire: { pin: '1234' }, ... }
  const [visibleSchedules, setVisibleSchedules] = useState({
    claire: true,
    alban: true,
    clara: true,
  });
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const savedCreated = await AsyncStorage.getItem(CREATED_PROFILES_KEY);
        let parsedCreated = {};
        if (savedCreated) {
          parsedCreated = JSON.parse(savedCreated);
          setCreatedProfiles(parsedCreated);
        }

        const savedActive = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
        if (savedActive && parsedCreated[savedActive]) {
          setActiveProfileId(savedActive);
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

  // Persist active profile
  useEffect(() => {
    if (isProfileLoaded) {
      if (activeProfileId) {
        AsyncStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
      } else {
        AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
      }
    }
  }, [activeProfileId, isProfileLoaded]);

  // Persist created profiles
  useEffect(() => {
    if (isProfileLoaded) {
      AsyncStorage.setItem(CREATED_PROFILES_KEY, JSON.stringify(createdProfiles));
    }
  }, [createdProfiles, isProfileLoaded]);

  // Persist visible schedules
  useEffect(() => {
    if (isProfileLoaded) {
      AsyncStorage.setItem(VISIBLE_SCHEDULES_KEY, JSON.stringify(visibleSchedules));
    }
  }, [visibleSchedules, isProfileLoaded]);

  const currentProfile = ALLOWED_PROFILES.find((p) => p.id === activeProfileId) || null;

  const isProfileCreated = (profileId) => {
    return !!createdProfiles[profileId];
  };

  const createProfile = (profileId, pinCode) => {
    const found = ALLOWED_PROFILES.find((p) => p.id === profileId || p.name.toLowerCase() === profileId.toLowerCase());
    if (!found) {
      return { success: false, error: 'Prénom non autorisé. Seuls Claire, Alban, Clara et Marielle peuvent créer un profil.' };
    }
    if (!pinCode || pinCode.length < 4) {
      return { success: false, error: 'Veuillez définir un code PIN d\'au moins 4 chiffres.' };
    }

    const newCreated = {
      ...createdProfiles,
      [found.id]: { pin: pinCode, createdAt: new Date().toISOString() },
    };
    setCreatedProfiles(newCreated);
    setActiveProfileId(found.id);
    return { success: true };
  };

  const switchProfile = (profileId, pinInput) => {
    const target = createdProfiles[profileId];
    if (!target) {
      return { success: false, error: 'Profil non encore créé.' };
    }
    if (target.pin !== pinInput.trim()) {
      return { success: false, error: 'Code PIN incorrect. Seul le propriétaire du profil peut y accéder.' };
    }

    setActiveProfileId(profileId);
    return { success: true };
  };

  const logoutProfile = () => {
    setActiveProfileId(null);
  };

  const toggleScheduleVisibility = (profileId) => {
    setVisibleSchedules((prev) => ({
      ...prev,
      [profileId]: !prev[profileId],
    }));
  };

  const canAccessSchedules = currentProfile && currentProfile.role === 'full';

  return (
    <ProfileContext.Provider
      value={{
        allowedProfiles: ALLOWED_PROFILES,
        createdProfiles,
        activeProfileId,
        currentProfile,
        visibleSchedules,
        isProfileLoaded,
        isProfileCreated,
        createProfile,
        switchProfile,
        logoutProfile,
        toggleScheduleVisibility,
        canAccessSchedules,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
