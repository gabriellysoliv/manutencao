import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import {
  collection, getDocs, addDoc, serverTimestamp, query, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../app/firebaseConfig';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

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
}

export default function novaDemanda() {
  const rota = useRouter();
    const router = useRouter();

  const [usuariosLideres, setUsuariosLideres] = useState<UsuarioEquipe[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);
  const [imagemBlob, setImagemBlob] = useState<Blob | null>(null);
  const [demandasDoLider, setDemandasDoLider] = useState<any[]>([]);

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
  });

  useEffect(() => {
    const buscarLideres = async () => {
      try {
        const q = collection(db, 'usuarios');
        const snapshot = await getDocs(q);
        const dados: UsuarioEquipe[] = snapshot.docs
          .map(doc => doc.data())
          .filter((u: any) => u.tipo === 'lider')
          .map((u: any, index: number) => ({
            id: snapshot.docs[index].id,
            email: u.email,
            nome: u.nome || u.email,
          }));
        setUsuariosLideres(dados);
      } catch (error) {
        console.error('Erro ao buscar líderes:', error);
        Alert.alert('Erro', 'Não foi possível carregar os líderes.');
      }
    };

    buscarLideres();
  }, []);

  const handleSelecionar = async (email: string) => {
    let novaSelecao: string[];

    if (selecionados.includes(email)) {
      novaSelecao = selecionados.filter(e => e !== email);
    } else {
      novaSelecao = [...selecionados, email];
    }

    setSelecionados(novaSelecao);

    try {
      const demandasRef = collection(db, 'demandas');
      const todasDemandas: any[] = [];

      for (const liderEmail of novaSelecao) {
        const q = query(demandasRef, where('responsavelVisita', 'array-contains', liderEmail));
        const snapshot = await getDocs(q);
        const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        todasDemandas.push(...dados);
      }

      const semDuplicatas = todasDemandas.filter(
        (value, index, self) =>
          index === self.findIndex(v => v.id === value.id)
      );

      setDemandasDoLider(semDuplicatas);
    } catch (error) {
      console.error('Erro ao buscar demandas do(s) líder(es):', error);
      Alert.alert('Erro', 'Não foi possível buscar as demandas.');
    }
  };

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
    Alert.alert('Atenção', 'Selecione ao menos um líder responsável pela visita.');
    return;
  }

  setLoading(true);
  let arquivoURL = null;

  try {
    if (imagemBlob) {
      const nomeArquivo = `demandas/${Date.now()}.jpg`;
      const imagemRef = ref(storage, nomeArquivo);
      await uploadBytes(imagemRef, imagemBlob);
      arquivoURL = await getDownloadURL(imagemRef);
    }

    await addDoc(collection(db, 'demandas'), {
      ...form,
      responsavelVisita: selecionados,
      responsavelSolicitacao: '', // ou use auth.currentUser?.email
      status: 'Início',
      createdAt: serverTimestamp(),
      arquivo: arquivoURL || null,
      liderEmail: selecionados[0], // ← ESSENCIAL para consultas no Firestore
    });

    Alert.alert('Sucesso', 'Demanda cadastrada com sucesso!');
    router.replace('/tarefas');
  } catch (error) {
    console.error('Erro ao salvar demanda:', error);
    Alert.alert('Erro', 'Não foi possível salvar a demanda.');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      {/* HEADER AZUL ESCURO COM BOTÃO VOLTAR */}
        <View style={styles.barraAzulTopo}>
          <TouchableOpacity onPress={() => rota.push('/navegation')} style={styles.botaoVoltar}>
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
  
        {/* TÍTULO */}
       

      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>SOLICITAÇÃO DE DEMANDA</Text>
      </View>
<ScrollView contentContainerStyle={styles.form}>
  <Text>Data:</Text>
  <TextInput
    style={styles.input}
    value={form.data}
    onChangeText={text => handleChange('data', text)}
    placeholder="Ex: 22/07/2025"
  />

  <View style={styles.row}>
    <View style={styles.col}>
      <Text>Hora inicial:</Text>
      <TextInput
        style={styles.input}
        value={form.horaInicio}
        onChangeText={text => handleChange('horaInicio', text)}
        placeholder="Ex: 08:00"
      />
    </View>
    <View style={styles.col}>
      <Text>Término:</Text>
      <TextInput
        style={styles.input}
        value={form.termino}
        onChangeText={text => handleChange('termino', text)}
        placeholder="Ex: 12:00"
      />
    </View>
  </View>

  <Text>Local:</Text>
  <TextInput
    style={styles.input}
    value={form.local}
    onChangeText={text => handleChange('local', text)}
    placeholder="Digite o local da visita"
  />

  <Text>Bairro:</Text>
  <TextInput
    style={styles.input}
    value={form.bairro}
    onChangeText={text => handleChange('bairro', text)}
    placeholder="Digite o bairro"
  />

  <Text>Secretaria:</Text>
  <TextInput
    style={styles.input}
    value={form.secretaria}
    onChangeText={text => handleChange('secretaria', text)}
    placeholder="Digite a secretaria"
  />

  <Text>Departamento:</Text>
  <TextInput
    style={styles.input}
    value={form.departamento}
    onChangeText={text => handleChange('departamento', text)}
    placeholder="Digite o departamento"
  />

  <Text>Objetivo da Visita:</Text>
  <TextInput
    style={styles.inputMultiline}
    multiline
    value={form.objetivo}
    onChangeText={text => handleChange('objetivo', text)}
    placeholder="Descreva o objetivo da visita"
  />

  <Text>Situação / Avaliação:</Text>
  <TextInput
    style={styles.inputMultiline}
    multiline
    value={form.avaliacao}
    onChangeText={text => handleChange('avaliacao', text)}
    placeholder="Descreva a situação ou avaliação técnica"
  />

        <Text style={styles.subHeaderText}>Selecione os líderes responsáveis pela visita:</Text>
        {usuariosLideres.map(u => (
          <TouchableOpacity key={u.id} style={styles.checkboxContainer} onPress={() => handleSelecionar(u.email)}>
            <View style={[styles.checkbox, selecionados.includes(u.email) && styles.checked]}>
              {selecionados.includes(u.email) && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{u.nome}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.imagePicker} onPress={selecionarImagem}>
          <Text style={{ color: '#0066FF' }}>{imagem ? 'Trocar Foto' : 'Selecionar Foto (Opcional)'}</Text>
        </TouchableOpacity>

        {imagem && <Image source={{ uri: imagem }} style={{ width: '100%', height: 200, marginTop: 10 }} />}

        <TouchableOpacity style={styles.saveButton} onPress={salvarDemanda} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>SALVAR DEMANDA</Text>}
        </TouchableOpacity>

        {demandasDoLider.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: '#333' }}>
              Demandas atribuídas aos líderes selecionados:
            </Text>
            {demandasDoLider.map((d, index) => (
              <View key={index} style={{ backgroundColor: '#f0f0f0', padding: 10, marginBottom: 8, borderRadius: 6 }}>
                <Text>📅 Data: {d.data}</Text>
                <Text>📍 Local: {d.local}</Text>
                <Text>🎯 Objetivo: {d.objetivo}</Text>
                <Text>Status: {d.status}</Text>
              </View>
            ))}
          </View>
        )}
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
    paddingLeft: 15,
  },
  botaoVoltar: { padding: 5 },

  tituloContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginHorizontal: 15,
  },
  titulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
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

  botaoAnexar: {
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
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
