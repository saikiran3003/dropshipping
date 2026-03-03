import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        await dbConnect();
        const { username, password } = await req.json();

        if (!username || !password) {
            return Response.json({ message: "Username and password are required" }, { status: 400 });
        }

        // For initial setup: create the default admin if none exists
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            await Admin.create({ username: "admin", password: "admin123" });
        }

        const admin = await Admin.findOne({ username });

        if (!admin) {
            return Response.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // Comparing plain text as per request "db lo admin123 store avali"
        const isMatch = password === admin.password;

        if (!isMatch) {
            return Response.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const cookieStore = await cookies();
        cookieStore.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            // Removed maxAge to make it a Session Cookie (logouts when browser closes)
        });

        return Response.json({ message: "Login successful" });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return Response.json({ message: error.message || "Something went wrong" }, { status: 500 });
    }
}
