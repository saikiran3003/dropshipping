import mongoose from 'mongoose';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED - Use Google DNS to resolve MongoDB SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.error("DNS_SET_ERROR:", e);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env'
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
        console.error("DATABASE_ERROR: Missing credentials in .env");
        throw new Error("Check MONGODB_URI in .env");
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            family: 4, // Force IPv4 to avoid DNS SRV issues on Windows/ISP
        };

        console.log("Attempting Database Connection (IPv4 Force)...");
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("SUCCESS: Database synchronized.");
            return mongoose;
        }).catch(err => {
            console.error("CRITICAL_DATABASE_FAILURE:", err.message);
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}

export default dbConnect;
