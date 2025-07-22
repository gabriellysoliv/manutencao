import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');

export default function HomeLider() {
  const rota = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.barraAzulTopo} />

      <View style={styles.voltarContainer}>
        <TouchableOpacity onPress={() => rota.push('/')}>
          <AntDesign name="arrowleft" size={28} color="#0066FF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image
          source={require('../../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.bemVindoContainer}>
          <MaterialIcons name="supervisor-account" size={48} color="#0053A0" style={styles.icone} />
          <Text style={styles.titulo}>
            Olá, Líder {usuario?.displayName || usuario?.email || 'Usuário'}
          </Text>
          <Text style={styles.subtitulo}>
            Você pode atribuir, editar e acompanhar tarefas da sua equipe.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#1CB84C' }]}
          onPress={() => rota.push('/novaDemandaLider')}
        >
          <MaterialIcons name="add-task" size={28} color="#fff" style={styles.iconeBotao} />
          <Text style={styles.textoBotao}>Criar Nova Tarefa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#F26A21' }]}
          onPress={() => rota.push('/gerenciarTarefasLider')}
        >
          <MaterialIcons name="edit-note" size={28} color="#fff" style={styles.iconeBotao} />
          <Text style={styles.textoBotao}>Gerenciar Tarefas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#007ACC' }]}
          onPress={() => rota.push('/atribuirTarefas')}
        >
          <EvilIcons name="arrow-right" size={32} color="#fff" style={styles.iconeBotao} />
          <Text style={styles.textoBotao}>Atribuir Tarefas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#004080' }]}
          onPress={() => rota.push('/relatorioLider')}
        >
          <AntDesign name="clockcircleo" size={24} color="#fff" style={styles.iconeBotao} />
          <Text style={styles.textoBotao}>Histórico de Tarefas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#002B56' }]}
          onPress={() => rota.push('/gerenciarTrablhadores')}
        >
          <MaterialIcons name="groups" size={28} color="#fff" style={styles.iconeBotao} />
          <Text style={styles.textoBotao}>Gerenciar Trabalhadores</Text>
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/mdd.png')}
          style={styles.rodape}
          resizeMode="contain"
        />
      </ScrollView>

      <View style={styles.barraAzulRodape} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 60,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.5,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#004080',
  },
  subtitulo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  botao: {
    flexDirection: 'row',
    width: '80%',
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    paddingLeft: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  iconeBotao: {
    marginRight: 15,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rodape: {
    width: width * 0.4,
    height: 50,
    marginTop: 30,
    marginBottom: 10,
  },
  barraAzulTopo: {
    height: 50,
    width: '100%',
    backgroundColor: '#0048EC',
  },
  barraAzulRodape: {
    height: 50,
    width: '100%',
    backgroundColor: '#0048EC',
  },
  bemVindoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  icone: {
    marginBottom: 10,
  },
  voltarContainer: {
    marginTop: 10,
    marginLeft: 15,
  },
});
