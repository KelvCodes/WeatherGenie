const input = document.getElementById("search-input");
const form = document.querySelector("form");
const locBtn = document.getElementById("loc-btn");
const section = document.querySelector(".weather-info");
const unitToggle = document.getElementById("unit-toggle");
const voiceSearch = document.getElementById("voice-search");
const toggleIcon = document.getElementById("toggle-icon");
const weatherMessage = document.getElementById("weather-message");
const API_KEY = "ca695dcbc66c5fa3d0cb955033fd918f";
let isCelsius = true;

function getData(e) {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return alert("Please enter a city's name.");
  fetchWeatherData(`q=${city}`);
}

function getLocationData() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherData(`lat=${latitude}&lon=${longitude}`);
    },
    () => alert("Unable to retrieve location.")
  );
}

function fetchWeatherData(query) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${API_KEY}`)
    .then((response) => {
      if (!response.ok) throw new Error("City not found.");
      return response.json();
    })
    .then((data) => {
      displayWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    })
    .catch((error) => alert(error.message));
}

function fetchForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => displayForecast(data));
}

function displayWeather(data) {
  const temp = (data.main.temp - 273.15).toFixed(1);
  const feelsLike = (data.main.feels_like - 273.15).toFixed(1);
  const humidity = data.main.humidity;
  const windSpeed = (data.wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;

  document.getElementById("temperature-degree").textContent = isCelsius ? temp : (temp * 9/5 + 32).toFixed(1);
  document.getElementById("feelslike-degree").textContent = `${isCelsius ? feelsLike : (feelsLike * 9/5 + 32).toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
  document.getElementById("humidity-degree").textContent = `${humidity}%`;
  document.getElementById("wind-speed").textContent = `${windSpeed} km/h`;
  document.getElementById("description-text").textContent = description;
  document.getElementById("description-img").src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
  document.getElementById("city").textContent = data.name || "Your Location";
  unitToggle.textContent = `°${isCelsius ? 'C' : 'F'}`;

  updateBackground(description.toLowerCase());
  displayWeatherMessage(temp);
  section.style.display = "block";
  locBtn.style.display = "none";
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecast-container");
  forecastContainer.innerHTML = "";
  const dailyData = data.list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 5);

  dailyData.forEach((day) => {
    const date = new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
    const temp = (day.main.temp - 273.15).toFixed(1);
    const icon = day.weather[0].icon;

    const card = `
      <div class="forecast-card">
        <p>${date}</p>
        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${day.weather[0].description}">
        <p>${isCelsius ? temp : (temp * 9/5 + 32).toFixed(1)}°${isCelsius ? 'C' : 'F'}</p>
      </div>
    `;
    forecastContainer.innerHTML += card;
  });
}

function updateBackground(description) {
  document.body.classList.remove("cold-background", "hot-background", "rainy-background");
  if (description.includes("rain") || description.includes("shower")) {
    document.body.classList.add("rainy-background");
  } else if (parseFloat(document.getElementById("temperature-degree").textContent) < 15) {
    document.body.classList.add("cold-background");
  } else if (parseFloat(document.getElementById("temperature-degree").textContent) > 30) {
    document.body.classList.add("hot-background");
  }
}

function displayWeatherMessage(temp) {
  weatherMessage.classList.remove("cool", "hot");
  if (temp >= 15 && temp <= 25) {
    weatherMessage.textContent = "Perfect weather for a walk! 🌳";
    weatherMessage.classList.add("cool");
  } else if (temp > 30) {
    weatherMessage.textContent = "Stay hydrated, it’s hot out there! ☀️";
    weatherMessage.classList.add("hot");
  } else {
    weatherMessage.textContent = "Suggest you grab a ,it's freezy";
  }
}

function setCurrentDate() {
  document.getElementById("date").textContent = new Date().toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function toggleUnit() {
  isCelsius = !isCelsius;
  const temp = document.getElementById("temperature-degree").textContent;
  const feelsLike = document.getElementById("feelslike-degree").textContent.split("°")[0];
  document.getElementById("temperature-degree").textContent = isCelsius ? (parseFloat(temp) - 32) * 5/9 : (parseFloat(temp) * 9/5 + 32).toFixed(1);
  document.getElementById("feelslike-degree").textContent = `${isCelsius ? (parseFloat(feelsLike) - 32) * 5/9 : (parseFloat(feelsLike) * 9/5 + 32).toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
  unitToggle.textContent = `°${isCelsius ? 'C' : 'F'}`;
  fetchWeatherData(`q=${document.getElementById("city").textContent}`);
}

function voiceSearchWeather() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.onresult = (event) => {
    const city = event.results[0][0].transcript;
    input.value = city;
    fetchWeatherData(`q=${city}`);
  };
  recognition.onerror = () => alert("Voice recognition failed.");
  recognition.start();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  toggleIcon.classList.toggle("fa-moon");
  toggleIcon.classList.toggle("fa-sun");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

// Event Listeners
form.addEventListener("submit", getData);
locBtn.addEventListener("click", getLocationData);
window.addEventListener("load", setCurrentDate);
unitToggle.addEventListener("click", toggleUnit);
voiceSearch.addEventListener("click", voiceSearchWeather);
document.querySelector(".dark-mode-toggle").addEventListener("click", toggleDarkMode);

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") toggleDarkMode();
