import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator,
  Dimensions, Modal, TextInput, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet
} from 'react-native';
import {
  collection, query, where, getDocs, doc, deleteDoc, updateDoc, setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';

const auth = getAuth();
const { width } = Dimensions.get('window');

interface Funcionario {
  id: string;
  email: string;
  tipo: string;
}

export default function GerenciarTrablhadores() {
  const [funcionarios, setFuncionario] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [form, setForm] = useState({ email: '' });
  const [userEmail, setUserEmail] = useState('');
  const rota = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.email) {
        setUserEmail(firebaseUser.email);
        fetchFuncionarios(firebaseUser.email);
      }
    });
    return unsubscribe;
  }, []);

  const fetchFuncionarios = async (email: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'usuarios'),
        where('tipo', '==', 'funcionario'),
        where('liderEmail', '==', email)
      );
      const querySnapshot = await getDocs(q);

      const lista: Funcionario[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Funcionario),
      }));

      setFuncionario(lista);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      Alert.alert('Erro', 'Erro ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  };

  const confirmarExcluir = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir este funcionário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirFuncionario(id) },
      ]
    );
  };

  const excluirFuncionario = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'usuarios', id));
      setFuncionario((prev) => prev.filter((f) => f.id !== id));
      Alert.alert('Sucesso', 'Funcionário excluído.');
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      Alert.alert('Erro', 'Erro ao excluir funcionário.');
    }
  };

  const abrirModalCadastro = () => {
    setForm({ email: '' });
    setEditando(null);
    setModalVisible(true);
  };

  const abrirModalEdicao = (func: Funcionario) => {
    setForm({ email: func.email });
    setEditando(func);
    setModalVisible(true);
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const salvarFuncionario = async () => {
    const emailFormatado = form.email.toLowerCase().trim();

    if (!emailFormatado) {
      Alert.alert('Erro', 'Informe o e-mail do funcionário.');
      return;
    }

    setModalLoading(true);

    try {
      if (editando) {
        await updateDoc(doc(db, 'usuarios', editando.id), {
          email: emailFormatado,
        });

        setFuncionario((prev) =>
          prev.map((f) => (f.id === editando.id ? { ...f, email: emailFormatado } : f))
        );

        Alert.alert('Sucesso', 'Funcionário editado com sucesso.');
      } else {
        const q = query(collection(db, 'usuarios'), where('email', '==', emailFormatado));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          Alert.alert('Erro', 'Este e-mail já foi cadastrado.');
          return;
        }

        await setDoc(doc(db, 'usuarios_temp', emailFormatado), {
          email: emailFormatado,
          liderEmail: userEmail,
          criadoEm: serverTimestamp(),
          autorizado: true,
        });

        Alert.alert('Sucesso', 'Funcionário autorizado. Ele poderá criar a senha ao se cadastrar.');
      }

      setModalVisible(false);
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      Alert.alert('Erro', 'Erro ao salvar funcionário. ' + (error.message || ''));
    } finally {
      setModalLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Funcionario }) => (
    <View style={styles.card}>
      <View style={styles.cardTopo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.email || 'Sem email'}</Text>
          <Text style={styles.email}>Tipo: {item.tipo}</Text>
        </View>
      </View>

      <View style={styles.cardBotoes}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoEditar]}
          onPress={() => abrirModalEdicao(item)}
        >
          <Text style={styles.botaoTexto}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoExcluir]}
          onPress={() => confirmarExcluir(item.id)}
        >
          <Text style={styles.botaoTexto}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => rota.push('/homeLider')} style={styles.botaoVoltar}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* TÍTULO */}
      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>Gerenciar Funcionários</Text>
      </View>

      {/* BOTÃO NOVO */}
      <TouchableOpacity style={styles.botaoNovo} onPress={abrirModalCadastro}>
        <AntDesign name="adduser" size={20} color="#fff" />
        <Text style={styles.textoBotaoNovo}>Cadastrar Novo Funcionário</Text>
      </TouchableOpacity>

      {/* LISTAGEM */}
      {loading ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 40 }} />
      ) : funcionarios.length === 0 ? (
        <Text style={styles.semDados}>Nenhum funcionário cadastrado.</Text>
      ) : (
        <FlatList
          data={funcionarios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitulo}>
                {editando ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
              </Text>

              <Text style={styles.label}>E-mail:</Text>
              <TextInput
                style={styles.input}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
              />

              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={[styles.botaoModal, { backgroundColor: '#003366' }]}
                  onPress={salvarFuncionario}
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.textoBotaoModal}>Salvar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.botaoModal, { backgroundColor: '#ccc' }]}
                  onPress={() => setModalVisible(false)}
                  disabled={modalLoading}
                >
                  <Text style={[styles.textoBotaoModal, { color: '#333' }]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* FOOTER */}
      <View style={styles.footer} />
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
  botaoVoltar: { padding: 5 },
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
  botaoNovo: {
    backgroundColor: '#003366',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoNovo: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  semDados: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBotoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  botao: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  botaoEditar: {
    backgroundColor: '#1cb84c', // verde para editar
  },
  botaoExcluir: {
    backgroundColor: '#e02020', // vermelho para excluir
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nome: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#666' },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#003366',
  },
  label: { fontSize: 14, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  botaoModal: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  textoBotaoModal: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    height: 40,
    backgroundColor: '#003366',
  },
});
