import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ContagemMes {
  mesAno: string;
  total: number;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Historico() {
  const router = useRouter();
  const [contagemMeses, setContagemMeses] = useState<ContagemMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarTarefasFinalizadas();
  }, []);

  async function buscarTarefasFinalizadas() {
    setLoading(true);
    try {
      const q = query(collection(db, 'demandas'), where('status', '==', 'Finalizada'));
      const snapshot = await getDocs(q);

      const agrupamento: Record<string, number> = {};

      snapshot.forEach(docSnap => {
        const dados = docSnap.data();
        const createdAt = dados.createdAt;

        let data;
        if (createdAt?.toDate) {
          data = createdAt.toDate();
        } else {
          data = new Date(createdAt);
        }

        if (!data || isNaN(data.getTime())) return;

        const mesAno = `${meses[data.getMonth()]}/${data.getFullYear()}`;
        agrupamento[mesAno] = (agrupamento[mesAno] || 0) + 1;
      });

      const resultado = Object.entries(agrupamento).map(([mesAno, total]) => ({ mesAno, total }));

      resultado.sort((a, b) => {
        const [mesA, anoA] = a.mesAno.split('/');
        const [mesB, anoB] = b.mesAno.split('/');
        const dataA = new Date(parseInt(anoA), meses.indexOf(mesA));
        const dataB = new Date(parseInt(anoB), meses.indexOf(mesB));
        return dataB.getTime() - dataA.getTime();
      });

      setContagemMeses(resultado);
    } catch (error) {
      console.error('Erro ao buscar tarefas finalizadas:', error);
      alert('Erro ao carregar histórico');
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (contagemMeses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Nenhuma tarefa finalizada encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header azul fixo */}
      <View style={styles.header} />

      {/* Botão voltar abaixo do header */}
      <View style={styles.voltarContainer}>
        <TouchableOpacity onPress={() => router.push('/adminHome')}>
          <AntDesign name="arrowleft" size={25} color="#ffffffff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Histórico de Tarefas Finalizadas</Text>

      <FlatList
        data={contagemMeses}
        keyExtractor={item => item.mesAno}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.mesAno}>{item.mesAno}</Text>
            <Text style={styles.total}>
              {item.total} tarefa{item.total > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      />

      {/* Footer azul fixo */}
      <View style={styles.footer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#003366',
    height: 50,
    width: '100%',
  },

  voltarContainer: {
    marginTop: -30,
    marginLeft: 19,
    
  },

  title: {
    fontSize: 19,
    marginTop:20,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 10,
    marginBottom: 9,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
     marginTop:20,
  },

  mesAno: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FCF8F3',
  },

  total: {
    fontSize: 16,
    color: '#FCF8F3',
    marginTop: 6,
  },

  footer: {
    height: 50,
    backgroundColor: '#003366',
    width: '100%',
    marginTop: 10,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
