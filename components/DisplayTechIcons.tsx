import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { getTechLogos } from '../lib/utils';
import tw from 'twrnc';

type TechIconProps = {
  techStack: string[];
};

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const [icons, setIcons] = useState<{ tech: string; url: string }[]>([]);

  useEffect(() => {
    const fetchIcons = async () => {
      const data = await getTechLogos(techStack);
      setIcons(data);
    };
    fetchIcons();
  }, [techStack]);

  return (
    <View style={tw`flex-row`}>
      {icons.slice(0, 3).map(({ tech, url }, index) => (
        <View
          key={tech}
          style={[
            tw`bg-gray-800 p-2 rounded-full items-center justify-center`,
            index > 0 && { marginLeft: -12 },
          ]}
        >
          <Image
            source={{ uri: url }}
            style={tw`w-5 h-5`}
            resizeMode="contain"
          />
        </View>
      ))}
    </View>
  );
};

export default DisplayTechIcons;
