import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaUser } from 'react-icons/fa';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const RegisterScreen = () => {
  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm();
  
  const [errorMessage, setErrorMessage] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [registerUser, { isLoading }] = useRegisterMutation();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';
  
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);
  
  const onSubmit = async (data) => {
    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();
      
      dispatch(setCredentials({ 
        user: res, 
        token: res.token 
      }));
      navigate(redirect);
      toast.success('Registration successful');
    } catch (err) {
      setErrorMessage(
        err?.data?.message || err.error || 'An error occurred during registration'
      );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FaUser className="mr-2" /> Register
        </h1>
        
        {errorMessage && (
          <Message variant="error">{errorMessage}</Message>
        )}
        
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
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
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
                  message: 'Enter a valid email address'
                }
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
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
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
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => 
                  value === watch('password') || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p>
            Already have an account?{' '}
            <Link 
              to={redirect ? `/login?redirect=${redirect}` : '/login'} 
              className="text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen; 