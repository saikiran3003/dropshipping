import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Dropshipper from "@/models/Dropshipper";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        // Find the dropshipper
        const dropshipper = await Dropshipper.findOne({ email });

        if (!dropshipper) {
            return NextResponse.json({ error: "Partner account not found" }, { status: 401 });
        }

        // Verify password
        if (dropshipper.password !== password) {
            return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
        }

        // Verify status
        if (dropshipper.status !== "Active") {
            return NextResponse.json({
                error: `Account is currently ${dropshipper.status.toLowerCase()}. Please contact administration.`
            }, { status: 403 });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: dropshipper._id,
                email: dropshipper.email,
                role: "dropshipper",
                name: dropshipper.name
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const response = NextResponse.json({
            message: "Success",
            dropshipper: {
                id: dropshipper._id,
                name: dropshipper.name,
                email: dropshipper.email
            }
        });

        // Set cookie
        response.cookies.set("dropshipper_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (err) {
        console.error("Login Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
