import React, { useState, useEffect } from 'react';
import './Weather2.css';

const api = {
    key: "1f3616d327e2103cd3cd4e04772b47aa", // Replace with your API key
    base: "https://api.openweathermap.org/data/2.5/"
}

const Weather2 = () => {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState({});
    const [dailyData, setDailyData] = useState([]); // To store daily weather data
    const [dailySummary, setDailySummary] = useState({}); // To store daily weather summaries
    const [alertTriggered, setAlertTriggered] = useState(false); // Alert based on temperature threshold

    const alertThreshold = 35; // User-configurable temperature threshold for alerts

    // Function to fetch weather data from API
    const fetchWeather = (location) => {
        fetch(`${api.base}weather?q=${location}&units=metric&APPID=${api.key}`)
            .then(res => res.json())
            .then(result => {
                if (result.cod !== 200) throw new Error(result.message); // Error handling for invalid queries
                setWeather(result);
                setQuery('');
                updateDailyData(result);
                console.log(result);
            })
            .catch((error) => {
                alert(error.message);
            });
    };

    // Search function triggered by "Enter" key press
    const search = evt => {
        if (evt.key === "Enter") {
            fetchWeather(query);
        }
    };

    // Update daily weather data for aggregates
    const updateDailyData = (newWeather) => {
        const currentTemp = newWeather.main.temp; // Current temp from API
        const tempMin = newWeather.main.temp_min; // Min temp from API
        const tempMax = newWeather.main.temp_max; // Max temp from API

        // Update the dailyData with new values
        setDailyData(prevData => [...prevData, { temp: currentTemp, temp_min: tempMin, temp_max: tempMax }]);

        const temps = [...dailyData, { temp: currentTemp, temp_min: tempMin, temp_max: tempMax }];

        const avgTemp = (temps.reduce((acc, item) => acc + item.temp, 0) / temps.length).toFixed(2);
        const maxTemp = Math.max(...temps.map(item => item.temp_max)).toFixed(2);
        const minTemp = Math.min(...temps.map(item => item.temp_min)).toFixed(2);

        // Calculate dominant weather condition (most frequent one)
        const dominantWeather = newWeather.weather[0].main;

        setDailySummary({
            avgTemp,
            maxTemp,
            minTemp,
            dominantWeather
        });

        checkAlert(currentTemp); // Check for alert
    };

    // Check if the temperature exceeds the alert threshold
    const checkAlert = (temp) => {
        if (temp > alertThreshold) {
            setAlertTriggered(true);
            alert(`Temperature Alert: The temperature has exceeded ${alertThreshold}°C!`);
        } else {
            setAlertTriggered(false);
        }
    };

    // Automatically fetch weather data every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            if (query) {
                fetchWeather(query); // Fetch weather data at regular intervals
            }
        }, 300000); // 300,000 milliseconds = 5 minutes

        return () => clearInterval(interval); // Cleanup on unmount
    }, [query]);

    // Helper function to format date
    const dateBuilder = (d) => {
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        let day = days[d.getDay()];
        let date = d.getDate();
        let month = months[d.getMonth()];
        let year = d.getFullYear();

        return `${day} ${date} ${month} ${year}`;
    };

    return (
        <div className={(typeof weather.main != "undefined") ? ((weather.main.temp > 16) ? 'app warm' : 'app') : 'app'}>
            <main>
                <div className="search-box">
                    <input type="text" className="search-bar"
                        placeholder="Search..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyPress={search}
                    />
                </div>

                {(typeof weather.main != "undefined") ? (
                    <div>
                        <div className="location-box">
                            <div className="location">
                                {weather.name}, {weather.sys.country}
                            </div>
                            <div className="date">
                                {dateBuilder(new Date())}
                            </div>
                        </div>
                        <div className="weather-box">
                            <div className="temp">
                                {Math.round(weather.main.temp)}°C
                            </div>
                            <div className="weather">
                                {weather.weather[0].main}
                            </div>
                        </div>

                        {/* Display daily weather summary */}
                        <div className="summary-box">
                            <h3>Daily Weather Summary</h3>
                            <p>Average Temp: {dailySummary.avgTemp}°C</p>
                            <p>Max Temp: {dailySummary.maxTemp}°C</p>
                            <p>Min Temp: {dailySummary.minTemp}°C</p>
                            <p>Dominant Weather: {dailySummary.dominantWeather}</p>
                        </div>
                    </div>
                ) : ("")}
            </main>
        </div>
    );
};

export default Weather2;
