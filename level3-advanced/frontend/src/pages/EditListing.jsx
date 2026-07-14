import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, ASSET_BASE } from '../api/client';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${ASSET_BASE}${imageUrl}`;
}

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null); // null until loaded
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getListingById(id)
      .then((res) => {
        const listing = res.data;
        setForm({
          title: listing.title,
          description: listing.description || '',
          price: listing.price,
          category: listing.category,
          item_condition: listing.item_condition
        });
        setImagePreview(resolveImageUrl(listing.image_url));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Release the previous blob preview URL if there was one — calling this
    // on the initial server-provided image URL (not a blob: URL) is a safe
    // no-op, so this guard doesn't need to distinguish between the two.
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.updateListing(id, { ...form, price: parseFloat(form.price) }, imageFile);
      setSuccess('Listing updated successfully!');
      setTimeout(() => navigate(`/listings/${id}`), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="loading container">Loading listing...</p>;
  if (error && !form) return <p className="empty-state container">{error}</p>;
  if (!form) return null;

  return (
    <section className="post-listing container">
      <h2>Edit Listing</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} />
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
          <label htmlFor="image">Photo (leave blank to keep current photo)</label>
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
        </div>

        <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
        {success && <p className="form-message success">{success}</p>}
        {error && <p className="form-message error">{error}</p>}
      </form>
    </section>
  );
}
