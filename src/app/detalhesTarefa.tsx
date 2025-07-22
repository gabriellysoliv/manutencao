import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function DetalhesTarefa() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity onPress={() => router.push('/navegation')} style={styles.voltarBtn}>
        <Text style={styles.voltarTexto}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>SOLICITAÇÃO DA DEMANDA</Text>

      {/* Caixa com detalhes da tarefa */}
      <View style={styles.card}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusInicio}>INÍCIO</Text>
          <Text style={styles.statusAndamento}>EM ANDAMENTO</Text>
          <Text style={styles.statusFinalizada}>FINALIZADA</Text>
        </View>

        <Text style={styles.item}><Text style={styles.label}>Data:</Text> 24/04/2024</Text>
        <Text style={styles.item}><Text style={styles.label}>Hora inicial:</Text> 10:00</Text>
        <Text style={styles.item}><Text style={styles.label}>Término:</Text> 11:30</Text>
        <Text style={styles.item}><Text style={styles.label}>Local:</Text> Praça das Flores</Text>
        <Text style={styles.item}><Text style={styles.label}>Responsável:</Text> Scbras</Text>
        <Text style={styles.item}><Text style={styles.label}>Solicitante:</Text> Paulo</Text>
        <Text style={styles.item}><Text style={styles.label}>Objetivo:</Text> Reparo de pavimento</Text>
        <Text style={styles.item}><Text style={styles.label}>Atividades:</Text> Reposição de obras</Text>
      </View>

      {/* Outros campos */}
      <Text style={styles.section}>Adicionar Foto:</Text>
      <Text style={styles.checkText}>[  ] SIM   [X] NÃO</Text>

      <Text style={styles.section}>Responsável pela visita:</Text>
      <TextInput style={styles.input} placeholder="Nome do responsável" />

      <Text style={styles.section}>Assinatura:</Text>
      <TextInput style={styles.input} placeholder="Assinatura digital ou nome" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  voltarBtn: {
    marginBottom: 10,
  },
  voltarTexto: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: 'bold',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#FF7F00',
  },

  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  item: {
    marginBottom: 8,
    fontSize: 15,
  },
  label: {
    fontWeight: 'bold',
    color: '#444',
  },

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statusInicio: {
    backgroundColor: '#007bff',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 5,
    borderRadius: 20,
    fontSize: 13,
  },
  statusAndamento: {
    backgroundColor: '#ffc107',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 5,
    borderRadius: 20,
    fontSize: 13,
  },
  statusFinalizada: {
    backgroundColor: '#28a745',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 13,
  },

  section: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0077CC',
  },

  checkText: {
    marginVertical: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
});
