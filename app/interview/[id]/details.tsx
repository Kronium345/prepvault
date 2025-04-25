import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { getInterviewById } from 'lib/actions/general.action';
import tw from 'twrnc';
import { getRandomInterviewCover } from 'lib/utils';

export default function InterviewDetails() {
    const { id } = useLocalSearchParams();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInterview() {
            if (id) {
                const interviewData = await getInterviewById(id.toString());
                setInterview(interviewData);
            }
            setLoading(false);
        }

        fetchInterview();
    }, [id]);

    if (loading) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!interview) {
        return <Redirect href="/home" />;
    }

    return (
        <>
            <View style={tw`flex flex-row gap-4 justify-between`}>
                <View style={tw`flex flex-row gap-4 items-center max-sm:flex-col`}>
                    <View style={tw`flex flex-row gap-4 items-center`}>
                        <Image
                            source={{ uri: getRandomInterviewCover() }}
                            alt="interview-cover"
                            width={40}
                            height={40}
                            style={tw`rounded-full object-cover size-[40px]`}
                        />
                    </View>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({});