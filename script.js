const input = document.getElementById("search-input");
const description = document.getElementById("description-text");
const img = document.getElementById("description-img");
const locBtn = document.getElementById("loc-btn");
const section = document.querySelector("section");
const form = document.querySelector("form");

function getData(e) {
  e.preventDefault();

  if (!input.value) {
    alert("Please Enter a city name");
    return;
  } else {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${input.value}&appid=ca695dcbc66c5fa3d0cb955033fd918f`
    )
      .then((res) => res.json())
      .then((data) => {
        displayWeather(data);
        document.getElementById("city").style.display = "block";
      });
  }
}

function getLocationData() {
  if (!navigator.geolocation) {
    alert("geolocation is not supported!");
    return;
  } else {
    navigator.geolocation.getCurrentPosition((position) => {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=ca695dcbc66c5fa3d0cb955033fd918f`
      )
        .then((res) => res.json())
        .then((data) => {
          displayWeather(data);
          document.querySelector("header h5").style.display = "none";
          document.getElementById("city").textContent = "current location";
        });
    });
  }
}

addEventListener("load", () => {
  const date = document.getElementById("date");

  const d = new Date();
  let currentDate = d.toString().slice(4, 15);

  date.innerHTML = currentDate;
});

function displayWeather(data) {
  document.querySelector("header h5").style.display = "block";

  const temp = (data.main.temp - 273.15).toFixed(1); // Convert from Kelvin to Celsius
  console.log(temp);

  document.getElementById("temperature-degree").textContent = temp + "°";
  document.getElementById("city").textContent = input.value;

  document.getElementById("humidity-degree").textContent =
    data.main.humidity + " %";
  document.getElementById("feelslike-degree").textContent =
    (data.main.feels_like - 273.15).toFixed(1) + " °";

  description.textContent = data.weather[0].description;

  img.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

  section.style.display = "block";
  section.classList.add("test");
  document.getElementById("city").style.display = "block";
  locBtn.style.display = "none";

  // Set background based on temperature
  if (temp < 15) {
    document.body.classList.add("cold-background"); // Add cold background
    document.body.classList.remove("hot-background");
  } else if (temp > 30) {
    document.body.classList.add("hot-background"); // Add hot background
    document.body.classList.remove("cold-background");
  } else {
    document.body.classList.remove("cold-background", "hot-background"); // Remove both if temp is moderate
  }
}

// Event listeners
form.addEventListener("submit", getData);
