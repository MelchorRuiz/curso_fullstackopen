const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { SECRET } = require('../utils/config')

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7)
    } else {
        request.token = null
    }
    next()
}

const userExtractor = async (request, response, next) => {
    try {
        const decodedToken = jwt.verify(request.token, SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token invalid' })
        }
        const user = await User.findById(decodedToken.id)
        request.user = user
        next()
    } catch(error) {
        next(error)
    }
}

module.exports = {tokenExtractor, userExtractor}