import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaUser, FaEdit } from 'react-icons/fa';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProfileScreen = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: profile, isLoading: isLoadingProfile, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name);
      setValue('email', profile.email);
    }
  }, [profile, setValue]);
  
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    try {
      const updateData = {
        name: data.name,
        email: data.email,
        ...(data.password && { password: data.password }),
      };
      
      const res = await updateProfile(updateData).unwrap();
      
      dispatch(setCredentials({ user: res }));
      
      setSuccessMessage('Profile updated successfully');
      setErrorMessage('');
      toast.success('Profile updated successfully');
      
      refetch();
    } catch (err) {
      setErrorMessage(
        err?.data?.message || err.error || 'Failed to update profile'
      );
      toast.error('Failed to update profile');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FaUser className="mr-2" /> User Profile
        </h1>
        
        {successMessage && (
          <Message variant="success" className="mb-4">
            {successMessage}
          </Message>
        )}
        
        {errorMessage && (
          <Message variant="error" className="mb-4">
            {errorMessage}
          </Message>
        )}
        
        {isLoadingProfile ? (
          <Loader />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <FaEdit className="mr-2" /> Edit Profile
              </h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="input w-full"
                  {...register('name', {
                    required: 'Name is required',
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="input w-full"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="input w-full"
                  placeholder="Leave blank to keep current password"
                  {...register('password', {
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="input w-full"
                  placeholder="Leave blank to keep current password"
                  {...register('confirmPassword')}
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader /> : 'Update Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen; 