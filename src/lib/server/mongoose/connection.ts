import mongoose from 'mongoose';

if (!import.meta.env.VITE_MONGODB_URI) {
    throw new Error('VITE_MONGODB_URI must be set');
}

let connection: typeof mongoose | null = null;

export const connectDB = async () => {
    try {
        if (!connection) {
            connection = await mongoose.connect(import.meta.env.VITE_MONGODB_URI, {
                dbName: 'dailypp'
            });
            console.log('Mongoose connected successfully to dailypp database');
        }
        return connection;
    } catch (error) {
        console.error('Mongoose connection error:', error);
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('Mongoose disconnected successfully');
    } catch (error) {
        console.error('Mongoose disconnection error:', error);
        throw error;
    }
};