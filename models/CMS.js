import mongoose from 'mongoose';

const CMSSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true }, // e.g., 'about-us', 'privacy-policy'
    title: { type: String, required: true },
    content: { type: String, required: true }, // Markdown or HTML content
    lastUpdatedBy: { type: String }
}, { timestamps: true });

if (mongoose.models.CMS) {
    delete mongoose.models.CMS;
}
const CMS = mongoose.model('CMS', CMSSchema);
export default CMS;
