import React from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      location: "Rourkela",
      isLoading: false,
      place: "",
      weather: {},
    };
    this.fetchWeather = this.fetchWeather.bind(this);
  }

  async fetchWeather() {
    try {
      this.setState({ isLoading: true });
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({ place: `${name} ${convertToFlag(country_code)}` });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });

      this.setState({ isLoading: false });
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <div>
          <input
            type="text"
            placeholder="Location..."
            value={this.state.location}
            onChange={(e) => this.setState({ location: e.target.value })}
          />
        </div>
        <button onClick={this.fetchWeather}>Get weather</button>
        {this.state.isLoading && <p className="loader">Loading...</p>}

        {!this.state.isLoading &&
          this.state.place &&
          this.state.weather.weathercode && (
            <WeatherData
              weather={this.state.weather}
              place={this.state.place}
            ></WeatherData>
          )}
      </div>
    );
  }
}

export default App;

class WeatherData extends React.Component {
  render() {
    const {
      temperature_2m_max: maxTemp,
      temperature_2m_min: minTemp,
      time: dates,
      weathercode: codes,
    } = this.props.weather;

    console.log(this.props);
    return (
      <div>
        <h3>Weather for {this.props.place}</h3>
        <ul className="weather">
          {dates.map((date, i) => (
            <Day
              date={date}
              max={maxTemp.at(i)}
              min={minTemp.at(i)}
              code={codes.at(i)}
              key={date}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    const { date, max, min, code } = this.props;

    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; - {Math.ceil(max)}&deg;
        </p>
      </li>
    );
  }
}

// const test = new Map([
//   [[1, 2], "Deepak"],
//   [[3, 4], "Amar"],
//   [[5, 6, 7], "Alkarim"],
// ]);

// const result = [...test.keys()].find((res) => res.includes(4));

// console.log([...test.keys()]);
// console.log(test);

// const obj = {
//   name: "Deepak",
//   age: 25,
// };

// const newMap = new Map(Object.entries(obj));
// console.log(newMap);
