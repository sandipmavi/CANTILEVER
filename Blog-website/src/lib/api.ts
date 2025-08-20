import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
  bio?: string
}

export interface Post {
  _id: string
  title: string
  content: string
  excerpt: string
  slug: string
  featuredImage?: string
  published: boolean
  author: {
    _id: string
    fullName: string
    avatarUrl?: string
  }
  category?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface PostResponse {
  message: string
  post: Post
}

// Auth API
export const authAPI = {
  register: async (fullName: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { fullName, email, password })
    return response.data
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Posts API
export const postsAPI = {
  getAllPosts: async (): Promise<Post[]> => {
    const response = await api.get('/posts')
    return response.data
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    const response = await api.get(`/posts/user/${userId}`)
    return response.data
  },

  getPostBySlug: async (slug: string): Promise<Post> => {
    const response = await api.get(`/posts/${slug}`)
    return response.data
  },

  createPost: async (postData: {
    title: string
    excerpt: string
    content: string
    category?: string
    tags?: string
    featuredImage?: string
    published: boolean
  }): Promise<PostResponse> => {
    const response = await api.post('/posts', postData)
    return response.data
  },

  updatePost: async (id: string, postData: {
    title?: string
    excerpt?: string
    content?: string
    category?: string
    tags?: string
    featuredImage?: string
    published?: boolean
  }): Promise<PostResponse> => {
    const response = await api.put(`/posts/${id}`, postData)
    return response.data
  },

  deletePost: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  },
}

export default api