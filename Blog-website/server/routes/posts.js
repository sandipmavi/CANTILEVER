const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// @route   GET /api/posts
// @desc    Get all published posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .populate('author', 'fullName avatarUrl')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get all posts by user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'fullName avatarUrl')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:slug
// @desc    Get single post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'fullName avatarUrl bio');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('excerpt').trim().isLength({ min: 1, max: 300 }).withMessage('Excerpt is required and must be less than 300 characters'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, excerpt, content, category, tags, featuredImage, published } = req.body;

    // Generate unique slug
    let slug = generateSlug(title);
    let existingPost = await Post.findOne({ slug });
    let counter = 1;

    while (existingPost) {
      slug = `${generateSlug(title)}-${counter}`;
      existingPost = await Post.findOne({ slug });
      counter++;
    }

    // Process tags
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const post = new Post({
      title,
      excerpt,
      content,
      slug,
      category: category || null,
      tags: processedTags,
      featuredImage: featuredImage || null,
      published: published || false,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'fullName avatarUrl');

    res.status(201).json({
      message: published ? 'Post published successfully' : 'Post saved as draft',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('excerpt').optional().trim().isLength({ min: 1, max: 300 }).withMessage('Excerpt must be less than 300 characters'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, excerpt, content, category, tags, featuredImage, published } = req.body;

    // Update slug if title changed
    if (title && title !== post.title) {
      let slug = generateSlug(title);
      let existingPost = await Post.findOne({ slug, _id: { $ne: post._id } });
      let counter = 1;

      while (existingPost) {
        slug = `${generateSlug(title)}-${counter}`;
        existingPost = await Post.findOne({ slug, _id: { $ne: post._id } });
        counter++;
      }

      post.slug = slug;
    }

    // Process tags
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : post.tags;

    // Update fields
    post.title = title || post.title;
    post.excerpt = excerpt || post.excerpt;
    post.content = content || post.content;
    post.category = category !== undefined ? category : post.category;
    post.tags = processedTags;
    post.featuredImage = featuredImage !== undefined ? featuredImage : post.featuredImage;
    post.published = published !== undefined ? published : post.published;

    await post.save();
    await post.populate('author', 'fullName avatarUrl');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;