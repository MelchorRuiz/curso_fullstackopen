const { test, after, beforeEach, describe, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

const Blog = require('../models/blog')
const User = require('../models/user')
const blogs = require('./fake_data.json')
const app = require('../app')

const api = supertest(app)

const getToken = async () => {
    const response = await api
        .post('/api/login')
        .send({ username: 'root', password: 'root' })
    return 'bearer ' + response.body.token
}

before(async () => {
    await User.deleteMany({})
    const response = await api
        .post('/api/users')
        .send({ username: 'root', name: 'root', password: 'root' })
})

describe('testing get blogs', () => {

    beforeEach(async () => {
        await Blog.deleteMany({})

        for (let blog of blogs) {
            let blogObject = new Blog(blog)
            await blogObject.save()
        }
    })

    test('correct amount of blogs are returned as json', async () => {
        const token = await getToken()
        const response = await api
            .get('/api/blogs')
            .set({ Authorization: token })
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert.strictEqual(response.body.length, blogs.length)
    })

    test('id field is defined', async () => {
        const token = await getToken()
        const response = await api
            .get('/api/blogs')
            .set({ Authorization: token })
        response.body.forEach(blog => {
            assert(blog.id)
        })
    })
})

describe('testing add blog', () => {

    beforeEach(async () => {
        await Blog.deleteMany({})
    })

    test('a blog can be added', async () => {
        const token = await getToken()
        const newBlog = blogs[0]

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set({ Authorization: token })
        const response = await api
            .get('/api/blogs')
            .set({ Authorization: token })

        const insertedBlog = response.body[response.body.length - 1]
        delete insertedBlog.id
        delete insertedBlog.user

        assert.strictEqual(response.body.length, 1)
        assert.deepStrictEqual(insertedBlog, newBlog)
    })

    test('likes default to 0', async () => {
        const token = await getToken()
        const newBlog = { ...blogs[0] }
        delete newBlog.likes

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set({ Authorization: token })
        const response = await api
            .get('/api/blogs')
            .set({ Authorization: token })
        assert.strictEqual(response.body[response.body.length - 1].likes, 0)
    })

    test('title and url are required', async () => {
        const token = await getToken()
        const newBlog = { ...blogs[0] }
        delete newBlog.title
        delete newBlog.url

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set({ Authorization: token })
            .expect(400)
    })

    test('token is required', async () => {
        const newBlog = blogs[0]

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })
})

describe('testing delete blog', () => {
    beforeEach(async () => {
        const token = await getToken()
        await Blog.deleteMany({})
        const r = await api.
            post('/api/blogs')
            .send(blogs[0])
            .set({ Authorization: token })
    })

    test('a blog can be deleted', async () => {
        const token = await getToken()
        const response = await api
            .get('/api/blogs')
            .set({ Authorization: token })
        const blogToDelete = response.body[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set({ Authorization: token })
            .expect(204)

        const blogsAtEnd = await api
            .get('/api/blogs')
            .set({ Authorization: token })
        assert.strictEqual(blogsAtEnd.body.length, 0)
    })

    test('a blog that does not exist cannot be deleted', async () => {
        const token = await getToken()
        await api
            .delete('/api/blogs/123')
            .set({ Authorization: token })
            .expect(400)
    })

    test('a blog that does not exist cannot be deleted with a valid format', async () => {
        const token = await getToken()
        await api
            .delete('/api/blogs/666b06379ae497dfd0a20c75')
            .set({ Authorization: token })
            .expect(404)
    })
})

describe('testing update blog', () => {
    beforeEach(async () => {
        const token = await getToken()
        await Blog.deleteMany({})
        const r = await api.
            post('/api/blogs')
            .send(blogs[0])
            .set({ Authorization: token })
    })

    test('a blog can be updated', async () => {
        const token = await getToken()
        const response = await api
            .get('/api/blogs')
            .set({ Authorization: token })
        const blogToUpdate = response.body[0]

        delete blogToUpdate.user
        blogToUpdate.likes = 1000

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .set({ Authorization: token })
            .expect(200)

        const blogsAtEnd = await api
            .get('/api/blogs')
            .set({ Authorization: token })
        assert.strictEqual(blogsAtEnd.body[0].likes, 1000)
    })

    test('a blog that does not exist cannot be updated', async () => {
        const token = await getToken()
        await api
            .put('/api/blogs/123')
            .set({ Authorization: token })
            .expect(400)
    })

    test('a blog that does not exist cannot be updated with a valid format', async () => {
        const token = await getToken()
        await api
            .put('/api/blogs/666b06379ae497dfd0a20c75')
            .set({ Authorization: token })
            .expect(404)
    })
})

after(async () => {
    Blog.deleteMany({})
    User.deleteMany({})
    await mongoose.connection.close()
})
