const usersRouter = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const logger = require('../utils/logger');

usersRouter.post('/', async (request, response, next) => {
    try {
        const body = request.body;
        if (body.password === undefined || body.password.length < 3) {
            return response.status(400).json({ error: 'password missing or too short' });
        }
        const user = new User({
            username: body.username,
            name: body.name,
            password: await bcrypt.hash(body.password, 10)
        });
        const savedUser = await user.save();
        response.json(savedUser);
    } catch (exception) {
        next(exception);
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 });
    response.json(users);
})

module.exports = usersRouter;