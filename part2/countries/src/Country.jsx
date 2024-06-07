import { useState, useEffect } from 'react'
import axios from 'axios'

const Country = ({ country }) => {
    const [weather, setWeather] = useState(null)

    useEffect(() => {
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${country.latlng[0]}&lon=${country.latlng[1]}&units=metric&appid=${import.meta.env.VITE_WEATHER_API}`)
            .then(res => setWeather(res.data))
    }, [])

    return (
        <div>
            <h2>{country.name.common}</h2>
            <p>capital {country.capital[0]}</p>
            <p>area {country.area}</p>
            <h3>languages</h3>
            <ul>
                {Object.entries(country.languages).map(([key, value]) => (
                    <li key={key}>{value}</li>
                ))}
            </ul>
            <img src={country.flags.png} alt={country.name.common} width="100" />
            {
                weather && (
                    <div>
                        <h3>Weather in {country.name.common}</h3>
                        <p>temperature {weather.main.temp} Celcius</p>
                        <img src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`} alt={weather.weather[0].description} width="100px" />
                        <p>wind {weather.wind.speed} m/s</p>
                    </div>
                )
            }
        </div>
    )
}

export default Country