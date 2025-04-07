import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from 'react-native';
import { Redirect, useRouter, useFocusEffect } from 'expo-router'; // ✅ safe to import here
import { isAuthenticated } from '../lib/actions/auth.action';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkAuth = async () => {
        const authStatus = await isAuthenticated();
        if (isActive) {
          setIsAuth(authStatus);
          setLoading(false);
        }
      };

      checkAuth();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (isAuth) return <Redirect href="/home" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PrepVault 🎯</Text>
      <Button title="Sign In" onPress={() => {
        console.log('Navigating to Sign In...')
        router.push('/sign-in')
      }} />
      <Button title="Sign Up" onPress={() => {
        console.log('Navigating to Sign Up...')
        router.push('/sign-up')
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
