import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi, getImageUrl } from "../utils/adminApi";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    brand: "",
    is_active: true,
    sizes: "",
    colors: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await adminApi.products.getById(id);
      const product = response.data.data;
      if (product) {
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          stock: product.stock || "",
          brand: product.brand || "",
          is_active: product.is_active !== undefined ? product.is_active : true,
          sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
          colors: Array.isArray(product.colors)
            ? product.colors.join(", ")
            : "",
        });
        // Set existing images for edit mode
        if (Array.isArray(product.images) && product.images.length > 0) {
          setExistingImages(product.images);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load product. Please ensure the backend API is running.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Generate preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append form fields
      Object.keys(formData).forEach((key) => {
        if (key === "is_active") {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image files
      selectedFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // For edit mode, indicate if we should keep existing images
      if (isEdit && existingImages.length > 0) {
        formDataToSend.append("keepExistingImages", "true");
      }

      if (isEdit) {
        await adminApi.products.update(id, formDataToSend);
      } else {
        await adminApi.products.create(formDataToSend);
      }

      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? "Edit Product" : "Add New Product"}</h1>
        <button
          onClick={() => navigate("/products")}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h3>Basic Information</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price (৳) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Quantity *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="is_active" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>Active Product</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h3>Product Variants</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="sizes">Sizes (comma-separated)</label>
              <input
                type="text"
                id="sizes"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., 38, 39, 40, 41, 42"
              />
              <small className="form-help">
                Enter sizes separated by commas
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="colors">Colors (comma-separated)</label>
              <input
                type="text"
                id="colors"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Black, White, Blue, Red"
              />
              <small className="form-help">
                Enter colors separated by commas
              </small>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h3>Product Images</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="images">Upload Images</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                className="form-control"
                accept="image/*"
                multiple
              />
              <small className="form-help">
                Select multiple images (Max 10, 5MB each). Supported formats:
                JPG, PNG, GIF, WebP
              </small>
            </div>

            {/* Preview existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="image-preview-container">
                <h4>Existing Images</h4>
                <div className="image-preview-grid">
                  {existingImages.map((image, index) => (
                    <div
                      key={`existing-${index}`}
                      className="image-preview-item"
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Existing ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview new images */}
            {previewUrls.length > 0 && (
              <div className="image-preview-container">
                <h4>New Images to Upload</h4>
                <div className="image-preview-grid">
                  {previewUrls.map((url, index) => (
                    <div key={`new-${index}`} className="image-preview-item">
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index, false)}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? "Saving..."
              : isEdit
                ? "Update Product"
                : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
