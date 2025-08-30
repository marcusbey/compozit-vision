import React from 'react';
import { StatusBar } from 'expo-status-bar';
import DebugJourneyNavigator from './DebugJourneyNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <DebugJourneyNavigator />
    </>
  );
}