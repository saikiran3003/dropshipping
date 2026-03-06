import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Banner from "@/models/Banner";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

async function uploadToCloudinary(base64Image) {
    if (!base64Image || base64Image.startsWith('http')) return base64Image;
    const result = await cloudinary.uploader.upload(base64Image, {
        folder: "banners",
        resource_type: "auto"
    });
    return result.secure_url;
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { imageUrl, link, title, description, bannerType } = body;

        if (!imageUrl) return NextResponse.json({ message: "Image is required" }, { status: 400 });

        const lastBanner = await Banner.findOne().sort({ order: -1 });
        const nextOrder = lastBanner ? (lastBanner.order || 0) + 1 : 1;

        const url = await uploadToCloudinary(imageUrl);
        const newBanner = new Banner({ imageUrl: url, link, title, description, bannerType, order: nextOrder });
        await newBanner.save();

        return NextResponse.json({ message: "Banner added successfully", data: newBanner }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const { id, direction } = await req.json();

        const banner = await Banner.findById(id);
        if (!banner) return NextResponse.json({ message: "Banner not found" }, { status: 404 });

        let otherBanner;
        if (direction === 'up') {
            otherBanner = await Banner.findOne({ order: { $lt: banner.order } }).sort({ order: -1 });
        } else {
            otherBanner = await Banner.findOne({ order: { $gt: banner.order } }).sort({ order: 1 });
        }

        if (otherBanner) {
            const tempOrder = banner.order;
            banner.order = otherBanner.order;
            otherBanner.order = tempOrder;
            await Promise.all([banner.save(), otherBanner.save()]);
        }

        return NextResponse.json({ message: "Order updated" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
        return NextResponse.json(banners);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, imageUrl, link, title, description, bannerType, isActive, order } = body;

        if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });

        const url = await uploadToCloudinary(imageUrl);
        const updated = await Banner.findByIdAndUpdate(id, {
            imageUrl: url, link, title, description, bannerType, isActive, order
        }, { new: true });

        return NextResponse.json({ message: "Banner updated", data: updated });
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
        await Banner.findByIdAndDelete(id);
        return NextResponse.json({ message: "Banner deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
