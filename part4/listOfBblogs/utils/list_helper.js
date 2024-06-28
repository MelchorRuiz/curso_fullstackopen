var _ = require('lodash');

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null
    return blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max, blogs[0])
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null
    const authorCounts = _.countBy(blogs, 'author')
    const author = _.maxBy(_.keys(authorCounts), (author) => authorCounts[author])
    return { author, blogs: authorCounts[author] }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null
    const authorLikes = _.groupBy(blogs, 'author')
    const author = _.maxBy(_.keys(authorLikes), (author) => _.sumBy(authorLikes[author], 'likes'))
    return { author, likes: _.sumBy(authorLikes[author], 'likes') }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}