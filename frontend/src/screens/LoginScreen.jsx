import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaSignInAlt } from 'react-icons/fa';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const LoginScreen = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [login, { isLoading }] = useLoginMutation();
  
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
      const res = await login(data).unwrap();
      dispatch(setCredentials({ 
        user: res, 
        token: res.token 
      }));
      navigate(redirect);
      toast.success('Login successful');
    } catch (err) {
      setErrorMessage(
        err?.data?.message || err.error || 'An error occurred during login'
      );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FaSignInAlt className="mr-2" /> Sign In
        </h1>
        
        {errorMessage && (
          <Message variant="error">{errorMessage}</Message>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
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
          
          <div className="mb-6">
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
          
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p>
            New Customer?{' '}
            <Link 
              to={redirect ? `/register?redirect=${redirect}` : '/register'} 
              className="text-primary hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen; 