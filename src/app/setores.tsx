import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function Setores() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header} />

      {/* Título centralizado */}
      <View style={styles.tituloContainer}>
        <Text style={styles.title}>SETORES</Text>
      </View>

      {/* Conteúdo com setores */}
      <ScrollView contentContainerStyle={styles.setoresContainer}>
        <TouchableOpacity style={[styles.setor, { backgroundColor: '#ffc107' }]}>
          <Text style={styles.setorTexto}>Elétrica</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.setor, { backgroundColor: '#28a745' }]}>
          <Text style={styles.setorTexto}>Hidráulica</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.setor, { backgroundColor: '#007bff' }]}>
          <Text style={styles.setorTexto}>Pintura</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.setor, { backgroundColor: '#fd7e14' }]}>
          <Text style={styles.setorTexto}>Obras Civis</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botão e rodapé */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.botaoTexto}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    backgroundColor: '#0048EC',
  },
  tituloContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0048EC',
  },
  setoresContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  setor: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  setorTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#0048EC',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botao: {
    backgroundColor: '#003f7d',
    padding: 14,
    borderRadius: 8,
    width: '90%',
  },
  botaoTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
