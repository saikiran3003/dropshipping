import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Dropshipper from "@/models/Dropshipper";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();

        const totalDropshippers = await Dropshipper.countDocuments();
        const pendingDropshippers = await Dropshipper.countDocuments({ status: 'Pending Approval' });

        // You can add more counts as you develop other models (Products, Orders etc.)
        // For now returning zeros for those as placeholders

        return NextResponse.json({
            totalDropshippers,
            pendingDropshippers,
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingPayments: 0
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
