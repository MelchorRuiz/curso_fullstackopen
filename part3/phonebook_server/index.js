require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(express.json());
app.use(morgan(function (tokens, req, res) {
    const method = tokens.method(req, res);
    return [
        method,
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        method === 'POST' ? JSON.stringify(req.body) : ''
    ].join(' ')
}));
app.use(cors());
app.use(express.static('dist'));

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    });
});

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person);
            } else {
                res.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end();
        })
        .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save()
        .then(savedPerson => {
            res.json(savedPerson);
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body;

    const person = {
        name: body.name,
        number: body.number
    };

    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            res.json(updatedPerson);
        })
        .catch(error => next(error));
});

app.get('/info', (req, res) => {
    const date = new Date();
    Person.find({}).then(persons => {
        res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`);
    });
});

const errorHandler = (error, req, res, next) => {
    console.error(error.message);
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    } else if (error.code === 11000) {
        return res.status(400).json({ error: error.message });
    }
    next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});