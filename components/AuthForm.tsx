import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import FormField from './FormField';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase/client';
import { signIn, signUp } from '../lib/actions/auth.action';
import { setToken } from '../lib/token';

type FormType = 'sign-in' | 'sign-up';

const signUpSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type SignInFormData = z.infer<typeof signInSchema>;

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === 'sign-in';

  const schema = isSignIn ? signInSchema : signUpSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData | SignInFormData>({
    resolver: zodResolver(schema),
    defaultValues: isSignIn
      ? { email: '', password: '' }
      : { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: any) => {
    const { name, email, password } = values;

    try {
      if (isSignIn) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken(); // 🔐 get token from Firebase

        const result = await signIn({ email, idToken });

        if (!result?.success) {
          Toast.show({
            type: 'error',
            text1: result.message || 'Sign in failed',
          });
          return;
        }

        Toast.show({
          type: 'success',
          text1: 'Signed in successfully.',
        });

        router.push('/home');
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = userCredential.user.uid;

        const result = await signUp({
          uid,
          name,
          email,
          password,
        });

        if (!result?.success) {
          Toast.show({
            type: 'error',
            text1: result.message || 'Something went wrong!',
          });
          return;
        }

        Toast.show({
          type: 'success',
          text1: 'Account created successfully. Please sign in.',
        });

        router.push('/sign-in');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      Toast.show({
        type: 'error',
        text1: err.message || 'Something went wrong!',
      });
    }
  };

  return (
    <View>
      <Text style={styles.title}>PrepVault</Text>
      <Text style={styles.subtitle}>Practice job interviews with AI</Text>

      {!isSignIn && (
        <FormField
          control={control}
          name="name"
          label="Name"
          placeholder="Enter your name"
          type="text"
        />
      )}

      <FormField
        control={control}
        name="email"
        label="Email"
        placeholder="Enter your email"
        type="email"
      />

      <FormField
        control={control}
        name="password"
        label="Password"
        placeholder="Enter your password"
        type="password"
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {isSignIn ? 'Sign In' : 'Sign Up'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#fff',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#7c3aed',
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 6,
  },
  buttonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AuthForm;
