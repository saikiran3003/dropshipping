import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CMS from "@/models/CMS";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();
        const pages = await CMS.find({}, "title slug").sort({ createdAt: -1 });
        return NextResponse.json(pages);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
