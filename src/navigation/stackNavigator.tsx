import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import login from '../app/index';
import home from '../app/home';
import tarefas from '../app/tarefas';
import detalhesTarefa from '../app/detalhesTarefa';
import novaDemanda from '../app/novaDemanda';
import setores from '../app/setores';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={login} />
      <Stack.Screen name="Home" component={home} />
      <Stack.Screen name="Tarefas" component={tarefas} />
      <Stack.Screen name="DetalhesTarefa" component={detalhesTarefa} />
      <Stack.Screen name="NovaDemanda" component={novaDemanda} />
      <Stack.Screen name="Setores" component={setores} />
    </Stack.Navigator>
  );
}
