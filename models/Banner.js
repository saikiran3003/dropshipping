import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    link: { type: String },
    title: { type: String },
    description: { type: String },
    bannerType: { type: String, enum: ['big', 'small'], default: 'big' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

if (mongoose.models.Banner) {
    delete mongoose.models.Banner;
}
const Banner = mongoose.model('Banner', BannerSchema);
export default Banner;
