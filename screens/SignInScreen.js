import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState('buyer'); // 'buyer' | 'vendor'
  const { signIn } = useAuth();

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password, role);
    } catch (e) {
      Alert.alert('Error', e.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Welcome Back</Text>
        <Text style={s.subtitle}>Sign in to continue</Text>
        <View style={s.roleRow}>
          <TouchableOpacity style={[s.roleBtn, role === 'buyer' && s.roleBtnActive]} onPress={() => setRole('buyer')}>
            <Text style={[s.roleBtnText, role === 'buyer' && s.roleBtnTextActive]}>{'\u{1F6D2}'} Buyer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.roleBtn, role === 'vendor' && s.roleBtnActive]} onPress={() => setRole('vendor')}>
            <Text style={[s.roleBtnText, role === 'vendor' && s.roleBtnTextActive]}>{'\u{1F3EA}'} Vendor</Text>
          </TouchableOpacity>
        </View>
        <View style={s.form}>
          <TextInput style={s.input} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={[s.button, isSubmitting && s.buttonDisabled]} onPress={handleSignIn} disabled={isSubmitting}>
            <Text style={s.buttonText}>{isSubmitting ? 'Signing in...' : 'Sign In as ' + (role === 'vendor' ? 'Vendor' : 'Buyer')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.linkButton} onPress={() => navigation.navigate('SignUp')}>
            <Text style={s.linkText}>Don't have an account? <Text style={s.linkBold}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  roleRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, maxWidth: 140, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderMedium, backgroundColor: Colors.bgSecondary, alignItems: 'center' },
  roleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySurface },
  roleBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  roleBtnTextActive: { color: Colors.primaryDark, fontWeight: '600' },
  form: { width: '100%' },
  input: { height: 50, borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: Radius.md, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, backgroundColor: Colors.bgSecondary, color: Colors.textPrimary },
  button: { height: 50, backgroundColor: Colors.primary, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkBold: { color: Colors.primary, fontWeight: '600' },
});
