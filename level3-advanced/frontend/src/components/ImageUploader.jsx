import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Lets the seller pick up to `max` photos, pick which one is the cover
// (shown on cards/browse), and remove any of them before submitting.
// Reports the raw File[] and the chosen cover index back to the parent
// form on every change — the parent just reads those two values on submit.
export default function ImageUploader({ onFilesChange, onCoverIndexChange, max = 5, existingPreview = null }) {
  const [items, setItems] = useState([]); // [{ id, file, previewUrl }]
  const [coverIndex, setCoverIndex] = useState(0);
  const [warning, setWarning] = useState('');
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    onFilesChange(items.map((i) => i.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    onCoverIndexChange(coverIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverIndex]);

  // Revoke every preview's object URL when the component goes away, so we
  // don't leak memory across the session.
  useEffect(() => {
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.previewUrl));
  }, []);

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const room = max - items.length;
    setWarning(selected.length > room ? `You can upload up to ${max} photos total — added the first ${room}.` : '');

    const toAdd = selected.slice(0, room).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setItems((prev) => [...prev, ...toAdd]);
    e.target.value = ''; // lets the same file be re-picked later if removed
  }

  function removeItem(id) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;

    URL.revokeObjectURL(items[idx].previewUrl);
    setItems((prev) => prev.filter((i) => i.id !== id));

    setCoverIndex((ci) => {
      if (idx === ci) return 0;
      if (idx < ci) return ci - 1;
      return ci;
    });
  }

  return (
    <div className="image-uploader">
      {items.length === 0 && existingPreview && (
        <div className="image-uploader-existing">
          <img src={existingPreview} alt="Current cover" className="image-preview" />
          <p className="form-hint">Current photo shown above. Pick new photos below to replace all of them (up to {max}).</p>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        disabled={items.length >= max}
      />
      <p className="form-hint">Up to {max} photos, 5MB each. Click a thumbnail to set it as the cover photo.</p>
      {warning && <p className="form-message error">{warning}</p>}

      {items.length > 0 && (
        <div className="image-uploader-grid">
          {items.map((item, index) => (
            <div key={item.id} className={`image-uploader-thumb ${index === coverIndex ? 'is-cover' : ''}`}>
              <img src={item.previewUrl} alt={`Photo ${index + 1}`} />
              {index === coverIndex ? (
                <span className="image-uploader-cover-badge">Cover</span>
              ) : (
                <button type="button" className="image-uploader-set-cover" onClick={() => setCoverIndex(index)}>
                  Set as cover
                </button>
              )}
              <button
                type="button"
                className="image-uploader-remove"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove photo ${index + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
