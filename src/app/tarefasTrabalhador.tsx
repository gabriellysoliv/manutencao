import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, Image, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import { db } from '../app/firebaseConfig';
import { AntDesign } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { query, where, collection, onSnapshot } from 'firebase/firestore';

interface Tarefa {
  id: string;
  local?: string;
  bairro?: string;
  data?: string;
  horaInicio?: string;
  termino?: string;
  secretaria?: string;
  departamento?: string;
  responsavelSolicitacao?: string;
  responsavelVisita?: string;
  objetivo?: string;
  avaliacao?: string;
  arquivo?: string;
}

export default function TarefasTrabalhador() {
  const router = useRouter();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        buscarTarefasTempoReal(user.email);
      } else {
        setTarefas([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  function buscarTarefasTempoReal(userEmail: string) {
  const demandasRef = collection(db, 'demandas');

  const q1 = query(demandasRef, where('responsavelSolicitacao', '==', userEmail));
  const q2 = query(demandasRef, where('responsavelVisita', '==', userEmail));

  const tarefasSet = new Map<string, Tarefa>();

  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    snapshot.docs.forEach(doc => {
      tarefasSet.set(doc.id, { id: doc.id, ...doc.data() } as Tarefa);
    });
    setTarefas(Array.from(tarefasSet.values()));
  });

  const unsubscribe2 = onSnapshot(q2, (snapshot) => {
    snapshot.docs.forEach(doc => {
      tarefasSet.set(doc.id, { id: doc.id, ...doc.data() } as Tarefa);
    });
    setTarefas(Array.from(tarefasSet.values()));
  });

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}

  return (
    <View style={styles.container}>
      <View style={styles.header} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/homeTrabalhador')}>
          <AntDesign name="arrowleft" size={28} color="#0066FF" />
        </TouchableOpacity>

 
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.headerTitulo}>Tarefas que serão realizadas</Text>

      <Text style={styles.andamentoTexto}>
        Total: {tarefas.length} tarefas encontradas
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tarefas.length === 0 ? (
          <Text style={styles.vazioTexto}>Nenhuma tarefa encontrada.</Text>
        ) : (
          tarefas.map(tarefa => (
            <View key={tarefa.id} style={styles.card}>
              <Text style={styles.titulo}>{tarefa.local || 'Sem título'}</Text>
              <Text style={styles.info}>Bairro: {tarefa.bairro || '-'}</Text>
              <Text style={styles.info}>Data: {tarefa.data || '-'}</Text>
              <Text style={styles.descricao} numberOfLines={2}>
                {tarefa.objetivo || '-'}
              </Text>

              {tarefa.arquivo && (
                <Image source={{ uri: tarefa.arquivo }} style={styles.imagem} resizeMode="cover" />
              )}

              <TouchableOpacity
                style={styles.saberMaisBtn}
                onPress={() => {
                  setTarefaSelecionada(tarefa);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.saberMaisTexto}>Saber Mais</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer} />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Detalhes da Tarefa</Text>
            <ScrollView>
              <Text style={styles.modalTexto}>Local: {tarefaSelecionada?.local || ''}</Text>
              <Text style={styles.modalTexto}>Bairro: {tarefaSelecionada?.bairro || ''}</Text>
              <Text style={styles.modalTexto}>Data: {tarefaSelecionada?.data || ''}</Text>
              <Text style={styles.modalTexto}>Hora Início: {tarefaSelecionada?.horaInicio || ''}</Text>
              <Text style={styles.modalTexto}>Término: {tarefaSelecionada?.termino || ''}</Text>
              <Text style={styles.modalTexto}>Secretaria: {tarefaSelecionada?.secretaria || ''}</Text>
              <Text style={styles.modalTexto}>Departamento: {tarefaSelecionada?.departamento || ''}</Text>
              <Text style={styles.modalTexto}>Responsável Solicitação: {tarefaSelecionada?.responsavelSolicitacao || ''}</Text>
              <Text style={styles.modalTexto}>Responsável Visita: {tarefaSelecionada?.responsavelVisita || ''}</Text>
              <Text style={styles.modalTexto}>Objetivo: {tarefaSelecionada?.objetivo || ''}</Text>
              <Text style={styles.modalTexto}>Avaliação Técnica: {tarefaSelecionada?.avaliacao || ''}</Text>

              {tarefaSelecionada?.arquivo && (
                <Image source={{ uri: tarefaSelecionada.arquivo }} style={styles.modalImagem} resizeMode="contain" />
              )}
            </ScrollView>

            <TouchableOpacity style={styles.fecharBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.fecharTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F3' },
  header: { height: 40, backgroundColor: '#0066FF' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12,
  },
  logo: {
    width: 70, height: 70, resizeMode: 'contain', alignSelf: 'center',
  },
  headerTitulo: {
    fontSize: 20, fontWeight: 'bold', color: '#4E1F14',
    textAlign: 'center', marginVertical: 10,
  },
  andamentoTexto: {
    fontSize: 16, marginBottom: 8, paddingHorizontal: 16, color: '#4E1F14', fontWeight: 'bold',
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#4E1F14' },
  info: { fontSize: 14, color: '#555' },
  descricao: { fontSize: 14, color: '#777', marginTop: 8 },
  imagem: { width: '100%', height: 180, borderRadius: 12, marginTop: 12 },
  saberMaisBtn: {
    backgroundColor: '#D09290', marginTop: 12, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center',
  },
  saberMaisTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  footer: { height: 40, backgroundColor: '#0066FF' },
  vazioTexto: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 20 },
  modalContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%',
  },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#4E1F14' },
  modalTexto: { fontSize: 15, marginBottom: 8, color: '#444' },
  modalImagem: { width: '100%', height: 200, borderRadius: 12, marginTop: 12 },
  fecharBtn: {
    backgroundColor: '#0066FF', marginTop: 16, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center',
  },
  fecharTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
