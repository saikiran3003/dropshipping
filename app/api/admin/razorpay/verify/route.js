import crypto from "crypto";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import dbConnect from "@/lib/db";
import Dropshipper from "@/models/Dropshipper";

export async function POST(req) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dropshipperData } = await req.json();

        // 1. Signature Verification
        const hmacBody = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(hmacBody.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
        }

        // 2. Perform Dropshipper Creation & Database Work Parallelly (where possible)
        await dbConnect();

        // Create the record
        const newDs = new Dropshipper({
            ...dropshipperData,
            subscriptionStatus: "Added",
            status: "Active",
            paymentId: razorpay_payment_id
        });

        // 3. Save Receipt and Database Record
        const receiptsDir = path.join(process.cwd(), 'receipts');
        if (!fs.existsSync(receiptsDir)) {
            fs.mkdirSync(receiptsDir);
        }

        const receipt = {
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
            verified_at: new Date().toISOString()
        };

        const fileName = `receipt_${razorpay_payment_id}.json`;

        // Save to DB and FS (Parallel)
        await Promise.all([
            newDs.save(),
            fs.promises.writeFile(path.join(receiptsDir, fileName), JSON.stringify(receipt, null, 2))
        ]);

        return NextResponse.json({
            success: true,
            message: "Verified and Registered",
            payment_id: razorpay_payment_id,
            data: newDs
        });

    } catch (error) {
        console.error("Consolidated Verification Error:", error);
        return NextResponse.json({ error: "Operation failed", message: error.message }, { status: 500 });
    }
}
