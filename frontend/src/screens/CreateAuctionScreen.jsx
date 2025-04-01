import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCreateAuctionMutation } from '../slices/auctionsApiSlice';
import ImageUpload from '../components/ImageUpload';
import Loader from '../components/Loader';
import Message from '../components/Message';

const CATEGORIES = [
  'Electronics',
  'Collectibles',
  'Fashion',
  'Home & Garden',
  'Vehicles',
  'Sports',
  'Toys & Games',
  'Art',
  'Books',
  'Jewelry',
  'Other'
];

const CreateAuctionScreen = () => {
  const [imageUrl, setImageUrl] = useState('');
  
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const [createAuction, { isLoading, error }] = useCreateAuctionMutation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  // Handle image upload success
  const handleImageUploaded = (url) => {
    setImageUrl(url);
  };
  
  // Handle image removal
  const handleImageRemoved = () => {
    setImageUrl('');
  };
  
  // Handle form submission
  const onSubmit = async (data) => {
    // Validate image
    if (!imageUrl) {
      toast.error('Please upload an image for your auction');
      return;
    }
    
    try {
      // Create auction with image URL
      const auctionData = {
        ...data,
        startingPrice: Number(data.startingPrice),
        duration: Number(data.duration),
        imageUrl
      };
      
      const result = await createAuction(auctionData).unwrap();
      
      toast.success('Auction created successfully');
      navigate(`/auction/${result._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Failed to create auction');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Auction</h1>
      
      {error && (
        <Message variant="error">
          {error?.data?.message || error.error || 'Failed to create auction'}
        </Message>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter auction title"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 3,
                      message: 'Title must be at least 3 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Title must not exceed 100 characters'
                    }
                  })}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className={`form-select ${errors.category ? 'border-red-500' : ''}`}
                  {...register('category', {
                    required: 'Category is required'
                  })}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                )}
              </div>
              
              {/* Starting Price */}
              <div>
                <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Price ($)
                </label>
                <input
                  id="startingPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input ${errors.startingPrice ? 'border-red-500' : ''}`}
                  placeholder="Enter starting price"
                  {...register('startingPrice', {
                    required: 'Starting price is required',
                    min: {
                      value: 0.01,
                      message: 'Starting price must be greater than 0'
                    },
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: 'Please enter a valid price (e.g. 10.99)'
                    }
                  })}
                />
                {errors.startingPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.startingPrice.message}</p>
                )}
              </div>
              
              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <select
                  id="duration"
                  className={`form-select ${errors.duration ? 'border-red-500' : ''}`}
                  {...register('duration', {
                    required: 'Duration is required'
                  })}
                >
                  <option value="">Select duration</option>
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="10">10 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <ImageUpload
                label="Auction Image"
                onImageUpload={handleImageUploaded}
                onImageRemove={handleImageRemoved}
                initialImage={imageUrl}
              />
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="6"
                  className={`form-textarea ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe your item in detail"
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 20,
                      message: 'Description must be at least 20 characters'
                    },
                    maxLength: {
                      value: 2000,
                      message: 'Description must not exceed 2000 characters'
                    }
                  })}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
                <div className="text-xs text-right text-gray-500 mt-1">
                  Markdown formatting supported
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? <Loader /> : 'Create Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionScreen; 