import React, { useEffect, useState } from 'react'; 
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  initializeApp,
  getApps,
  deleteApp,
} from 'firebase/app';
import {
  setDoc,
  doc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { auth, db, app as mainApp } from '../app/firebaseConfig'; // Ajuste para importar o app principal

type Usuario = {
  id: string;
  nome?: string;
  email: string;
  papel?: string;
  tipo?: string;
};

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoPapel, setNovoPapel] = useState('');
  const [emailLogado, setEmailLogado] = useState('');

  const [emailNovo, setEmailNovo] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [categoriaNova, setCategoriaNova] = useState<'lider' | 'trabalhador'>('lider');
  const [loadingCriar, setLoadingCriar] = useState(false);

  const rota = useRouter();
  const adminEmail = 'admin@prefsb.com';

  useEffect(() => {
    const usuarioAtual = auth.currentUser;
    if (usuarioAtual) {
      setEmailLogado(usuarioAtual.email || '');
    }
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Usuario[];
      setUsuarios(lista);
    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);
    }
  }

  function abrirModal(usuario: Usuario) {
    setUsuarioSelecionado(usuario);
    setNovoNome(usuario.nome || '');
    setNovoPapel(usuario.papel || usuario.tipo || '');
    setModalVisible(true);
  }

  async function salvarEdicao() {
    if (!usuarioSelecionado) return;
    try {
      const docRef = doc(db, 'usuarios', usuarioSelecionado.id);
      await updateDoc(docRef, {
        nome: novoNome,
        papel: novoPapel,
      });
      setModalVisible(false);
      carregarUsuarios();
    } catch (erro) {
      console.error('Erro ao salvar edição:', erro);
    }
  }

  async function excluirUsuario(id: string) {
    try {
      await deleteDoc(doc(db, 'usuarios', id));
      carregarUsuarios();
    } catch (erro) {
      console.error('Erro ao excluir usuário:', erro);
    }
  }

  function confirmarExcluir(id: string) {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirUsuario(id) },
      ]
    );
  }

  async function criarUsuario() {
    if (!emailNovo || !senhaNova) {
      Alert.alert('Erro', 'Preencha email e senha para o novo usuário.');
      return;
    }

    setLoadingCriar(true);
    const emailTrim = emailNovo.trim().toLowerCase();

    try {
      // Criar uma instância temporária do Firebase App para evitar logout do admin
      const appName = `tempApp-${Date.now()}`;
      const tempApp = initializeApp(mainApp.options, appName);
      const tempAuth = getAuth(tempApp);

      const userCredential = await createUserWithEmailAndPassword(tempAuth, emailTrim, senhaNova);
      const newUser = userCredential.user;

      // Desliga a instância temporária para liberar recursos
      await signOut(tempAuth);
      await deleteApp(tempApp);

      const docData: any = {
        email: emailTrim,
        tipo: categoriaNova,
        criadoEm: new Date(),
      };

      if (categoriaNova === 'trabalhador') {
        docData.liderEmail = emailLogado;
      }

      await setDoc(doc(db, 'usuarios', newUser.uid), docData);

      if (categoriaNova === 'trabalhador') {
        await setDoc(doc(db, 'usuarios_temp', emailTrim), {
          autorizado: true,
          criadoEm: new Date(),
        });
      }

      Alert.alert('Sucesso', `Usuário ${emailTrim} criado com sucesso!`);
      setEmailNovo('');
      setSenhaNova('');
      setCategoriaNova('lider');
      carregarUsuarios();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      Alert.alert('Erro', error.message || 'Erro ao criar usuário');
    }

    setLoadingCriar(false);
  }

  // ... restante do componente permanece igual

  const lideres = usuarios.filter(u => u.tipo === 'lider');
  const funcionarios = usuarios.filter(u => u.tipo === 'trabalhador');

  return (
    <View style={styles.container}>
      <View style={styles.header} />
 <TouchableOpacity onPress={() => rota.push('/navegation')} style={styles.botaoVoltar}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
   
      <View style={styles.headerContent}>
          

        <Text style={styles.titulo}>Gerenciar Usuários</Text>
      </View>

      {emailLogado === adminEmail && (
        <View style={styles.formCriar}>
          <Text style={styles.subtitulo}>Criar Novo Usuário</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={emailNovo}
            onChangeText={setEmailNovo}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senhaNova}
            onChangeText={setSenhaNova}
            secureTextEntry
          />
          <Picker
            selectedValue={categoriaNova}
            onValueChange={setCategoriaNova}
            style={styles.picker}
          >
            <Picker.Item label="Líder" value="lider" />
            <Picker.Item label="Funcionário" value="trabalhador" />
          </Picker>

          <TouchableOpacity
            style={[styles.botao, loadingCriar && { backgroundColor: '#999' }]}
            onPress={criarUsuario}
            disabled={loadingCriar}
          >
            {loadingCriar ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Criar Usuário</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de líderes */}
      <Text style={styles.tituloSecao}>Líderes</Text>
      <FlatList
        data={lideres}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => renderUsuario(item)}
      />

    

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Editar Usuário</Text>
            <TextInput
              style={styles.input}
              value={novoNome}
              onChangeText={setNovoNome}
              placeholder="Novo Nome"
            />
            <TextInput
              style={styles.input}
              value={novoPapel}
              onChangeText={setNovoPapel}
              placeholder="Novo Papel"
            />
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoEditar]}
                onPress={salvarEdicao}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botao, styles.botaoExcluir]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  function renderUsuario(item: Usuario) {
    return (
      <View style={styles.usuarioContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome || 'Sem nome'}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={[styles.email, { fontStyle: 'italic' }]}>
            Papel: {item.papel || item.tipo || 'não definido'}
          </Text>
        </View>

        {emailLogado === adminEmail && (
          <>
            <TouchableOpacity
              style={[styles.botao, styles.botaoEditar]}
              onPress={() => abrirModal(item)}
            >
              <Text style={styles.botaoTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botao, styles.botaoExcluir]}
              onPress={() => confirmarExcluir(item.id)}
            >
              <Text style={styles.botaoTexto}>Excluir</Text>
            </TouchableOpacity>
         
          </>
          
        )}
           <View style={styles.barraAzulRodape}></View>
      </View>
    );
  }
}

// Estilos organizados
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },

  header: {
    height: 50,
    backgroundColor: '#0053A0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
    gap: 16,
  },
   botaoVoltar: {
  padding: 5,
  marginTop: -33, // 👈 sobe o ícone
  marginLeft:5,
},

  tituloContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginHorizontal: 15,
  },

    barraAzulRodape: {
    height: 50,
    backgroundColor: '#0053A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#0048EC',
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginLeft:102,
  },
  formCriar: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#0048EC',
  },
  input: {
    borderWidth: 1,
    borderColor: '#0053A0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  picker: {
    marginBottom: 12,
  },

  usuarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  nome: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#666' },
  botao: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0053A0',
  },
  botaoEditar: { backgroundColor: '#1cb84c' },
  botaoExcluir: { backgroundColor: '#e02020' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});