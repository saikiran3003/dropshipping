import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// Helper to upload images to Cloudinary (Base64)
async function uploadToCloudinary(base64Images) {
    if (!base64Images || base64Images.length === 0) return [];

    const uploadPromises = base64Images.map(img => {
        // If it's already a full URL (existing image), don't re-upload
        if (img.startsWith('http')) return Promise.resolve(img);

        return cloudinary.uploader.upload(img, {
            folder: "products",
            resource_type: "auto"
        }).then(result => result.secure_url);
    });

    return Promise.all(uploadPromises);
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, description, mrpPrice, salePrice, images, bulkPricing, category } = body;

        if (!name || !description || !mrpPrice || !salePrice) {
            return NextResponse.json({ message: "Name, Description, MRP Price, and Sale Price are required." }, { status: 400 });
        }

        // Upload to Cloudinary
        const cloudinaryUrls = await uploadToCloudinary(images);

        const newProduct = new Product({
            name,
            description,
            mrpPrice,
            salePrice,
            images: cloudinaryUrls,
            bulkPricing: bulkPricing || [],
            category: category || 'Uncategorized'
        });

        await newProduct.save();
        return NextResponse.json({ message: "Product added successfully", data: newProduct }, { status: 201 });
    } catch (error) {
        console.error("PRODUCT POST ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const products = await Product.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json(products);
    } catch (error) {
        console.error("PRODUCT GET ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, name, description, mrpPrice, salePrice, images, bulkPricing, category } = body;

        if (!id) return NextResponse.json({ message: "Product ID is missing" }, { status: 400 });

        // Upload new images to Cloudinary if any (or keep existing URLs)
        const cloudinaryUrls = await uploadToCloudinary(images);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { name, description, mrpPrice, salePrice, images: cloudinaryUrls, bulkPricing: bulkPricing || [], category },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedProduct) return NextResponse.json({ message: "Product not found" }, { status: 404 });
        return NextResponse.json({ message: "Product updated successfully", data: updatedProduct });
    } catch (error) {
        console.error("PRODUCT PUT ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "Product ID missing" }, { status: 400 });

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("PRODUCT DELETE ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
