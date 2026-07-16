import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import ImageUploader from '../components/ImageUploader';

export default function PostListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'books',
    custom_category: '',
    item_condition: 'used'
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.category === 'other' && !form.custom_category.trim()) {
      setError('Please type a category name.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createListing({ ...form, price: parseFloat(form.price) }, imageFiles, coverIndex);
      setSuccess('Listing posted successfully!');
      setTimeout(() => navigate('/my-listings'), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="post-listing container">
      <h2>Post a Listing</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Engineering Mathematics Textbook" required />
        </div>

        <div className="form-row">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Condition details, edition, etc." />
        </div>

        <div className="form-row form-row-split">
          <div>
            <label htmlFor="price">Price (GHS)</label>
            <input id="price" name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {form.category === 'other' && (
          <div className="form-row">
            <label htmlFor="custom_category">Category name</label>
            <input
              id="custom_category"
              name="custom_category"
              value={form.custom_category}
              onChange={handleChange}
              placeholder="e.g. Kitchenware, Sports Gear, Stationery"
              maxLength={60}
              required
            />
          </div>
        )}

        <div className="form-row">
          <label htmlFor="item_condition">Condition</label>
          <select id="item_condition" name="item_condition" value={form.item_condition} onChange={handleChange}>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="used">Used</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div className="form-row">
          <label>Photos (optional)</label>
          <ImageUploader
            onFilesChange={setImageFiles}
            onCoverIndexChange={setCoverIndex}
            max={5}
          />
        </div>

        <button type="submit" disabled={submitting}>{submitting ? 'Posting...' : 'Post Listing'}</button>
        {success && <p className="form-message success">{success}</p>}
        {error && <p className="form-message error">{error}</p>}
      </form>
    </section>
  );
}
