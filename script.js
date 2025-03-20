ain.temp - 273.15).toFixed(1); // Convert Kelvin to Celsius
dy.classList.remove("cold-background", "hot-background");

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
