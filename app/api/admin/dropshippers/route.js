import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Dropshipper from "@/models/Dropshipper";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, email, mobile, status, state, city, subscriptionStatus, paymentId, password } = body;

        if (!name || !email || !mobile || !state || !city) {
            return NextResponse.json({ message: "Name, Email, Mobile, State, and City are required." }, { status: 400 });
        }

        const existing = await Dropshipper.findOne({ email });
        if (existing) return NextResponse.json({ message: "Email already registered" }, { status: 409 });

        // Force 'Added' if it's a paid registration, otherwise use the provided status or default
        const finalSubscriptionStatus = (subscriptionStatus && subscriptionStatus.toString().toLowerCase() === "added") ? "Added" : "Not-added";

        const newDs = new Dropshipper({
            name,
            email,
            mobile,
            status: status || 'Active',
            state,
            city,
            subscriptionStatus: finalSubscriptionStatus,
            paymentId: paymentId || null,
            password: password || ''
        });

        await newDs.save();
        return NextResponse.json({ message: "Registered", data: newDs }, { status: 201 });
    } catch (error) {
        console.error("DROPSHIPPER POST ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const data = await Dropshipper.find().sort({ createdAt: -1 }).lean();

        // Ensure data is always an array
        const result = Array.isArray(data) ? data : [];

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error("API_GET_EXCEPTION:", {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, name, email, mobile, status, state, city, subscriptionStatus, password } = body;
        if (!id) return NextResponse.json({ message: "ID missing" }, { status: 400 });

        const updated = await Dropshipper.findByIdAndUpdate(
            id,
            { name, email, mobile, status, state, city, subscriptionStatus, password },
            { new: true, runValidators: true }
        ).lean();

        if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Updated", data: updated });
    } catch (error) {
        console.error("DROPSHIPPER PUT ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID missing" }, { status: 400 });

        const deleted = await Dropshipper.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
