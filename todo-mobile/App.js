import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TodoContextProvider } from './src/ctx/TodoContext';
import { ModalContextProvider, ModalContext } from './src/ctx/ModalContext';
import Background from './src/components/Background';
import CustomTabBar from './src/components/CustomTabBar';
import AppHeader from './src/components/Header';
import TaskFormModal from './src/components/Modal/TaskFormModal';
import Tasks from './src/views/Tasks/Tasks';
import Planning from './src/views/Planning';
import Agenda from './src/views/Agenda';
import Dashboard from './src/views/Dashboard';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          header: ({ route }) => <AppHeader routeName={route.name} />,
          tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0, overflow: 'visible' },
          contentStyle: { backgroundColor: 'transparent' },
        }}
        initialRouteName="Tasks"
      >
        <Tab.Screen name="Tasks" component={Tasks} options={{ title: 'Tâches' }} />
        <Tab.Screen name="Planning" component={Planning} options={{ title: 'Planning' }} />
        <Tab.Screen name="Agenda" component={Agenda} options={{ title: 'Calendrier' }} />
        <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Tableau de bord' }} />
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
      <TodoContextProvider>
        <ModalContextProvider>
          <Background>
            <AppNavigator />
            <AppModals />
          </Background>
          <StatusBar style="dark" />
        </ModalContextProvider>
      </TodoContextProvider>
    </SafeAreaProvider>
  );
}
