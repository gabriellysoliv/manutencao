// HistoricoTarefas.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Tarefa {
  id: string;
  local?: string;
  data?: string;
  horaInicio?: string;
  termino?: string;
  secretaria?: string;
  departamento?: string;
  objetivo?: string;
  responsavelSolicitacao?: string;
  responsavelVisita?: string;
  avaliacao?: string;
  status?: string;
  createdAt?: string;
}

export default function HistoricoTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [selecionandoInicio, setSelecionandoInicio] = useState(true);

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const buscarTarefasFinalizadas = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q =
          user.email === 'admin@prefsb.com'
            ? query(collection(db, 'demandas'), where('status', '==', 'Finalizada'))
            : query(
                collection(db, 'demandas'),
                where('status', '==', 'Finalizada'),
                where('responsavelSolicitacao', '==', user.email)
              );

        const snapshot = await getDocs(q);
        const dados = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.().toISOString?.() || null,
        } as Tarefa));

        setTarefas(dados);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    buscarTarefasFinalizadas();
  }, [user]);

  const tarefasFiltradas = tarefas
    .filter(t => {
      if (!t.createdAt) return false;
      const data = new Date(t.createdAt);
      return (!dataInicio || data >= dataInicio) && (!dataFim || data <= dataFim);
    })
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0053A0" />
      </View>
    );
  }

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

    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Filtrar por intervalo de datas:</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={() => {
            setSelecionandoInicio(true);
            setMostrarCalendario(true);
          }}
          style={styles.botaoData}
        >
          <Text style={styles.textoBotaoData}>
            Início: {dataInicio ? dataInicio.toLocaleDateString() : 'Selecionar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelecionandoInicio(false);
            setMostrarCalendario(true);
          }}
          style={styles.botaoData}
        >
          <Text style={styles.textoBotaoData}>
            Fim: {dataFim ? dataFim.toLocaleDateString() : 'Selecionar'}
          </Text>
        </TouchableOpacity>
      </View>

      {(dataInicio || dataFim) && (
        <TouchableOpacity
          onPress={() => {
            setDataInicio(null);
            setDataFim(null);
          }}
          style={{
            backgroundColor: '#FFCCCC',
            padding: 10,
            borderRadius: 6,
            marginTop: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#990000', fontWeight: 'bold' }}>
            Limpar filtro de datas
          </Text>
        </TouchableOpacity>
      )}
    </View>

    <DateTimePickerModal
      isVisible={mostrarCalendario}
      mode="date"
      onConfirm={(date) => {
        if (selecionandoInicio) {
          setDataInicio(date);
        } else {
          setDataFim(date);
        }
        setMostrarCalendario(false);
      }}
      onCancel={() => setMostrarCalendario(false)}
    />

    {tarefasFiltradas.length === 0 ? (
      <View style={styles.semDadosContainer}>
        <Text style={styles.semDados}>Nenhuma tarefa encontrada no período selecionado.</Text>
      </View>
    ) : (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {tarefasFiltradas.map((tarefa) => (
          <View key={tarefa.id} style={styles.card}>
            <Text style={styles.cardTitle}>{tarefa.local || 'Local não informado'}</Text>
            <Text><Text style={styles.label}>Criada em:</Text> {new Date(tarefa.createdAt!).toLocaleDateString()}</Text>
            <Text><Text style={styles.label}>Data:</Text> {tarefa.data || '-'}</Text>
            <Text><Text style={styles.label}>Hora Início:</Text> {tarefa.horaInicio || '-'}</Text>
            <Text><Text style={styles.label}>Término:</Text> {tarefa.termino || '-'}</Text>
            <Text><Text style={styles.label}>Secretaria:</Text> {tarefa.secretaria || '-'}</Text>
            <Text><Text style={styles.label}>Departamento:</Text> {tarefa.departamento || '-'}</Text>
            <Text><Text style={styles.label}>Objetivo:</Text> {tarefa.objetivo || '-'}</Text>
            <Text><Text style={styles.label}>Responsável Solicitação:</Text> {tarefa.responsavelSolicitacao || '-'}</Text>
            <Text><Text style={styles.label}>Responsável Visita:</Text> {tarefa.responsavelVisita || '-'}</Text>
            <Text><Text style={styles.label}>Avaliação:</Text> {tarefa.avaliacao || '-'}</Text>
          </View>
        ))}
      </ScrollView>
    )}

    <View style={styles.barraAzulRodape}></View>
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
    borderColor: '#0053A0',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoData: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  textoBotaoData: {
    color: '#003366',
    fontWeight: 'bold',
  },
});
