import { useState, useEffect } from 'react'
import axios from 'axios'
import CountriesList from './CountriesList'

function App() {
  const [country, setCountry] = useState(null)
  const [countries, setCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])

  useEffect(() => {
    axios.get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(res => setCountries(res.data))
  }, [])

  useEffect(() => {
    if (country) {
      setFilteredCountries(countries.filter(c => c.name.common.toLowerCase().includes(country.toLowerCase())))
    }
  }, [country])

  return (
    <>
      <h1>find countries</h1>
      <input onChange={e => setCountry(e.target.value)} />
      <CountriesList countries={filteredCountries} />
    </>
  )
}

export default App
