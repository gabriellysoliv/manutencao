import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  Query,
  CollectionReference,
} from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { getAuth, User } from 'firebase/auth';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Tarefa {
  id: string;
  local?: string;
  data?: string;
  hora?: string;
  secretaria?: string;
  departamento?: string;
  objetivo?: string;
  responsavelSolicitacao?: string;
  responsavelVisita?: string;
  status?: string;
}

export default function GerenciarTarefasLider() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    let q: Query | CollectionReference;

    if (user.email === 'admin@prefsb.com') {
      q = collection(db, 'demandas');
    } else {
      q = query(
        collection(db, 'demandas'),
        where('responsavelSolicitacao', '==', user.email)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tarefasData: Tarefa[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Tarefa[];
      setTarefas(tarefasData);
    });

    return () => unsubscribe();
  }, [user]);

  const alterarStatus = async (id: string, statusAtual?: string) => {
    let novoStatus = '';
    if (statusAtual === 'Início') novoStatus = 'Em Andamento';
    else if (statusAtual === 'Em Andamento') novoStatus = 'Finalizada';
    else if (statusAtual === 'Finalizada') novoStatus = 'Início';

    try {
      await updateDoc(doc(db, 'demandas', id), { status: novoStatus });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
      console.error(error);
    }
  };

  return (
  <View style={styles.container}>
    {/* Header azul escuro com botão voltar */}
    <View style={styles.barraAzulTopo}>
      <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
        <AntDesign name="arrowleft" size={24} color="#fff" />
      </TouchableOpacity>
    </View>

    {/* Título centralizado em container branco */}
    <View style={styles.tituloContainer}>
      <Text style={styles.titulo}>
        {user?.email === 'admin@prefsb.com'
          ? 'TAREFAS GERAIS'
          : 'TAREFAS DO LÍDER'}
      </Text>
    </View>

    {tarefas.length === 0 ? (
      <View style={styles.semDadosContainer}>
        <Text style={styles.semDados}>Nenhuma tarefa cadastrada.</Text>
      </View>
    ) : (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {tarefas.map((tarefa) => (
          <View key={tarefa.id} style={styles.card}>
            <Text style={styles.cardTitle}>{tarefa.local || 'Local não informado'}</Text>
            <Text><Text style={styles.label}>Data:</Text> {tarefa.data || '-'}</Text>
            <Text><Text style={styles.label}>Hora:</Text> {tarefa.hora || '-'}</Text>
            <Text><Text style={styles.label}>Secretaria:</Text> {tarefa.secretaria || '-'}</Text>
            <Text><Text style={styles.label}>Departamento:</Text> {tarefa.departamento || '-'}</Text>
            <Text><Text style={styles.label}>Objetivo:</Text> {tarefa.objetivo || '-'}</Text>
            <Text><Text style={styles.label}>Responsável Solicitação:</Text> {tarefa.responsavelSolicitacao || '-'}</Text>
            <Text><Text style={styles.label}>Responsável Visita:</Text> {tarefa.responsavelVisita || '-'}</Text>
            <Text><Text style={styles.label}>Status:</Text> {tarefa.status || '-'}</Text>

            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => alterarStatus(tarefa.id, tarefa.status)}
            >
              <Text style={styles.statusButtonText}>Mudar status</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    )}

    {/* Rodapé azul escuro */}
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
  botaoVoltar: {
    padding: 5,
  },

  tituloContainer: {
    backgroundColor: '#fff',
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

  barraAzulRodape: {
    height: 50,
    backgroundColor: '#0053A0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 80,
  },

  card: {
    backgroundColor: '#F0F4F8',
    marginVertical: 8,
    borderRadius: 8,
    padding: 15,
    borderWidth: 2,
    borderColor: '#f26a21',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#003366',
  },
  label: {
    fontWeight: 'bold',
    color: '#004080',
  },

  statusButton: {
    backgroundColor: '#0053A0',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  semDadosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  semDados: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
