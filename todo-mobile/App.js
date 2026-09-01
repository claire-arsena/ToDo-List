import React from 'react';
import { useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProfileContextProvider } from './src/ctx/ProfileContext';
import { TodoContextProvider } from './src/ctx/TodoContext';
import { ModalContextProvider } from './src/ctx/ModalContext';
import Background from './src/components/Background';
import CustomTabBar from './src/components/CustomTabBar';
import AppHeader from './src/components/Header';
import TaskFormModal from './src/components/Modal/TaskFormModal';
import Tasks from './src/views/Tasks/Tasks';
import Planning from './src/views/Planning';
import Agenda from './src/views/Agenda';
import ProfileView from './src/views/ProfileView';
import { DESKTOP_BREAKPOINT } from './src/config/constants';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  // Sur PC (fenêtre large), on ouvre directement sur le Planning plutôt que
  // sur les Tâches — c'est ce qu'on vient consulter en premier depuis un
  // ordinateur (emploi du temps de la semaine).
  const { width } = useWindowDimensions();
  const initialRouteName = width >= DESKTOP_BREAKPOINT ? 'Planning' : 'Tasks';

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          header: ({ route }) => <AppHeader routeName={route.name} />,
          tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0, overflow: 'visible' },
          contentStyle: { backgroundColor: 'transparent' },
        }}
        initialRouteName={initialRouteName}
      >
        <Tab.Screen name="Tasks" component={Tasks} options={{ title: 'Tâches' }} />
        <Tab.Screen name="Planning" component={Planning} options={{ title: 'Planning' }} />
        <Tab.Screen name="Agenda" component={Agenda} options={{ title: 'Calendrier' }} />
        <Tab.Screen name="Profile" component={ProfileView} options={{ title: 'Profil' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppModals() {
  return (
    <>
      <TaskFormModal />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileContextProvider>
        <TodoContextProvider>
          <ModalContextProvider>
            <Background>
              <AppNavigator />
              <AppModals />
            </Background>
            <StatusBar style="dark" />
          </ModalContextProvider>
        </TodoContextProvider>
      </ProfileContextProvider>
    </SafeAreaProvider>
  );
}
