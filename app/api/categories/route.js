import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find().sort({ name: 1 }).lean();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("CATEGORY GET ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ message: "Category name is required" }, { status: 400 });
        }

        const normalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

        const existing = await Category.findOne({ name: normalizedName });
        if (existing) {
            return NextResponse.json({ message: "Category already exists" }, { status: 400 });
        }

        const newCategory = new Category({ name: normalizedName });
        await newCategory.save();

        return NextResponse.json({ message: "Category added successfully", data: newCategory }, { status: 201 });
    } catch (error) {
        console.error("CATEGORY POST ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const { oldName, newName } = await req.json();

        if (!oldName || !newName) {
            return NextResponse.json({ message: "Old and new names are required" }, { status: 400 });
        }

        const normalizedNewName = newName.trim().charAt(0).toUpperCase() + newName.trim().slice(1).toLowerCase();

        // Update Category document
        const updatedCategory = await Category.findOneAndUpdate(
            { name: oldName },
            { name: normalizedNewName },
            { new: true }
        );

        if (!updatedCategory) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        // Update all products with this category
        await Product.updateMany({ category: oldName }, { category: normalizedNewName });

        return NextResponse.json({ message: "Category updated successfully", data: updatedCategory });
    } catch (error) {
        console.error("CATEGORY PUT ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ message: "Category name missing" }, { status: 400 });
        }

        const deletedCategory = await Category.findOneAndDelete({ name });
        if (!deletedCategory) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        // Optionally update products to "Uncategorized"
        await Product.updateMany({ category: name }, { category: "Uncategorized" });

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("CATEGORY DELETE ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
