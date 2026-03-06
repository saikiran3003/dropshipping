import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CMS from "@/models/CMS";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { slug, title, content } = body;

        if (!slug || !title || !content) {
            return NextResponse.json({ message: "Slug, Title, and Content are required" }, { status: 400 });
        }

        const newPage = new CMS({ slug, title, content });
        await newPage.save();

        return NextResponse.json({ message: "CMS Page added successfully", data: newPage }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const page = await CMS.findOne({ slug });
            if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
            return NextResponse.json(page);
        }

        const pages = await CMS.find().sort({ createdAt: -1 });
        return NextResponse.json(pages);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, slug, title, content } = body;

        if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });

        const updated = await CMS.findByIdAndUpdate(id, {
            slug, title, content
        }, { new: true });

        return NextResponse.json({ message: "CMS Page updated", data: updated });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });
        await CMS.findByIdAndDelete(id);
        return NextResponse.json({ message: "CMS Page deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
