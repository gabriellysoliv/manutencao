import React, { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { app, db } from '../app/firebaseConfig';

const { width } = Dimensions.get('window');
const auth = getAuth(app);
const adminEmail = 'admin@prefsb.com';

export default function Index() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha email e senha.');
      return;
    }

    setCarregando(true);

    try {
      const emailLower = email.trim().toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, emailLower, senha);
      const user = userCredential.user;

      if (!user?.uid) {
        Alert.alert('Erro', 'Usuário inválido.');
        return;
      }

      if (emailLower === adminEmail.toLowerCase()) {
        router.replace('/navegation');
        return;
      }

      const userRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        Alert.alert('Erro', 'Usuário não encontrado. Cadastre-se ou contate o líder.');
        return;
      }

      const dados = userDoc.data();
      const tipo = dados?.tipo?.toLowerCase();

      if (!tipo) {
        Alert.alert('Erro', 'Usuário sem tipo definido. Contate o líder.');
        return;
      }

      if (tipo === 'lider') {
        router.replace('/homeLider');
      } else if (tipo === 'funcionario' || tipo === 'trabalhador') {
        router.replace('/homeTrabalhador');
      } else {
        Alert.alert('Erro', 'Tipo de usuário inválido.');
      }
    } catch (error: any) {
      console.log('Erro no login:', error);

      let mensagem = 'Falha ao fazer login.';

      if (error.code === 'auth/user-not-found') {
        mensagem = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        mensagem = 'Senha incorreta.';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'Email inválido.';
      } else if (error.code === 'auth/too-many-requests') {
        mensagem = 'Muitas tentativas de login. Tente mais tarde.';
      } else if (error.code === 'auth/invalid-credential') {
        mensagem = 'Credenciais inválidas. Verifique email e senha.';
      }

      Alert.alert('Erro no login', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha e-mail e senha para criar sua conta.');
      return;
    }

    setCarregando(true);

    const emailLower = email.trim().toLowerCase();

    try {
      const tempRef = doc(db, 'usuarios_temp', emailLower);
      const tempSnap = await getDoc(tempRef);

      if (!tempSnap.exists()) {
        Alert.alert(
          'Erro',
          'Você não está autorizado. Solicite ao líder que autorize seu cadastro.'
        );
        return;
      }

      const tempData = tempSnap.data();

      if (!tempData?.autorizado) {
        console.log('⚠️ Forçando autorização para:', emailLower);
        await setDoc(tempRef, { ...tempData, autorizado: true }, { merge: true });
        console.log('✅ Permissão atualizada automaticamente.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, emailLower, senha);
      const uid = userCredential.user.uid;

    await setDoc(doc(db, 'usuarios', uid), {
  email: emailLower,
  tipo: 'funcionario',
  liderEmail: tempData.liderEmail || '',
  criadoEm: new Date(),
});

// 🔐 só deleta o usuarios_temp depois que salvar com sucesso
setTimeout(() => {
  deleteDoc(tempRef);
}, 500); // opcionalmente um pequeno delay

      await deleteDoc(tempRef);

      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login.');
      setModoCadastro(false);
      setSenha('');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);

      let mensagem = 'Erro ao criar conta.';
      if (error.code === 'auth/email-already-in-use') {
        mensagem = 'Este e-mail já possui uma conta.';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        mensagem = 'A senha deve ter pelo menos 6 caracteres.';
      }

      Alert.alert('Erro', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleResetSenha = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Erro', 'Digite um e-mail válido para redefinir a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        'Sucesso',
        'Email de redefinição enviado com sucesso. Verifique sua caixa de entrada ou spam.'
      );
    } catch (error: any) {
      console.log('Erro ao enviar redefinição de senha:', error);

      let mensagem = 'Erro ao enviar email de redefinição.';

      if (error.code === 'auth/invalid-email') {
        mensagem = 'E-mail inválido.';
      } else if (error.code === 'auth/user-not-found') {
        mensagem = 'Nenhum usuário encontrado com este e-mail.';
      } else if (error.code === 'auth/missing-email') {
        mensagem = 'Digite seu e-mail.';
      }

      Alert.alert('Erro', mensagem);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.barraAzulTopo} />

      <View style={styles.conteudo}>
        <Image
          source={require('../../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          placeholder="Email:"
          placeholderTextColor="#666"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Senha:"
          placeholderTextColor="#666"
          style={styles.input}
          onChangeText={setSenha}
          value={senha}
          secureTextEntry
        />

        {carregando ? (
          <ActivityIndicator size="large" color="#0053A0" style={{ marginTop: 20 }} />
        ) : modoCadastro ? (
          <>
            <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
              <Text style={styles.botaoTexto}>CADASTRAR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModoCadastro(false)} style={{ marginTop: 15 }}>
              <Text style={styles.link}>Já tem conta? Faça login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResetSenha} style={{ marginTop: 15 }}>
              <Text style={styles.link}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.botao} onPress={handleLogin}>
              <Text style={styles.botaoTexto}>ENTRAR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModoCadastro(true)} style={{ marginTop: 15 }}>
              <Text style={styles.link}>Primeiro acesso? Cadastre sua senha</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResetSenha} style={{ marginTop: 15 }}>
              <Text style={styles.link}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.barraAzulRodape} />
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' },
  barraAzulTopo: { height: 50, width: '100%', backgroundColor: '#0048EC' },
  barraAzulRodape: { height: 50, width: '100%', backgroundColor: '#0048EC' },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: width * 0.55, height: width * 0.3, borderRadius: 12, marginBottom: 30 },
  input: {
    width: '70%',
    height: 40,
    borderWidth: 1.5,
    borderColor: '#0053A0',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginVertical: 8,
    color: '#000',
  },
  botao: {
    marginTop: 20,
    backgroundColor: '#0053A0',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  link: { color: '#0053A0', textDecorationLine: 'underline' },
});
