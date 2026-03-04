import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    mrpPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    images: [{ type: String }], // Array of image URLs/paths
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
