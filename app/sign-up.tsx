// app/sign-up.tsx
import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import AuthForm from '../components/AuthForm';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Logo from '../assets/logo.svg';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: 'red', fontWeight: 'bold' }}>Oops! Something went wrong:</Text>
      <Text>{error.message}</Text>
    </View>
  );
}



export default function SignUp() {
  const router = useRouter();

  return (
    <>
      <View style={styles.container}>
        <View style={styles.card}>
          <Logo width={42} height={42} />
          <Text style={styles.heading}>Practice job interviews with AI</Text>

          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AuthForm type="sign-up" />
          </ErrorBoundary>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Have an account already?</Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1e1e25',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logo: {
    alignSelf: 'center',
    width: 42,
    height: 42,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#aaa',
    marginRight: 4,
  },
  linkText: {
    color: '#c084fc',
    fontWeight: 'bold',
  },
});
