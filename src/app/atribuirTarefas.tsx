import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator,
  Dimensions, Modal, KeyboardAvoidingView,
  Platform, StyleSheet, ScrollView, Image // <-- Adicionado aqui
} from 'react-native';
import {
  collection, query, where, getDocs, doc, updateDoc, serverTimestamp,
  QueryDocumentSnapshot, DocumentData
} from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  [key: string]: any;
}

interface Funcionario {
  id: string;
  email: string;
  nome?: string;
  [key: string]: any;
}

export default function AtribuirTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string>('');
  const [carregando, setCarregando] = useState(true);

  const auth = getAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (!usr) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        setCarregando(false);
        return;
      }
      fetchTarefas(usr);
      fetchFuncionarios(usr);
    });

    return () => unsubscribe();
  }, []);

  const fetchTarefas = async (usr: User) => {
    try {
      const q = query(
        collection(db, 'demandas'),
        where('status', '==', 'Início'),
        where('responsavelVisita', 'array-contains', usr.email)
      );

      const querySnapshot = await getDocs(q);
      const tarefasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Tarefa[];
      setTarefas(tarefasData);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    } finally {
      setCarregando(false);
    }
  };

  const fetchFuncionarios = async (usr: User) => {
    try {
      if (!usr.email) {
        Alert.alert('Erro', 'Email do usuário não encontrado.');
        return;
      }
      const q = query(collection(db, 'usuarios'), where('liderEmail', '==', usr.email));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })) as Funcionario[];
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os funcionários.');
    }
  };

  const abrirModal = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa);
    setFuncionarioSelecionado('');
    setModalVisible(true);
  };

  const atribuirFuncionario = async () => {
    if (!funcionarioSelecionado) {
      Alert.alert('Erro', 'Selecione um funcionário.');
      return;
    }
    if (!tarefaSelecionada) {
      Alert.alert('Erro', 'Nenhuma tarefa selecionada.');
      return;
    }
    const user = auth.currentUser;
    if (!user?.email) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      const docRef = doc(db, 'demandas', tarefaSelecionada.id);
      await updateDoc(docRef, {
        responsavelVisita: [funcionarioSelecionado],
        status: 'Designada',
        atribuidorEmail: user.email,
        dataAtribuicao: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Funcionário atribuído com sucesso!');
      setModalVisible(false);
      fetchTarefas(user);
    } catch (error) {
      console.error('Erro ao atribuir funcionário:', error);
      Alert.alert('Erro', 'Não foi possível atribuir o funcionário.');
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return ( // <-- Aqui estava o erro! Estava faltando
    <View style={styles.container}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>Tarefas Pendentes</Text>
      </View>

      <FlatList
        data={tarefas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tituloCard}>Objetivo: {item.objetivo}</Text>
            <Text>Data: {item.data}</Text>
            <Text>Hora de Início: {item.horaInicio}</Text>
            <Text>Término: {item.termino}</Text>
            <Text>Local: {item.local}</Text>
            <Text>Bairro: {item.bairro}</Text>
            <Text>Secretaria: {item.secretaria}</Text>
            <Text>Departamento: {item.departamento}</Text>
            <Text>Solicitado por: {item.responsavelSolicitacao}</Text>
            <Text>Avaliação Técnica: {item.avaliacao}</Text>
            <Text>Responsável Visita: {item.responsavelVisita?.join(', ')}</Text>

            <TouchableOpacity style={styles.botao} onPress={() => abrirModal(item)}>
              <Text style={styles.botaoTexto}>Atribuir Funcionário</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal com detalhes e atribuição */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Detalhes da Tarefa</Text>
            {tarefaSelecionada && (
              <>
                <Text><Text style={styles.label}>Objetivo:</Text> {tarefaSelecionada.objetivo || '-'}</Text>
                <Text><Text style={styles.label}>Data:</Text> {tarefaSelecionada.data || '-'}</Text>
                <Text><Text style={styles.label}>Hora Início:</Text> {tarefaSelecionada.horaInicio || '-'}</Text>
                <Text><Text style={styles.label}>Término:</Text> {tarefaSelecionada.termino || '-'}</Text>
                <Text><Text style={styles.label}>Local:</Text> {tarefaSelecionada.local || '-'}</Text>
                <Text><Text style={styles.label}>Bairro:</Text> {tarefaSelecionada.bairro || '-'}</Text>
                <Text><Text style={styles.label}>Secretaria:</Text> {tarefaSelecionada.secretaria || '-'}</Text>
                <Text><Text style={styles.label}>Departamento:</Text> {tarefaSelecionada.departamento || '-'}</Text>
                <Text><Text style={styles.label}>Responsável Solicitação:</Text> {tarefaSelecionada.responsavelSolicitacao || '-'}</Text>
                <Text><Text style={styles.label}>Avaliação Técnica:</Text> {tarefaSelecionada.avaliacao || '-'}</Text>
                <Text><Text style={styles.label}>Responsável Visita:</Text> {tarefaSelecionada.responsavelVisita?.join(', ') || '-'}</Text>

                {tarefaSelecionada.arquivo && (
                  <Image source={{ uri: tarefaSelecionada.arquivo }} style={styles.imagemModal} resizeMode="contain" />
                )}

                <Text style={[styles.modalTitulo, { marginTop: 20 }]}>Atribuir Funcionário</Text>
                {funcionarios.length === 0 && <Text>Nenhum funcionário disponível.</Text>}
                {funcionarios.map((func) => (
                  <TouchableOpacity
                    key={func.id}
                    style={funcionarioSelecionado === func.email ? styles.funcionarioSelecionado : styles.funcionario}
                    onPress={() => setFuncionarioSelecionado(func.email)}
                  >
                    <Text>{func.nome || func.email}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.botaoConfirmar, !funcionarioSelecionado && { backgroundColor: '#999' }]}
                  onPress={atribuirFuncionario}
                  disabled={!funcionarioSelecionado}
                >
                  <Text style={styles.botaoTexto}>Confirmar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ marginTop: 10, color: 'red', textAlign: 'center' }}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.footer}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 50,
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  botaoVoltar: {
    padding: 5,
  },
  tituloContainer: {
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginHorizontal: 15,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  label: {
  fontWeight: 'bold',
  color: '#333',
},

imagemModal: {
  width: '100%',
  height: 200,
  marginTop: 10,
  borderRadius: 10,
},

  tituloCard: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  botao: {
    backgroundColor: '#003366',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  botaoTexto: {
    color: '#fff',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  funcionario: {
    padding: 10,
    backgroundColor: '#eee',
    marginVertical: 5,
    borderRadius: 5,
  },
  funcionarioSelecionado: {
    padding: 10,
    backgroundColor: '#a5d6a7',
    marginVertical: 5,
    borderRadius: 5,
  },
  botaoConfirmar: {
    backgroundColor: '#006400',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  footer: {
    height: 40,
    backgroundColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerTexto: {
    color: '#fff',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
