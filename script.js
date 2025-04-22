// Constants
const API_KEY = "ca695dcbc66c5fa3d0cb955033fd918f";
const ELEMENTS = {
  form: document.querySelector(".search-grp"),
  input: document.querySelector("#search-input"),
  locBtn: document.querySelector(".loc-btn"),
  weatherInfo: document.querySelector(".weather-info"),
  unitToggle: document.querySelector(".unit-toggle"),
  voiceSearch: document.querySelector("#voice-search"),
  darkModeToggle: document.querySelector(".dark-mode-toggle"),
  weatherMessage: document.querySelector(".weather-message"),
  toggleIcon: document.querySelector("#toggle-icon"),
  city: document.querySelector(".city"),
  date: document.querySelector(".date"),
  temperature: document.querySelector(".temperature-degree"),
  feelsLike: document.querySelector(".feelslike-degree"),
  humidity: document.querySelector(".humidity-degree"),
  windSpeed: document.querySelector(".wind-speed"),
  descriptionText: document.querySelector(".description-text"),
  descriptionImg: document.querySelector(".weather-icon"),
  forecastContainer: document.querySelector(".forecast-container"),
};

// State
let isCelsius = true;
let lastCity = "";

// Utility Functions
const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(1);
const celsiusToFahrenheit = (celsius) => (celsius * 9/5 + 32).toFixed(1);
const metersPerSecondToKmh = (ms) => (ms * 3.6).toFixed(1);

const showError = (message) => {
  ELEMENTS.weatherMessage.textContent = message;
  ELEMENTS.weatherMessage.classList.remove("cool", "hot");
  ELEMENTS.weatherInfo.classList.add("hidden");
};

// Fetch Weather Data
const fetchWeatherData = async (query) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${API_KEY}`);
    if (!response.ok) throw new Error("City not found.");
    const data = await response.json();
    lastCity = query.includes("q=") ? query.split("q=")[1] : data.name;
    displayWeather(data);
    await fetchForecast(data.coord.lat, data.coord.lon);
  } catch (error) {
    showError(error.message);
  }
};

// Fetch Forecast Data
const fetchForecast = async (lat, lon) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error("Forecast fetch error:", error);
  }
};

// Display Weather
const displayWeather = (data) => {
  const tempCelsius = kelvinToCelsius(data.main.temp);
  const feelsLikeCelsius = kelvinToCelsius(data.main.feels_like);
  const temp = isCelsius ? tempCelsius : celsiusToFahrenheit(tempCelsius);
  const feelsLike = isCelsius ? feelsLikeCelsius : celsiusToFahrenheit(feelsLikeCelsius);
  const description = data.weather[0].description;

  ELEMENTS.temperature.textContent = temp;
  ELEMENTS.feelsLike.textContent = `${feelsLike}°${isCelsius ? "C" : "F"}`;
  ELEMENTS.humidity.textContent = `${data.main.humidity}%`;
  ELEMENTS.windSpeed.textContent = `${metersPerSecondToKmh(data.wind.speed)} km/h`;
  ELEMENTS.descriptionText.textContent = description;
  ELEMENTS.descriptionImg.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  ELEMENTS.descriptionImg.alt = `Weather icon: ${description}`;
  ELEMENTS.city.textContent = data.name || "Current Location";
  ELEMENTS.unitToggle.textContent = `°${isCelsius ? "C" : "F"}`;
  ELEMENTS.weatherInfo.classList.remove("hidden");

  updateBackground(description.toLowerCase());
  displayWeatherMessage(parseFloat(tempCelsius));
};

// Display Forecast
const displayForecast = (data) => {
  ELEMENTS.forecastContainer.innerHTML = "";
  const dailyData = data.list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 5);

  dailyData.forEach((day) => {
    const date = new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
    const tempCelsius = kelvinToCelsius(day.main.temp);
    const temp = isCelsius ? tempCelsius : celsiusToFahrenheit(tempCelsius);
    const icon = day.weather[0].icon;
    const description = day.weather[0].description;

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <p>${date}</p>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
      <p>${temp}°${isCelsius ? "C" : "F"}</p>
    `;
    ELEMENTS.forecastContainer.appendChild(card);
  });
};

// Update Background
const updateBackground = (description) => {
  document.body.classList.remove("cold-background", "hot-background", "rainy-background");
  const temp = parseFloat(ELEMENTS.temperature.textContent);
  if (description.includes("rain") || description.includes("shower")) {
    document.body.classList.add("rainy-background");
  } else if (temp < 15) {
    document.body.classList.add("cold-background");
  } else if (temp > 30) {
    document.body.classList.add("hot-background");
  }
};

// Display Weather Message
const displayWeatherMessage = (temp) => {
  ELEMENTS.weatherMessage.classList.remove("cool", "hot");
  if (temp >= 15 && temp <= 25) {
    ELEMENTS.weatherMessage.textContent = "Perfect weather for a walk! 🌳";
    ELEMENTS.weatherMessage.classList.add("cool");
  } else if (temp > 30) {
    ELEMENTS.weatherMessage.textContent = "Stay hydrated, it’s hot out there! ☀️";
    ELEMENTS.weatherMessage.classList.add("hot");
  } else {
    ELEMENTS.weatherMessage.textContent = "Grab a jacket, it’s chilly! 🧥";
  }
};

// Toggle Temperature Unit
const toggleUnit = () => {
  isCelsius = !isCelsius;
  if (lastCity) fetchWeatherData(`q=${lastCity}`);
};

// Voice Search
const voiceSearchWeather = () => {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    showError("Voice recognition not supported.");
    return;
  }
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const city = event.results[0][0].transcript;
    ELEMENTS.input.value = city;
    fetchWeatherData(`q=${city}`);
  };
  recognition.onerror = () => showError("Voice recognition failed.");
  recognition.start();
};

// Toggle Dark Mode
const toggleDarkMode = () => {
  document.body.classList.toggle("dark-mode");
  ELEMENTS.toggleIcon.classList.toggle("fa-moon");
  ELEMENTS.toggleIcon.classList.toggle("fa-sun");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
};

// Get Location Data
const getLocationData = () => {
  if (!navigator.geolocation) return showError("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherData(`lat=${latitude}&lon=${longitude}`);
    },
    () => showError("Unable to retrieve location.")
  );
};

// Set Current Date
const setCurrentDate = () => {
  ELEMENTS.date.textContent = new Date().toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

// Event Listeners
ELEMENTS.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = ELEMENTS.input.value.trim();
  if (!city) return showError("Please enter a city name.");
  fetchWeatherData(`q=${city}`);
});
ELEMENTS.locBtn.addEventListener("click", getLocationData);
ELEMENTS.unitToggle.addEventListener("click", toggleUnit);
ELEMENTS.voiceSearch.addEventListener("click", voiceSearchWeather);
ELEMENTS.darkModeToggle.addEventListener("click", toggleDarkMode);
window.addEventListener("load", () => {
  setCurrentDate();
  if (localStorage.getItem("darkMode") === "true") toggleDarkMode();
});
