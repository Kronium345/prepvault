import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Redirect, useRouter, useFocusEffect } from 'expo-router';
import { isAuthenticated } from '../lib/actions/auth.action';
import tw from 'twrnc';

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
      <View style={tw`flex-1 justify-center items-center bg-black`}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (isAuth) return <Redirect href="/home" />;

  return (
    <View style={tw`flex-1 bg-black justify-center items-center p-6`}>
      <View style={tw`items-center mb-12`}>
        <Text style={tw`text-white text-3xl font-bold mb-2`}></Text>
        <Text style={tw`text-white text-5xl mb-4`}>🎯</Text>
        <Text style={tw`text-gray-400 text-center text-lg mb-8`}>
          Your AI-powered interview preparation assistant
        </Text>
      </View>

      <View style={tw`w-full gap-4`}>
        <TouchableOpacity
          style={tw`bg-[#6366f1] py-4 rounded-xl w-full items-center`}
          onPress={() => {
            console.log('Navigating to Sign In...');
            router.push('/sign-in');
          }}
        >
          <Text style={tw`text-white font-bold text-lg`}>SIGN IN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`border border-[#6366f1] py-4 rounded-xl w-full items-center`}
          onPress={() => {
            console.log('Navigating to Sign Up...');
            router.push('/sign-up');
          }}
        >
          <Text style={tw`text-[#6366f1] font-bold text-lg`}>SIGN UP</Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-gray-500 mt-12 text-center`}>
        Practice interviews with AI and get real-time feedback
      </Text>
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
