import { Platform } from 'react-native';

// Function to get the correct API URL based on platform and environment
export const getApiUrl = () => {
    // For development, use your computer's IP address
    const DEVELOPMENT_IP = "10.12.75.131"; // Your current IP
    const PORT = "5001";

    if (__DEV__) {
        if (Platform.OS === 'android') {
            // Android emulator can use 10.0.2.2 to access host machine
            // But physical device needs the actual IP
            return `http://${DEVELOPMENT_IP}:${PORT}/api`;
        } else if (Platform.OS === 'ios') {
            // iOS simulator can use localhost, but physical device needs IP
            return `http://${DEVELOPMENT_IP}:${PORT}/api`;
        }
    }

    // Production URL (replace with your actual production API)
    return `https://your-production-api.com/api`;
};

// Export the API URL
export const API_URL = getApiUrl();

// Helper function to test API connectivity
export const testApiConnection = async () => {
    try {
        const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('API connection test failed:', error);
        return false;
    }
};