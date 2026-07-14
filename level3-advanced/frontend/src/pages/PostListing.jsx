import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function PostListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'books',
    item_condition: 'used'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Release the previous preview URL before creating a new one — object
    // URLs otherwise stay allocated in memory for the lifetime of the page.
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.createListing({ ...form, price: parseFloat(form.price) }, imageFile);
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
          <label htmlFor="image">Photo (optional, max 5MB)</label>
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
        </div>

        <button type="submit" disabled={submitting}>{submitting ? 'Posting...' : 'Post Listing'}</button>
        {success && <p className="form-message success">{success}</p>}
        {error && <p className="form-message error">{error}</p>}
      </form>
    </section>
  );
}
