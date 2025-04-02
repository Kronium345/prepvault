import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { TextInput, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
}: FormFieldProps<T>) => {
  const isPassword = type === 'password';
  const keyboardType = type === 'email' ? 'email-address' : 'default';

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.fieldContainer}>
          <TextInput
            label={label}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder || `Enter your ${label}`}
            secureTextEntry={isPassword}
            keyboardType={keyboardType}
            mode="outlined"
            style={[styles.input, error && styles.inputError]}
            outlineColor="#333"
            activeOutlineColor="#8b5cf6"
            textColor="#fff"
            placeholderTextColor="#666"
            theme={{
              colors: {
                background: '#27272a',
                text: '#fff',
                placeholder: '#666',
                primary: '#8b5cf6',
                onSurfaceVariant: '#999',
              },
            }}
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    backgroundColor: '#27272a',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormField;
