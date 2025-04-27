// app/layout.tsx
import * as Sentry from '@sentry/react-native'; // 🔥 Sentry import

Sentry.init({
  dsn: 'https://7eea5bdc9069312c7eb4009e7cf4bfeb@o4509225991077888.ingest.de.sentry.io/4509225994747984',

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // spotlight: __DEV__,
});


import React from 'react';
import { Slot } from 'expo-router';
import { PaperProvider, Text } from 'react-native-paper';
import { View, StyleSheet, Image } from 'react-native';
import Logo from '../assets/logo.svg';


export default function Layout() {
  return (
    <PaperProvider>
      <View style={styles.nav}>
        <Logo width={42} height={42} />
        <Text style={styles.brand}>PrepVault</Text>
      </View>
      <Slot />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logo: {
    width: 38,
    height: 32,
    marginRight: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
