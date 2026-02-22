// Geocoding API to get coordinates from city name
async function getCoordinates(city) {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                lat: result.latitude,
                lon: result.longitude,
                name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`
            };
        }
        throw new Error('City not found');
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
}

// Get weather data from coordinates
async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Convert weather code to emoji
function getWeatherEmoji(code) {
    if (!code) return '☀️';
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '⛅';
    if (code === 45 || code === 48) return '🌫️';
    if (code === 51 || code === 53 || code === 55 || code === 61 || code === 63 || code === 65) return '🌧️';
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 80 || code === 81 || code === 82) return '🌨️';
    if (code === 85 || code === 86) return '🌨️';
    if (code === 80 || code === 81 || code === 82) return '🌧️';
    if (code >= 80 && code <= 82) return '🌧️';
    return '☁️';
}

// Render Daily Forecast
function renderDailyForecast(data) {
    const dailyRow = document.getElementById('dailyRow');
    dailyRow.innerHTML = '';
    
    if (!data.daily) return;
    
    for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
        const date = new Date(data.daily.time[i]);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3);
        const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
        const weatherCode = data.daily.weather_code[i];
        const icon = getWeatherEmoji(weatherCode);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'day-item';
        dayEl.innerHTML = `
            <span style="color: #94a3b8; font-size: 12px;">${day}</span>
            <div style="margin: 10px 0; font-size: 24px;">${icon}</div>
            <strong>${maxTemp}°</strong>
        `;
        dailyRow.appendChild(dayEl);
    }
}

// Render Hourly Forecast
function renderHourlyForecast(data) {
    const hourlyList = document.getElementById('hourlyList');
    hourlyList.innerHTML = '';
    
    if (!data.hourly) return;
    
    // Show hourly data for 8 time slots
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let i = 0; i < 8; i++) {
        const hourIndex = currentHour + i;
        if (hourIndex >= data.hourly.time.length) break;
        
        const time = new Date(data.hourly.time[hourIndex]);
        const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(data.hourly.temperature_2m[hourIndex]);
        const weatherCode = data.hourly.weather_code[hourIndex];
        const icon = getWeatherEmoji(weatherCode);
        
        const hourEl = document.createElement('div');
        hourEl.className = 'hour-item';
        hourEl.innerHTML = `
            <div style="font-size: 24px; margin: 8px 0;" class="icon">${icon}</div>
            <span>${timeStr}</span>
            <strong class="temperature">${temp}°</strong>
        `;
        hourlyList.appendChild(hourEl);
    }
}

// Update main weather display
function updateMainWeather(data, cityName) {
    if (!data.current) return;
    
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m);
    const icon = getWeatherEmoji(current.weather_code);
    
    document.getElementById('cityName').innerText = cityName;
    document.querySelector('.temp-display .temp').innerText = `${temp}°`;
    document.querySelector('.temp-display .icon').innerText = icon;
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card strong');
    if (statCards.length >= 3) {
        statCards[0].innerText = `${temp}°`; // Feels Like
        statCards[1].innerText = `${humidity}%`; // Humidity
        statCards[2].innerText = `${windSpeed} km/h`; // Wind
    }
    
    // Update date
    const date = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById('date').innerText = date;
}

// Main function to fetch and display weather
async function fetchWeather(city) {
    const coords = await getCoordinates(city);
    if (!coords) {
        alert('City not found. Please try again.');
        return;
    }
    
    const weatherData = await getWeatherData(coords.lat, coords.lon);
    if (!weatherData) {
        alert('Error fetching weather data. Please try again.');
        return;
    }
    
    updateMainWeather(weatherData, coords.name);
    renderDailyForecast(weatherData);
    renderHourlyForecast(weatherData);
}

// Load default city (Berlin) on page load
window.addEventListener('load', () => {
    fetchWeather('Berlin');
});

// Search button interaction
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});

// Allow Enter key to search
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});
let toggle = document.getElementById("toggle");

toggle.onclick = function(){

document.body.classList.toggle("light");

}

window.addEventListener("scroll", function() {

  let scrollPosition = window.scrollY;

  document.querySelector("#hero").style.backgroundPositionY =
      scrollPosition * 0.5 + "px";

});