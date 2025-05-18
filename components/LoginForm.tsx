import { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator } from 'react-native';
import { useLoginMutation } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const { login: setAuth } = useAuthStore();

  const handleSubmit = async () => {
    try {
      const response = await login({ email, password }).unwrap();
      setAuth(response.token, response.user);
      toast.success('Login successful!');
    } catch (err) {
      toast.error('Login failed');
      console.error(err);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Login" onPress={handleSubmit} />
      )}
    </View>
  );
}
