import React from 'react';
import { View, ScrollView } from 'react-native';
import Agent from '../../components/Agent';
import tw from 'twrnc';

const Interview = () => {
  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      <View style={tw`flex-1 mt-12`}>
        <Agent userName="You" userId="user1" type="generate" />
      </View>
    </ScrollView>
  );
};

export default Interview;
