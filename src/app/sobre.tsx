import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5, MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegrasDeUso() {
  const rota = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 }}>
      {/* Botão Voltar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <TouchableOpacity onPress={() => rota.push('/adminHome')}>
          <AntDesign name="arrowleft" size={28} color="#0066FF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}>
        {/* Logo centralizada no topo */}
        <Image
          source={require('../../assets/images/Mídia (23).jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título */}
        <Text style={styles.titulo}>Regras de Uso do Sistema</Text>

        {/* Regras */}
        <View style={styles.regrasContainer}>
          <View style={styles.linha}>
            <FontAwesome5 name="user-lock" size={22} color="#0053A0" style={styles.icone} />
            <Text style={styles.texto}>
              <Text style={styles.negrito}>Usuários Comuns:</Text> acessam apenas seu perfil. Só podem ser cadastrados se estiverem pré-aprovados como usuários temporários.
            </Text>
          </View>

          <View style={styles.linha}>
            <Feather name="users" size={22} color="#0053A0" style={styles.icone} />
            <Text style={styles.texto}>
              <Text style={styles.negrito}>Líderes:</Text> gerenciam tarefas, criam e editam demandas e acessam dados dos funcionários sob sua supervisão.
            </Text>
          </View>

          <View style={styles.linha}>
            <MaterialIcons name="admin-panel-settings" size={24} color="#0053A0" style={styles.icone} />
            <Text style={styles.texto}>
              <Text style={styles.negrito}>Administrador Master:</Text> possui acesso total ao sistema, podendo visualizar e alterar qualquer dado.
            </Text>
          </View>

          <View style={styles.linha}>
            <Feather name="file-text" size={22} color="#0053A0" style={styles.icone} />
            <Text style={styles.texto}>
              <Text style={styles.negrito}>Demandas:</Text> são visíveis por responsáveis, líderes envolvidos, administrador ou se estiverem com status "Início".
            </Text>
          </View>

          <View style={styles.linha}>
            <FontAwesome5 name="clipboard-list" size={22} color="#0053A0" style={styles.icone} />
            <Text style={styles.texto}>
              <Text style={styles.negrito}>Tarefas e Cadastros Temporários:</Text> acessíveis por qualquer usuário autenticado.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
    marginTop: 10,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#003399',
  },
  regrasContainer: {
    alignSelf: 'stretch',
    gap: 20,
    paddingHorizontal: 10,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icone: {
    marginTop: 4,
    marginRight: 12,
  },
  texto: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  negrito: {
    fontWeight: 'bold',
  },
});
