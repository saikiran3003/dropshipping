import mongoose from 'mongoose';

const DropshipperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Pending Approval', 'Inactive'], default: 'Active' },
    state: { type: String, required: true },
    city: { type: String, required: true },
    totalSales: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    subscriptionStatus: { type: String, enum: ['Added', 'Not-added'], default: 'Not-added' },
}, { timestamps: true });

export default mongoose.models.Dropshipper || mongoose.model('Dropshipper', DropshipperSchema);
