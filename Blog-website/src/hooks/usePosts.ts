import { useState, useEffect } from 'react'
import { postsAPI, type Post } from '../lib/api'

export type { Post }

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsAPI.getAllPosts()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return { posts, loading, error, refetch: fetchPosts }
}

export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserPosts = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const data = await postsAPI.getUserPosts(userId)
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserPosts()
  }, [userId])

  return { posts, loading, error, refetch: fetchUserPosts }
}