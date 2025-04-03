import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import Agent from '../../components/Agent';
import tw from 'twrnc';
import { getCurrentUsers } from '../../lib/actions/auth.action';

const Interview = () => {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUsers();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-black`}>
        <Text style={tw`text-white text-lg`}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      <View style={tw`flex-1 mt-12`}>
        <Agent userName={user.name} userId={user.id} type="generate" />
      </View>
    </ScrollView>
  );
};

export default Interview;
