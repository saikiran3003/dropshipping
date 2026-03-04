import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Dropshipper from "@/models/Dropshipper";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();

        const totalDropshippers = await Dropshipper.countDocuments();
        const totalSubscriptions = await Dropshipper.countDocuments({ subscriptionStatus: 'Added' });
        const totalProducts = await Product.countDocuments();

        return NextResponse.json({
            totalDropshippers,
            totalSubscriptions,
            totalProducts,
            totalOrders: 0,
            totalRevenue: 0,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        });
    } catch (error) {
        console.error("STATS_GET_ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
