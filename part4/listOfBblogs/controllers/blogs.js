const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const { SECRET } = require('../utils/config')

blogsRouter.post('/', async (request, response, next) => {
    try {
        const user = request.user;
        const blog = new Blog({
            title: request.body.title,
            author: request.body.author,
            url: request.body.url,
            likes: request.body.likes || 0,
            user: user.id
        })
        const result = await blog.save()
        user.blogs = user.blogs.concat(result.id)
        await user.save()
        response.status(201).json(result)
    } catch (error) {
        next(error)
    }
})

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const result = await Blog.findById(request.params.id)
        if (result) {
            response.json(result)
        } else {
            response.status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    try {
        const result = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true, context: 'query' })
        if (result) {
            response.json(result)
        } else {
            response.status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        const result = await Blog.findById(request.params.id)
        if (!result) {
            return response.status(404).end()
        }
        if (result.user.toString() === request.user.id) {
            await result.deleteOne()
            response.status(204).end()
        } else {
            return response.status(401).json({ error: 'unauthorized' })
        }
    } catch (error) {
        next(error)
    }
})

module.exports = blogsRouter