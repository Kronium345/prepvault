import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getInterviewByCurrentUser(userId: string): Promise<Interview[] | null> {
    try {
        const session = await AsyncStorage.getItem('session');
        if (!session) throw new Error('No session found');

        const res = await fetch('https://prepvault-1rdj.onrender.com/auth/interview/user', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
            throw new Error(data.message || 'Failed to fetch interviews');
        }

        return data.interviews as Interview[];
    } catch (err) {
        console.error('Failed to fetch user interviews:', err);
        return null;
    }
}


export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    try {
        const session = await AsyncStorage.getItem('session');
        if (!session) return null;

        const { limit } = params;

        const res = await fetch(`https://prepvault-1rdj.onrender.com/auth/interview/latest?limit=${limit}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            console.warn('❌ Failed to fetch latest interviews');
            return null;
        }

        return data.interviews;
    } catch (err) {
        console.error('❌ Error getting latest interviews:', err);
        return null;
    }
}


export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const session = await AsyncStorage.getItem('session');
        if (!session) throw new Error('No session found');

        const res = await fetch(`https://prepvault-1rdj.onrender.com/auth/interview/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
            throw new Error(data.message || 'Failed to fetch interview');
        }

        return data.interview as Interview;
    } catch (err) {
        console.error('Failed to fetch interview by ID:', err);
        return null;
    }
}


