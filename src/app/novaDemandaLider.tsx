import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import {
  collection, getDocs, addDoc,
  serverTimestamp, query, where
} from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UsuarioEquipe {
  id: string;
  email: string;
  nome: string;
}

interface Formulario {
  data: string;
  horaInicio: string;
  termino: string;
  local: string;
  bairro: string;
  secretaria: string;
  departamento: string;
  objetivo: string;
  avaliacao: string;
  imagemUrl?: string;
}

export default function FormularioLider() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const storage = getStorage();

  const [usuariosEquipe, setUsuariosEquipe] = useState<UsuarioEquipe[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);
  const [imagemBlob, setImagemBlob] = useState<Blob | null>(null);

  const [form, setForm] = useState<Formulario>({
    data: '',
    horaInicio: '',
    termino: '',
    local: '',
    bairro: '',
    secretaria: '',
    departamento: '',
    objetivo: '',
    avaliacao: '',
    imagemUrl: '',
  });

  useEffect(() => {
    if (!user) return;

    const buscarEquipe = async () => {
      try {
        const q = query(
          collection(db, 'usuarios'),
          where('tipo', '==', 'funcionario'),
          where('liderEmail', '==', user.email)
        );
        const snapshot = await getDocs(q);
        const dados: UsuarioEquipe[] = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          nome: doc.data().nome || doc.data().email,
        }));
        setUsuariosEquipe(dados);
      } catch (error) {
        console.error('Erro ao buscar equipe:', error);
        Alert.alert('Erro', 'Não foi possível buscar os trabalhadores da equipe.');
      }
    };

    buscarEquipe();
  }, [user]);

  const handleChange = (key: keyof Formulario, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const selecionarImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setImagem(localUri);

      const response = await fetch(localUri);
      const blob = await response.blob();
      setImagemBlob(blob);
    }
  };

  const salvarDemanda = async () => {
    if (!form.data || !form.local || !form.objetivo) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios: Data, Local e Objetivo.');
      return;
    }

    if (selecionados.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um trabalhador.');
      return;
    }

    setLoading(true);
    try {
      let imagemUrlFinal = '';

      if (imagemBlob) {
        const nomeArquivo = `demandas/${Date.now()}.jpg`;
        const imagemRef = ref(storage, nomeArquivo);
        await uploadBytes(imagemRef, imagemBlob);
        imagemUrlFinal = await getDownloadURL(imagemRef);
      }

      await addDoc(collection(db, 'demandas'), {
        ...form,
        imagemUrl: imagemUrlFinal,
        responsavelSolicitacao: user?.email,
        responsavelVisita: selecionados,
        status: 'Início',
        createdAt: serverTimestamp(),
        liderEmail: user?.email,
      });

      Alert.alert('Sucesso', 'Demanda cadastrada com sucesso!');
      router.replace('/gerenciarTarefasLider');

      setForm({
        data: '',
        horaInicio: '',
        termino: '',
        local: '',
        bairro: '',
        secretaria: '',
        departamento: '',
        objetivo: '',
        avaliacao: '',
        imagemUrl: '',
      });
      setSelecionados([]);
      setImagem(null);
      setImagemBlob(null);
    } catch (error) {
      console.error('Erro ao salvar demanda:', error);
      Alert.alert('Erro', 'Não foi possível salvar a demanda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.barraAzulTopo}>
        <TouchableOpacity onPress={() => router.push('/homeLider')} style={styles.botaoVoltar}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
    
      </View>
    <View style={styles.tituloContainer}>
      <Text style={styles.titulo}>Histórico de Tarefas Finalizadas</Text>
    </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text>Data:</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={form.data}
          onChangeText={text => handleChange('data', text)}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text>Hora inicial:</Text>
            <TextInput
              style={styles.input}
              placeholder="00:00"
              value={form.horaInicio}
              onChangeText={text => handleChange('horaInicio', text)}
            />
          </View>
          <View style={styles.col}>
            <Text>Término:</Text>
            <TextInput
              style={styles.input}
              placeholder="00:00"
              value={form.termino}
              onChangeText={text => handleChange('termino', text)}
            />
          </View>
        </View>

        <Text>Local:</Text>
        <TextInput
          style={styles.input}
          placeholder="Informe o local"
          value={form.local}
          onChangeText={text => handleChange('local', text)}
        />

        <Text>Bairro:</Text>
        <TextInput
          style={styles.input}
          placeholder="Informe o bairro"
          value={form.bairro}
          onChangeText={text => handleChange('bairro', text)}
        />

        <Text>Secretaria:</Text>
        <TextInput
          style={styles.input}
          placeholder="Secretaria"
          value={form.secretaria}
          onChangeText={text => handleChange('secretaria', text)}
        />

        <Text>Departamento:</Text>
        <TextInput
          style={styles.input}
          placeholder="Departamento"
          value={form.departamento}
          onChangeText={text => handleChange('departamento', text)}
        />

        <Text>Objetivo da Visita:</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="Descreva o objetivo"
          multiline
          value={form.objetivo}
          onChangeText={text => handleChange('objetivo', text)}
        />

        <Text>Situação / Avaliação:</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="Descreva a situação"
          multiline
          value={form.avaliacao}
          onChangeText={text => handleChange('avaliacao', text)}
        />

        <Text style={styles.subHeaderText}>Selecione os trabalhadores da equipe:</Text>
        {usuariosEquipe.length === 0 ? (
          <Text>Nenhum trabalhador encontrado na sua equipe.</Text>
        ) : (
          usuariosEquipe.map(u => (
            <TouchableOpacity
              key={u.id}
              style={styles.checkboxContainer}
              onPress={() => {
                setSelecionados(prev =>
                  prev.includes(u.email)
                    ? prev.filter(email => email !== u.email)
                    : [...prev, u.email]
                );
              }}
            >
              <View style={[styles.checkbox, selecionados.includes(u.email) && styles.checked]}>
                {selecionados.includes(u.email) && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>{u.nome}</Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.imagePicker} onPress={selecionarImagem}>
          <Text style={{ color: '#0066FF' }}>{imagem ? 'Trocar Foto' : 'Selecionar Foto (Opcional)'}</Text>
        </TouchableOpacity>

        {imagem && <Image source={{ uri: imagem }} style={{ width: '100%', height: 200, marginTop: 10 }} />}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={salvarDemanda}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>SALVAR DEMANDA</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.barraAzulRodape} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  barraAzulTopo: {
    height: 50,
    backgroundColor: '#0053A0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  tituloContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginHorizontal: 15,
  },
  botaoVoltar: { padding: 5 },
  tituloBarra: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 15,
  },

  form: { padding: 20 },

  input: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#FDFDFD',
  },
  inputMultiline: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FDFDFD',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  col: { flex: 1 },

  subHeaderText: {
    fontSize: 16,
    color: '#0077CC',
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'bold',
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
    titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0066FF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#0066FF',
  },
  checkMark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },

  imagePicker: {
    alignItems: 'center',
    marginTop: 15,
  },

  saveButton: {
    backgroundColor: '#0066FF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  barraAzulRodape: {
    height: 30,
    backgroundColor: '#0053A0',
  },
});
