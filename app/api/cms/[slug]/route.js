import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CMS from "@/models/CMS";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json({ message: "Slug is required" }, { status: 400 });
        }

        const page = await CMS.findOne({ slug });
        if (!page) {
            return NextResponse.json({ message: "Page not found" }, { status: 404 });
        }

        return NextResponse.json(page);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
