# Blog Website with Node.js Backend

A complete full-stack blog website built with React, Node.js, Express, and MongoDB. Features user authentication, CRUD operations for blog posts, and a modern, responsive design.

## Features

### Frontend (React + TypeScript)
- ✅ User registration and login/logout functionality
- ✅ Responsive design with Tailwind CSS
- ✅ Create, read, update, and delete blog posts
- ✅ User dashboard for managing posts
- ✅ Modern UI with smooth animations
- ✅ Form validation with React Hook Form and Zod
- ✅ Toast notifications for user feedback

### Backend (Node.js + Express)
- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ CORS configuration

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling
- Zod for validation
- Axios for API calls
- Lucide React for icons

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- CORS for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-website
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blog_website
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   # In the root directory
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all published posts
- `GET /api/posts/user/:userId` - Get posts by user (protected)
- `GET /api/posts/:slug` - Get single post by slug
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

## Database Schema

### User Model
```javascript
{
  fullName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  avatarUrl: String (optional),
  bio: String (optional),
  timestamps: true
}
```

### Post Model
```javascript
{
  title: String (required),
  content: String (required),
  excerpt: String (required),
  slug: String (required, unique),
  featuredImage: String (optional),
  published: Boolean (default: false),
  author: ObjectId (ref: User),
  category: String (optional),
  tags: [String],
  timestamps: true
}
```

## Project Structure

```
blog-website/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # API utilities
│   ├── pages/             # Page components
│   └── main.tsx           # App entry point
├── server/                # Backend source code
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── server.js          # Server entry point
└── README.md
```

## Development

### Running in Development Mode

1. **Backend with auto-reload:**
   ```bash
   cd server
   npm run dev
   ```

2. **Frontend with hot reload:**
   ```bash
   npm run dev
   ```

### Building for Production

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Start backend in production:**
   ```bash
   cd server
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.