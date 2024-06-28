const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

describe('testing get users', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })

    test('correct amount of users are returned as json', async () => {
        const response = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        console.log(response.body)
        assert.strictEqual(response.body.length, 0)
    })
})

describe('testing add user', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })

    test('a user can be added', async () => {
        const newUser = {
            username: 'root',
            name: 'root',
            password: 'password'
        }

        await api
            .post('/api/users')
            .send(newUser)
        const response = await api.get('/api/users')

        const insertedUser = response.body[response.body.length - 1]
        delete insertedUser.id
        delete insertedUser.blogs
        delete newUser.password

        assert.strictEqual(response.body.length, 1)
        assert.deepStrictEqual(insertedUser, newUser)
    })

    test('password missing', async () => {
        const newUser = {
            username: 'root',
            name: 'root'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('password too short', async () => {
        const newUser = {
            username: 'root',
            name: 'root',
            password: 'pa'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('username missing', async () => {
        const newUser = {
            name: 'root',
            password: 'password'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('username too short', async () => {
        const newUser = {
            username: 'ro',
            name: 'root',
            password: 'password'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('username already exists', async () => {
        const newUser = {
            username: 'root',
            name: 'root',
            password: 'password'
        }

        await api
            .post('/api/users')
            .send(newUser)
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
})

after(() => {
    User.deleteMany({})
    mongoose.connection.close()
})