import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../app/firebaseConfig';

const { width } = Dimensions.get('window');

export default function DemandasTrabalhador() {
  const [demandas, setDemandas] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selecionada, setSelecionada] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDemandas = async () => {
      try {
        const q = query(
          collection(db, 'demandas'),
          where('status', '==', 'Início'),
          orderBy('createdAt', 'desc') // requer índice no Firestore
        );

        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDemandas(lista);
      } catch (error) {
        console.error('Erro ao buscar demandas:', error);
        Alert.alert('Erro', 'Não foi possível carregar as demandas.');
      }
    };

    fetchDemandas();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/homeTrabalhador')}>
          <AntDesign name="arrowleft" size={28} color="#0066FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Demandas Iniciais</Text>
        <View style={{ width: 28 }} />
      </View>

      {demandas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 16, color: '#555' }}>Nenhuma demanda encontrada.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {demandas.map((demanda) => (
            <View key={demanda.id} style={styles.card}>
              <Text style={styles.titulo}>{demanda.local || 'Sem título'}</Text>
              <Text style={styles.info}>Bairro: {demanda.bairro || '-'}</Text>
              <Text style={styles.info}>Data: {demanda.data || '-'}</Text>
              <Text style={styles.descricao} numberOfLines={2}>
                {demanda.objetivo || '-'}
              </Text>

              {demanda.arquivo ? (
                <Image source={{ uri: demanda.arquivo }} style={styles.imagem} resizeMode="cover" />
              ) : null}

              <TouchableOpacity
                style={styles.btnDetalhes}
                onPress={() => {
                  setSelecionada(demanda);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.btnTexto}>Detalhes</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer} />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {selecionada && (
                <>
                  <Text style={styles.modalTitulo}>Detalhes da Demanda</Text>
                  <Text><Text style={styles.label}>Data:</Text> {selecionada.data || '-'}</Text>
                  <Text><Text style={styles.label}>Hora Início:</Text> {selecionada.horaInicio || '-'}</Text>
                  <Text><Text style={styles.label}>Término:</Text> {selecionada.termino || '-'}</Text>
                  <Text><Text style={styles.label}>Local:</Text> {selecionada.local || '-'}</Text>
                  <Text><Text style={styles.label}>Bairro:</Text> {selecionada.bairro || '-'}</Text>
                  <Text><Text style={styles.label}>Secretaria:</Text> {selecionada.secretaria || '-'}</Text>
                  <Text><Text style={styles.label}>Departamento:</Text> {selecionada.departamento || '-'}</Text>
                  <Text><Text style={styles.label}>Responsável Solicitação:</Text> {selecionada.responsavelSolicitacao || '-'}</Text>
                  <Text><Text style={styles.label}>Objetivo:</Text> {selecionada.objetivo || '-'}</Text>
                  <Text><Text style={styles.label}>Avaliação Técnica:</Text> {selecionada.avaliacao || '-'}</Text>
                  <Text><Text style={styles.label}>Responsável Visita:</Text> {selecionada.responsavelVisita || '-'}</Text>

                  {selecionada.arquivo && (
                    <Image
                      source={{ uri: selecionada.arquivo }}
                      style={styles.imagemModal}
                      resizeMode="contain"
                    />
                  )}

                  <TouchableOpacity
                    style={styles.btnFechar}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.btnTexto}>Fechar</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { height: 50, backgroundColor: '#0066FF' },
  footer: {
    height: 40,
    backgroundColor: '#0066FF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitulo: { fontSize: 18,
     fontWeight: 'bold',
      color: '#0066FF',
      marginTop:30,
     },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  titulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#333' },
  info: { fontSize: 14, color: '#555' },
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
  btnDetalhes: {
    marginTop: 12,
    backgroundColor: '#0066FF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnFechar: {
    backgroundColor: '#0066FF',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  btnTexto: { color: '#fff', fontWeight: 'bold' },
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
  label: { fontWeight: 'bold', color: '#333' },
  imagemModal: {
    width: width - 80,
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
