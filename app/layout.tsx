// app/layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { PaperProvider, Text } from 'react-native-paper';
import { View, StyleSheet, Image } from 'react-native';

export default function Layout() {
  return (
    <PaperProvider>
      <View style={styles.nav}>
        <Image
          source={require('../assets/logo.svg')} // Add logo.svg/png to assets
          style={styles.logo}
          resizeMode="contain"
        />
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
