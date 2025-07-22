import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

export default function AdminHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>

      </View>

      {/* Navigation Bar com botão Voltar */}
       <View style={styles.voltarContainer}>
     <TouchableOpacity onPress={() => router.push('/navegation')}>
       <AntDesign name="arrowleft" size={28} color="#0066FF" />
     </TouchableOpacity>
   </View>

      {/* Título Principal */}
      
      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>Área do Administrador</Text>
      </View>
      <Text style={styles.subtitulo}>
  Nesta área, o administrador master pode visualizar todas as demandas finalizadas, gerenciar relatórios e acompanhar o andamento geral das tarefas realizadas pelos líderes.
</Text>

      {/* Conteúdo - Botões */}
      <View style={styles.content}>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/gerenciarUsers')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="users" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Gerenciar Usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/relatorio')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="insert-chart" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Relatório</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/historico')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="folder" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Histórico de Demandas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/sobre')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="settings" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Sobre o App</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF8F3', // bege claro
  },
  header: {
    height: 50,
    backgroundColor: '#0066FF', // azul prefeitura
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },


  navBar: {
    height: 40,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00000', // marrom escuro
    textAlign: 'center',
    marginVertical: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#0048EC', // marrom escuro
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 50,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',

  },
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
    voltarContainer: {
  marginTop: 10,
  marginLeft: 15,
},
subtitulo: {
  fontSize: 14,
  color: '#555',
  textAlign: 'center',
  marginHorizontal: 20,
  marginTop: 8,
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

});
