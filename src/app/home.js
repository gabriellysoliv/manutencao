export default function Home({ navigation, route }) {
  const tipoUsuario = route?.params?.tipoUsuario || 'funcionario';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {tipoUsuario === 'admin' ? 'Administrador' : 'Funcionário'}</Text>

      <TouchableOpacity style={styles.buttonAzul} onPress={() => navigation.navigate('Tarefas')}>
        <Text style={styles.buttonText}>Minhas Tarefas</Text>
      </TouchableOpacity>

      {tipoUsuario === 'admin' && (
        <>
          <TouchableOpacity style={styles.buttonVerde} onPress={() => navigation.navigate('NovaDemanda')}>
            <Text style={styles.buttonText}>Nova Demanda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonLaranja} onPress={() => navigation.navigate('Setores')}>
            <Text style={styles.buttonText}>Setores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonAzulEscuro}>
            <Text style={styles.buttonText}>Mensagens</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
