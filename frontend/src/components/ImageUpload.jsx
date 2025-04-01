import { useState } from 'react';
import { FaUpload, FaSpinner, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ImageUpload = ({ 
  initialImage, 
  onImageUpload, 
  onImageRemove,
  label = 'Upload Image',
  maxSizeMB = 5,
  className = ''
}) => {
  const [imagePreview, setImagePreview] = useState(initialImage || '');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (!file) return;
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must not exceed ${maxSizeMB}MB`);
      return;
    }
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Only JPG, PNG, and GIF files are allowed');
      return;
    }
    
    setImageFile(file);
    
    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload the image
    handleUpload(file);
  };
  
  // Handle image upload
  const handleUpload = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
      
      const data = await response.json();
      
      // Call the parent callback with the image URL
      onImageUpload(data.imageUrl);
    } catch (err) {
      setError(err.message || 'Image upload failed');
      setImagePreview('');
      setImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle image removal
  const handleRemove = () => {
    setImagePreview('');
    setImageFile(null);
    setError('');
    onImageRemove();
  };
  
  return (
    <div className={`image-upload ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        {isUploading ? (
          <div className="text-center">
            <FaSpinner className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <p className="mt-2 text-sm text-gray-600">Uploading image...</p>
          </div>
        ) : imagePreview ? (
          <div className="space-y-2 text-center">
            <img
              src={imagePreview}
              alt="Preview"
              className="mx-auto h-48 w-auto object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
            >
              <FaTrash className="mr-2 -ml-0.5" /> Remove
            </button>
          </div>
        ) : (
          <div className="space-y-1 text-center">
            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none"
              >
                <span>Upload an image</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
  initialImage: PropTypes.string,
  onImageUpload: PropTypes.func.isRequired,
  onImageRemove: PropTypes.func.isRequired,
  label: PropTypes.string,
  maxSizeMB: PropTypes.number,
  className: PropTypes.string
};

export default ImageUpload; 