import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../app/firebaseConfig';
import uuid from 'react-native-uuid';
import { AntDesign } from '@expo/vector-icons';

type DadosDemanda = {
  data: string;
  horaInicio: string;
  termino: string;
  local: string;
  bairro: string;
  secretaria: string;
  departamento: string;
  responsavelSolicitacao: string;
  objetivo: string;
  avaliacao: string;
  responsavelVisita: string;
  status: 'Início' | 'Em Andamento' | 'Finalizada';
  imagemUrl: string;
};

const camposTexto: { label: string; key: keyof DadosDemanda }[] = [
  { label: 'Data', key: 'data' },
  { label: 'Hora Início', key: 'horaInicio' },
  { label: 'Término', key: 'termino' },
  { label: 'Local', key: 'local' },
  { label: 'Bairro', key: 'bairro' },
  { label: 'Secretaria', key: 'secretaria' },
  { label: 'Departamento', key: 'departamento' },
  { label: 'Responsável pela Solicitação', key: 'responsavelSolicitacao' },
  { label: 'Responsável pela Visita', key: 'responsavelVisita' },
  { label: 'Objetivo', key: 'objetivo' },
  { label: 'Avaliação', key: 'avaliacao' },
];

export default function EditarDemanda() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [dados, setDados] = useState<DadosDemanda>({
    data: '',
    horaInicio: '',
    termino: '',
    local: '',
    bairro: '',
    secretaria: '',
    departamento: '',
    responsavelSolicitacao: '',
    objetivo: '',
    avaliacao: '',
    responsavelVisita: '',
    status: 'Início',
    imagemUrl: '',
  });

  useEffect(() => {
    const carregarDemanda = async () => {
      try {
        const docRef = doc(db, 'demandas', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDados((prev) => ({
            ...prev,
            ...(docSnap.data() as Partial<DadosDemanda>),
          }));
        } else {
          Alert.alert('Erro', 'Demanda não encontrada');
          router.push('/tarefas');
        }
      } catch (err) {
        Alert.alert('Erro', 'Falha ao carregar a demanda');
        router.push('/tarefas');
      } finally {
        setLoading(false);
      }
    };

    if (id) carregarDemanda();
  }, [id]);

  const escolherImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imagem = result.assets[0];
      const blob = await fetch(imagem.uri).then((r) => r.blob());
      const nomeImagem = `${uuid.v4()}.jpg`;
      const storageRef = ref(storage, `demandas/${nomeImagem}`);

      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setDados((prev) => ({ ...prev, imagemUrl: url }));
    }
  };

  const salvar = async () => {
    const { local, bairro, objetivo } = dados;

    if (!local || !bairro || !objetivo) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      const docRef = doc(db, 'demandas', id);
      await updateDoc(docRef, dados);
      Alert.alert('Sucesso', 'Demanda atualizada');
      router.push('/tarefas');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar alterações');
      console.error(error);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header} />
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => router.push('/tarefas')} style={styles.backButton}>
          <AntDesign name="arrowleft" size={28} color="#0066CC" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Editar Demanda</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {camposTexto.map(({ label, key }) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={dados[key]}
              onChangeText={(text) =>
                setDados((prev) => ({ ...prev, [key]: text }))
              }
              multiline={key === 'objetivo' || key === 'avaliacao'}
            />
          </View>
        ))}

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          {['Início', 'Em Andamento', 'Finalizada'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusButton,
                dados.status === s && styles.statusButtonSelected,
              ]}
              onPress={() => setDados((prev) => ({ ...prev, status: s as DadosDemanda['status'] }))}
            >
              <Text
                style={[
                  styles.statusText,
                  dados.status === s && styles.statusTextSelected,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Imagem</Text>
        {dados.imagemUrl ? (
          <Image
            source={{ uri: dados.imagemUrl }}
            style={{ width: '100%', height: 200, marginBottom: 10 }}
            resizeMode="cover"
          />
        ) : null}

        <TouchableOpacity style={styles.imageButton} onPress={escolherImagem}>
          <Text style={{ color: '#FFF' }}>Escolher nova imagem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={salvar}
          disabled={salvando}
        >
          <Text style={styles.saveButtonText}>
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>

        </Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    alignItems: 'center',
    padding: 16,
    gap: 10,
    paddingTop: 50,
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
    paddingBottom: 100,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 15,
    color: '#0066CC',
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statusButtonSelected: {
    backgroundColor: '#0066CC',
  },
  statusText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  statusTextSelected: {
    color: '#FFF',
  },
  imageButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0066CC',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 60,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
  paddingHorizontal: 16,
  marginBottom: 20,
},
backButton: {
  marginRight: 10,
},
pageTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#0066CC',
},

});
