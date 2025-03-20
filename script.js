n is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherData(`lat=${latitude}&lon=${longitude}`);
    },
    () => {
      alert("Unable to retrieve your location.");
    }
  );
}

// Fetch weather data, from OpenWeatherMap API
function fetchWeatherData(query) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${API_KEY}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found. Please try again.");
      }
      return response.json();
    })
    .then((data) => {
      displayWeather(data);
    })
    .catch((error) => {
      alert(error.message);
    });
}

// Display the fetched weather data
function displayWeather(data) {
  const temp = (data.main.temp - 273.15).toFixed(1); // Convert Kelvin to Celsius
  const feelsLike = (data.main.feels_like - 273.15).toFixed(1);
  const humidity = data.main.humidity;
  const weatherDescription = data.weather[0].description;
  const weatherIcon = data.weather[0].icon;

  // Update the UI elements
  document.getElementById("temperature-degree").textContent = `${temp}°C`;
  document.getElementById("feelslike-degree").textContent = `${feelsLike}°C`;
  document.getElementById("humidity-degree").textContent = `${humidity} %`;
  description.textContent = weatherDescription;
  img.src = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

  const city = data.name || "Your current location";
  document.getElementById("city").textContent = city;

  // Update the background based on temperature
  updateBackground(temp);

  // Display the weather section
  section.style.display = "block";
  locBtn.style.display = "none";
}

// Update the background based on temperature
function updateBackground(temp) {
  document.body.classList.remove("cold-background", "hot-background");

  if (temp < 15) {
    document.body.classList.add("cold-background");
  } else if (temp > 30) {
    document.body.classList.add("hot-background");
  }
}

// Set the current date
function setCurrentDate() {
  const dateElement = document.getElementById("date");
  const today = new Date();
  const formattedDate = today.toDateString();
  dateElement.textContent = formattedDate;
}
//The Event Listeners
form.addEventListener("submit", getData);
locBtn.addEventListener("click", getLocationData);
window.addEventListener("load", setCurrentDate);
