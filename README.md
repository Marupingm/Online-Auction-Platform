# Online Auction Platform

A modern, real-time auction platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring real-time bidding, notifications, and secure payment processing.

## Features

- 🔐 User authentication and authorization
- 🛍️ Create and manage auctions
- 💰 Real-time bidding system
- 🔔 Real-time notifications
- 💳 Secure payment processing
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 🔍 Search and filter functionality
- 👑 Admin dashboard
- 📸 Image upload functionality

## Tech Stack

### Frontend
- React.js
- Redux Toolkit (State Management)
- Socket.io Client (Real-time Features)
- Tailwind CSS (Styling)
- React Router (Routing)
- React Icons
- React Hook Form (Form Management)
- React Toastify (Notifications)

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Socket.io (Real-time Communication)
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Multer (File Upload)

## Project Structure

```
online-auction-platform/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── slices/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   └── server.js
    ├── package.json
    └── .env
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Marupingm/online-auction-platform.git
cd online-auction-platform
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a .env file in the backend directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Deployment

### Backend Deployment (Heroku)

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production
```

5. Deploy the backend:
```bash
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy using Vercel:
```bash
vercel
```

Or deploy using Netlify by connecting your GitHub repository and configuring the build settings:
- Build command: `npm run build`
- Publish directory: `dist`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React.js team for the amazing frontend library
- MongoDB team for the powerful database
- Socket.io team for real-time capabilities
- Tailwind CSS team for the utility-first CSS framework 