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
import FolderFormModal from './src/components/Modal/FolderFormModal';
import Tasks from './src/views/Tasks/Tasks';
import Agenda from './src/views/Agenda';
import Folders from './src/views/Folders';
import Dashboard from './src/views/Dashboard';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          header: ({ route }) => <AppHeader routeName={route.name} />,
        }}
        initialRouteName="Tasks"
      >
        <Tab.Screen name="Tasks" component={Tasks} options={{ title: 'Tâches' }} />
        <Tab.Screen name="Agenda" component={Agenda} options={{ title: 'Agenda' }} />
        <Tab.Screen name="Folders" component={Folders} options={{ title: 'Dossiers' }} />
        <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Tableau de bord' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppModals() {
  return (
    <>
      <TaskFormModal />
      <FolderFormModal />
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
