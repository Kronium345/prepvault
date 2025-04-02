import React from 'react';
import { View, ScrollView } from 'react-native';
import Agent from '../../components/Agent';
import tw from 'twrnc';
import { getCurrentUsers } from '../../lib/actions/auth.action';

const Interview = async () => {
  const user = await getCurrentUsers();
  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      <View style={tw`flex-1 mt-12`}>
        <Agent userName={user?.name} userId={user?.id} type="generate" />
      </View>
    </ScrollView>
  );
};

export default Interview;
