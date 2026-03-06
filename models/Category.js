import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    link: { type: String }
}, { timestamps: true });

if (mongoose.models.Category) {
    delete mongoose.models.Category;
}
const Category = mongoose.model('Category', CategorySchema);
export default Category;
