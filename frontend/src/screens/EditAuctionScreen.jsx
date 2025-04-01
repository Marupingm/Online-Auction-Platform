import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaUpload } from 'react-icons/fa';
import { 
  useGetAuctionDetailsQuery, 
  useUpdateAuctionMutation 
} from '../slices/auctionsApiSlice';
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

const EditAuctionScreen = () => {
  const { id: auctionId } = useParams();
  
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { 
    data: auction, 
    isLoading: isLoadingAuction, 
    error: errorLoadingAuction,
    refetch 
  } = useGetAuctionDetailsQuery(auctionId);
  
  const [updateAuction, { isLoading: isUpdating, error: errorUpdating }] = useUpdateAuctionMutation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();
  
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Populate form when auction data is available
    if (auction) {
      // Check if this is the user's auction
      if (auction.seller._id !== userInfo._id) {
        toast.error('You can only edit your own auctions');
        navigate('/my-auctions');
        return;
      }
      
      // Check if the auction is in editable state (pending)
      if (auction.status !== 'pending') {
        toast.error('Only pending auctions can be edited');
        navigate('/my-auctions');
        return;
      }
      
      // Set form values
      setValue('title', auction.title);
      setValue('category', auction.category);
      setValue('description', auction.description);
      setValue('startingPrice', auction.startingPrice);
      
      // Set image preview
      setImagePreview(auction.imageUrl);
    }
  }, [auction, userInfo, navigate, setValue]);
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      let imageUrl = auction.imageUrl;
      
      // Upload new image if changed
      if (imageFile) {
        setUploading(true);
        
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Assuming you have an endpoint to upload images
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
        
        setUploading(false);
      }
      
      // Update auction with data and image URL
      const auctionData = {
        auctionId,
        title: data.title,
        category: data.category,
        description: data.description,
        startingPrice: Number(data.startingPrice),
        imageUrl
      };
      
      const result = await updateAuction(auctionData).unwrap();
      
      toast.success('Auction updated successfully');
      navigate(`/auction/${result._id}`);
    } catch (err) {
      setUploading(false);
      toast.error(err?.data?.message || err.message || 'Failed to update auction');
    }
  };
  
  if (isLoadingAuction) return <Loader />;
  
  if (errorLoadingAuction) {
    return (
      <Message variant="error">
        {errorLoadingAuction?.data?.message || errorLoadingAuction.error || 'Failed to load auction'}
      </Message>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Auction</h1>
      
      {errorUpdating && (
        <Message variant="error">
          {errorUpdating?.data?.message || errorUpdating.error || 'Failed to update auction'}
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
              
              <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-yellow-800">
                  Note: You can only edit pending auctions that haven't started yet.
                  Once an auction becomes active, it cannot be modified.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auction Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {imagePreview ? (
                    <div className="space-y-2 text-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-48 w-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Change image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none"
                        >
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
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
              onClick={() => navigate('/my-auctions')}
              className="btn btn-outline mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdating || uploading}
            >
              {isUpdating || uploading ? <Loader /> : 'Update Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAuctionScreen;