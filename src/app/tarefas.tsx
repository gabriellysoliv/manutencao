import React, { useState, useEffect, useRef } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<any | null>(null);
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null); // 👈 MODIFICADO

  useEffect(() => {
    const q = query(collection(db, 'demandas'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setTarefas([]);
          setLoading(false);
          return;
        }
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTarefas(lista);
        setLoading(false);
      },
      () => {
        Alert.alert('Erro', 'Falha ao carregar demandas');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 👇 Faz scroll automático para o final quando tarefas são carregadas
  useEffect(() => {
    if (tarefas.length > 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [tarefas]);

  const mudarStatus = async (id: string, novoStatus: string) => {
    try {
      const docRef = doc(db, 'demandas', id);
      await updateDoc(docRef, { status: novoStatus });
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const excluirTarefa = (id: string) => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'demandas', id));
              Alert.alert('Sucesso', 'Tarefa excluída.');
              setModalVisible(false);
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          },
        },
      ]
    );
  };

  if (loading)
    return <Text style={styles.loading}>Carregando...</Text>;

  if (tarefas.length === 0)
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Nenhuma demanda encontrada.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.barraAzulTopo}>
        <TouchableOpacity onPress={() => router.push('/navegation')} style={styles.botaoVoltar}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>Minhas Tarefas</Text>
      </View>

      <Text style={styles.andamentoTexto}>Total: {tarefas.length} tarefas</Text>

      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10 }}>
          {['Início', 'Em Andamento', 'Finalizada'].map((status) => (
            <View
              key={status}
              style={[
                styles.colunaStatus,
                status === 'Início'
                  ? styles.colunaInício
                  : status === 'Em Andamento'
                  ? styles.colunaEmAndamento
                  : styles.colunaFinalizada,
              ]}
            >
              <Text style={styles.colunaTitulo}>{status}</Text>
              {tarefas
                .filter((t) => t.status === status)
                .map((tarefa) => (
                  <View key={tarefa.id} style={styles.card}>
                    <View style={styles.statusBotoes}>
                      {['Início', 'Em Andamento', 'Finalizada'].map((opcao) => (
                        <TouchableOpacity
                          key={opcao}
                          onPress={() => mudarStatus(tarefa.id, opcao)}
                          style={[
                            styles.statusBotao,
                            tarefa.status === opcao &&
                              (opcao === 'Início'
                                ? styles.statusSelecionadoInício
                                : opcao === 'Em Andamento'
                                ? styles.statusSelecionadoEmAndamento
                                : styles.statusSelecionadoFinalizada),
                          ]}
                        >
                          <Text
                            style={{
                              color: tarefa.status === opcao ? '#fff' : '#333',
                              fontWeight: 'bold',
                              fontSize: 12,
                            }}
                          >
                            {opcao}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

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
                      <Text style={[styles.saberMaisTexto, { fontSize: 16 }]}>Saber Mais</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.footer} />

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitulo}>Detalhes da Tarefa</Text>
              {tarefaSelecionada && (
                <>
                  <Text><Text style={styles.label}>Data:</Text> {tarefaSelecionada.data || '-'}</Text>
                  <Text><Text style={styles.label}>Hora Início:</Text> {tarefaSelecionada.horaInicio || '-'}</Text>
                  <Text><Text style={styles.label}>Término:</Text> {tarefaSelecionada.termino || '-'}</Text>
                  <Text><Text style={styles.label}>Local:</Text> {tarefaSelecionada.local || '-'}</Text>
                  <Text><Text style={styles.label}>Bairro:</Text> {tarefaSelecionada.bairro || '-'}</Text>
                  <Text><Text style={styles.label}>Secretaria:</Text> {tarefaSelecionada.secretaria || '-'}</Text>
                  <Text><Text style={styles.label}>Departamento:</Text> {tarefaSelecionada.departamento || '-'}</Text>
                  <Text><Text style={styles.label}>Responsável Solicitação:</Text> {tarefaSelecionada.responsavelSolicitacao || '-'}</Text>
                  <Text><Text style={styles.label}>Objetivo:</Text> {tarefaSelecionada.objetivo || '-'}</Text>
                  <Text><Text style={styles.label}>Avaliação Técnica:</Text> {tarefaSelecionada.avaliacao || '-'}</Text>
                  <Text><Text style={styles.label}>Responsável Visita:</Text> {tarefaSelecionada.responsavelVisita || '-'}</Text>

                  {tarefaSelecionada.arquivo && (
                    <Image source={{ uri: tarefaSelecionada.arquivo }} style={styles.imagemModal} resizeMode="contain" />
                  )}

                  <View style={styles.modalBtns}>
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: '#0066FF' }]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalBtnTexto}>Fechar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: '#FF7F00' }]}
                      onPress={() => {
                        setModalVisible(false);
                        router.push(`/editarDemanda?id=${tarefaSelecionada.id}`);
                      }}
                    >
                      <Text style={styles.modalBtnTexto}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: '#FF0000' }]}
                      onPress={() => excluirTarefa(tarefaSelecionada.id)}
                    >
                      <Text style={styles.modalBtnTexto}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.barraAzulRodape}></View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ⬇️ MANTÉM OS MESMOS STYLES que você já tinha
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  barraAzulTopo: {
    height: 50,
    backgroundColor: '#0053A0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
  },
  botaoVoltar: {
    padding: 5,
    bottom: -5,
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
  andamentoTexto: {
    fontWeight: 'bold',
    fontSize: 16,
    margin: 10,
    color: '#0066FF',
  },
  colunaStatus: {
    width: width * 0.8,
    marginRight: 16,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
  },
  colunaInício: { backgroundColor: '#FFF8D0' },
  colunaEmAndamento: { backgroundColor: '#D0E8FF' },
  colunaFinalizada: { backgroundColor: '#D0FFD6' },
  colunaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderColor: '#0066FF',
    paddingBottom: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statusBotao: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
  },
  statusSelecionadoInício: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  statusSelecionadoEmAndamento: {
    backgroundColor: '#00B050',
    borderColor: '#00B050',
  },
  statusSelecionadoFinalizada: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  tituloo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  descricao: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 8,
  },
  imagem: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  saberMaisBtn: {
    marginTop: 12,
    backgroundColor: '#0066FF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  saberMaisTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    height: 50,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0066FF',
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  imagemModal: {
    width: width - 80,
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
});
