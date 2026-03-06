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
    subscriptionPlan: { type: String, default: 'Free' },
    subscriptionExpiry: { type: Date },
    profileDetails: {
        panNumber: { type: String },
        bankAccount: { type: String },
        ifscCode: { type: String },
        upiId: { type: String }
    },
    password: { type: String, default: '' },
}, { timestamps: true });

if (mongoose.models.Dropshipper) {
    delete mongoose.models.Dropshipper;
}
const Dropshipper = mongoose.model('Dropshipper', DropshipperSchema);
export default Dropshipper;
