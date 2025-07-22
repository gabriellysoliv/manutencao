import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AntDesign from '@expo/vector-icons/AntDesign';


const { width } = Dimensions.get('window');

export default function navegation() {
  const rota = useRouter();

  return (
    
    <View style={styles.container}>
      {/* Barra azul topo */}
      <View style={styles.barraAzulTopo} />
            <View style={styles.voltarContainer}>
        <TouchableOpacity onPress={() => rota.push('/')}>
          <AntDesign name="arrowleft" size={28} color="#0066FF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo da equipe */}
        <Image
          source={require('../../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

<View style={styles.bemVindoContainer}>
  <AntDesign name="user" size={48} color="#0053A0" style={styles.icone} />
  <Text style={styles.titulo}>Bem-vindo à Área do Administrador</Text>
  <Text style={styles.subtitulo}>
    Gerencie as solicitações e acompanhe o andamento das tarefas com eficiência.
  </Text>
</View>



        {/* Botão Minhas Tarefas */}
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#007acc' }]}
          onPress={() => rota.push('/tarefas')}
        >
          <EvilIcons name="archive" size={28} color="#fff" />
          <Text style={styles.textoBotao}>Minhas Tarefas</Text>
        </TouchableOpacity>

        {/* Botão Nova Demanda */}
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#1cb84c' }]}
          onPress={() => rota.push('/novaDemanda')}
        >
          <AntDesign name="plus" size={20} color="#fff" />
          <Text style={styles.textoBotao}>Nova Demanda</Text>
        </TouchableOpacity>

        {/* Botão Setores */}
          <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#f26a21' }]}
          onPress={() => rota.push('/demandaUrgente')}
        >
          <AntDesign name="folderopen" size={20} color="#fff" />
          <Text style={styles.textoBotao}>Demandas Urgentes</Text>
        </TouchableOpacity>

        {/* Botão Mensagens */}
       {/* Botão Configurações do Administrador */}
<TouchableOpacity
  style={[styles.botao, { backgroundColor: '#002b56' }]}
  onPress={() => rota.push('/adminHome')}
>
  <AntDesign name="setting" size={28} color="#fff" />
  <Text style={styles.textoBotao}>Configurações do Administrador</Text>
</TouchableOpacity>


        {/* Imagem rodapé */}
        <Image
          source={require('../../assets/images/mdd.png')}
          style={styles.rodape}
          resizeMode="contain"
        />
      </ScrollView>

      {/* Barra azul rodapé */}
      <View style={styles.barraAzulRodape} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 60,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.5,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  botao: {
    flexDirection: 'row',
    width: '80%',
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    paddingLeft: 10,
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  rodape: {
    width: width * 0.4,
    height: 50,
    marginTop: 30,
    marginBottom: 10,
  },
  barraAzulTopo: {
    height: 50,
    width: '100%',
    backgroundColor: '#0048EC',
  },
  barraAzulRodape: {
    height: 50,
    width: '100%',
    backgroundColor: '#0048EC',
  },

subtitulo: {
  fontSize: 14,
  color: '#333',
  marginBottom: 20,
  paddingHorizontal: 20,
  textAlign: 'center'
},
bemVindoContainer: {
  alignItems: 'center',
  marginBottom: 20,
  marginTop: 10,
  paddingHorizontal: 20
},
icone: {
  marginBottom: 10
},
  voltarContainer: {
    marginTop: 10,
    marginLeft: 15,
  },


});

