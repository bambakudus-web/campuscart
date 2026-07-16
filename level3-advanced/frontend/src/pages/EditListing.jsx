import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, ASSET_BASE } from '../api/client';
import ImageUploader from '../components/ImageUploader';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${ASSET_BASE}${imageUrl}`;
}

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null); // null until loaded
  const [currentImage, setCurrentImage] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
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
          custom_category: listing.custom_category || '',
          item_condition: listing.item_condition
        });
        setCurrentImage(resolveImageUrl(listing.image_url));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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
      await api.updateListing(id, { ...form, price: parseFloat(form.price) }, imageFiles, coverIndex);
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
          <label>Photos</label>
          <ImageUploader
            onFilesChange={setImageFiles}
            onCoverIndexChange={setCoverIndex}
            max={5}
            existingPreview={currentImage}
          />
        </div>

        <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
        {success && <p className="form-message success">{success}</p>}
        {error && <p className="form-message error">{error}</p>}
      </form>
    </section>
  );
}
