import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            // Save receipt to a folder
            const fs = require('fs');
            const path = require('path');
            const receipt = {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
                signature: razorpay_signature,
                verified_at: new Date().toISOString()
            };

            const receiptsDir = path.join(process.cwd(), 'receipts');
            if (!fs.existsSync(receiptsDir)) {
                fs.mkdirSync(receiptsDir);
            }

            const fileName = `receipt_${razorpay_payment_id}.json`;
            fs.writeFileSync(path.join(receiptsDir, fileName), JSON.stringify(receipt, null, 2));

            return NextResponse.json({
                success: true,
                message: "Payment verified and receipt saved",
                payment_id: razorpay_payment_id
            });
        } else {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
        }
    } catch (error) {
        console.error("Signature verification error:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
