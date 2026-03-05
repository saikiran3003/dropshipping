import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    mrpPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    images: [{ type: String }], // Array of image URLs/paths
    bulkPricing: [
        {
            packOf: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    category: { type: String, default: 'Uncategorized' },
    commissionPercentage: { type: Number, default: 20 }
}, { timestamps: true });

if (mongoose.models.Product) {
    delete mongoose.models.Product;
}
const Product = mongoose.model('Product', ProductSchema);
export default Product;
