import { useState, useEffect } from 'react'
import ctrlPerson from './services/ctrlPerson'
import './index.css'

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={message.type}>
      {message.content}
    </div>
  )
}

const Filter = ({ searchName, setSearchName }) => {
  return (
    <div>
      filter shown : <input value={searchName} onChange={(e) => setSearchName(e.target.value)} />
    </div>
  )
}

const PersonForm = ({ newName, setNewName, newNumber, setNewNumber, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        name: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
      </div>
      <div>
        number: <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, searchName, deletePerson }) => {
  const personsToShow = searchName === '' ? persons : persons.filter(person => person.name.toLowerCase().includes(searchName.toLowerCase()))
  return (
    <div>
      {personsToShow.map(person =>
        <div key={person.id}>
          {person.name} : {person.number}
          <button onClick={() => deletePerson(person.id)}>delete</button>
        </div>
      )}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchName, setSearchName] = useState('')
  const [message, setMessage] = useState({ type: null, content: null })

  useEffect(() => {
    ctrlPerson.getAll().then(data => setPersons(data))
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (persons.some(person => person.name === newName)) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const person = persons.find(person => person.name === newName)

        try {
          ctrlPerson.update(person.id, { ...person, number: newNumber })
            .then(data => {
              setPersons(persons.map(p => p.id !== data.id ? p : data))
              setMessage({ type: 'success', content: `Updated ${newName}` })
              setTimeout(() => setMessage(null), 5000)
            })
            .catch(
              setMessage({ type: 'error', content: `Information of ${newName} has already been removed from server` }),
              setTimeout(() => setMessage(null), 5000)
            )

        } catch (error) {
          setMessage({ type: 'error', content: error.response.data.error })
          setTimeout(() => setMessage(null), 5000)
        }
      }
    } else {
      try {
        ctrlPerson.create({ name: newName, number: newNumber })
          .then(data => setPersons(persons.concat(data)))
      } catch (error) {
        setMessage({ type: 'error', content: error.response.data.error })
        setTimeout(() => setMessage(null), 5000)
      }

      setMessage({ type: 'success', content: `Added ${newName}` })
      setTimeout(() => setMessage(null), 5000)
    }

    setNewName('')
    setNewNumber('')
  }

  const deletePerson = (id) => {
    if (window.confirm('Delete?')) {
      setPersons(persons.filter(person => person.id !== id))
      ctrlPerson.remove(id)
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter searchName={searchName} setSearchName={setSearchName} />
      <h2>add a new</h2>
      <PersonForm newName={newName} setNewName={setNewName} newNumber={newNumber} setNewNumber={setNewNumber} handleSubmit={handleSubmit} />
      <h2>Numbers</h2>
      <Persons persons={persons} searchName={searchName} deletePerson={deletePerson} />
      <footer>by my</footer>
    </div>
  )
}

export default App