import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { getInterviewById } from 'lib/actions/general.action';
import tw from 'twrnc';
import { getRandomInterviewCover } from 'lib/utils';
import DisplayTechIcons from 'components/DisplayTechIcons';
import Agent from 'components/Agent';
import { getCurrentUsers } from 'lib/actions/auth.action';

export default function InterviewDetails() {
    const { id } = useLocalSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (id) {
                const interviewData = await getInterviewById(id.toString());
                setInterview(interviewData);
                const currentUser = await getCurrentUsers();
                setUser(currentUser);
            }
            setLoading(false);
        }

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-black`}>
                <Text style={tw`text-white`}>Loading...</Text>
            </View>
        );
    }

    if (!interview) {
        return <Redirect href="/home" />;
    }

    return (
        <View style={tw`flex-1 bg-black p-4`}>
            <View style={tw`flex flex-row gap-4 justify-between`}>
                <View style={tw`flex flex-row gap-4 items-center max-sm:flex-col`}>
                    <View style={tw`flex flex-row gap-4 items-center`}>
                        <Image
                            source={{ uri: getRandomInterviewCover() }}
                            style={tw`rounded-full object-cover size-[40px] w-[40px] h-[40px]`}
                        />
                        <View>
                            <Text style={tw`text-white font-bold text-lg`}>{interview.role} Interview</Text>
                            <Text style={tw`text-gray-400 text-sm`}>{interview.level}</Text>
                            <DisplayTechIcons techStack={interview.techstack} />
                        </View>
                    </View>
                </View>
            </View>

            <View style={tw`mt-6`}>
                <Text style={tw`text-white text-xl font-bold mb-4 capitalize`}>{interview.type}</Text>
            </View>

            <Agent
                userName={user?.name}
                userId={user?.id}
                type="interview"
                role={interview.role}
                level={interview.level}
                techstack={interview.techstack.join(', ')}
            />
        </View>
    );
}

const styles = StyleSheet.create({});