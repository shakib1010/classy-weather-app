import { useEffect, useState } from 'react'

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], '☀️'],
    [[1], '🌤'],
    [[2], '⛅️'],
    [[3], '☁️'],
    [[45, 48], '🌫'],
    [[51, 56, 61, 66, 80], '🌦'],
    [[53, 55, 63, 65, 57, 67, 81, 82], '🌧'],
    [[71, 73, 75, 77, 85, 86], '🌨'],
    [[95], '🌩'],
    [[96, 99], '⛈'],
  ])

  const arr = [...icons.keys()].find((key) => key.includes(wmoCode))
  if (!arr) return 'NOT FOUND'
  return icons.get(arr)
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
  }).format(new Date(dateStr))
}

export default function App() {
  const [location, setLocation] = useState(
    localStorage.getItem('location') || ''
  )
  const [loading, setLoading] = useState(false)
  const [weatherLocation, setWeatherLocation] = useState('')
  const [weather, setWeather] = useState({})

  useEffect(() => {
    async function fetchWeatherData() {
      if (location.length < 2) return
      try {
        setLoading(true)
        // 1) Getting location (geocoding)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        )
        const geoData = await geoRes.json()

        if (!geoData.results) throw new Error('Location not found')

        const { latitude, longitude, timezone, name, country_code } =
          geoData.results.at(0)
        setWeatherLocation(`${name} ${convertToFlag(country_code)}`)

        // 2) Getting actual weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
        )
        const weatherData = await weatherRes.json()
        setWeather(weatherData.daily)
        console.log(weatherData.daily)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchWeatherData()
    localStorage.setItem('location', location)
    return () => {
      setWeather({})
    }
  }, [location])

  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <div>
        <input
          type="text"
          name="location"
          id="loc"
          placeholder="Search for location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      {loading && <p className="loader">Loading...</p>}
      {weather.weathercode && (
        <Weather weatherLocation={weatherLocation} weather={weather} />
      )}
    </div>
  )
}

function Weather({ weather, weatherLocation }) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes,
  } = weather

  return (
    <div>
      <h2>Weather {weatherLocation}</h2>
      <ul className="weather">
        {dates.map((date, i) => (
          <Day
            date={date}
            max={max.at(i)}
            min={min.at(i)}
            code={codes.at(i)}
            isToday={i === 0}
            key={date}
          />
        ))}
      </ul>
    </div>
  )
}

function Day({ date, max, min, code, isToday }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? 'Today' : formatDay(date)}</p>
      <p>
        {Math.floor(min)}&deg; &mdash; {Math.ceil(max)}&deg;
      </p>
    </li>
  )
}
