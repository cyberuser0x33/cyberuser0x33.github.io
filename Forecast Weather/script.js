const api = "5d6f4cb216c84a618d280654253105";
let weatherOutput = document.querySelector("#weather-output");
let errorMessage = document.querySelector("#error-message");
let citySelect = document.querySelector("#city-select");
let btn = document.querySelector("#get-weather");
let overlay = document.getElementById('modal-overlay');
let modal = document.getElementById('modal-window');


let btnForecast = document.querySelector("#get-forecast");
let amountSelect = document.querySelector("#amount-select");

let field = document.querySelector("#search");

const showError = (message) => {
    errorMessage.innerHTML = message;
}
const clearError = () => {
    errorMessage.innerHTML = "";
}

const getTemperatureColor = (temp) => {
    if (temp >= 25) {
        return 'rgb(255, 145, 73)'; 
    } else if (temp >= 15) {
        return 'rgb(254, 209, 106)'; 
    } else if (temp >= 5) {
        return 'rgb(175, 221, 255)'; 
    } else {
        return 'rgb(96, 181, 255)'; 
    }
}

function getWeather(location) {
    let url = `https://api.weatherapi.com/v1/current.json?key=${api}&q=${location}&aqi=yes`;
    fetch(url).then(async response => {
        if (response.status == 400){
            errorMessage.style.display = "block";
            weatherOutput.innerHTML = "";
            showError("City not found");
            return;
        }
        clearError();
        let data = await response.json();
        console.log(data);
        if (response.status == 200){
            errorMessage.style.display = "none";

            const favicon = document.querySelector("link[rel='icon']");
            favicon.href = `https:${data.current.condition.icon}?v=${Date.now()}`;

            const tempColor = getTemperatureColor(data.current.temp_c);
            
            weatherOutput.innerHTML = `
                <div class="city-header">
                    <span>
                        ${data.location.name},
                        ${data.location.region ? data.location.region + " , " : ""}
                        ${data.location.country}
                    </span>
                    <img class="weather-icon" src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
                </div>
                <div class="weather-grid">
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Temperature:</div>
                        <div class="weather-card-value">${data.current.temp_c}°C</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Feels like:</div>
                        <div class="weather-card-value">${data.current.feelslike_c}°C</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Wind speed:</div>
                        <div class="weather-card-value">${data.current.wind_kph} km/h</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Clouds:</div>
                        <div class="weather-card-value">${data.current.cloud}%</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Humidity:</div>
                        <div class="weather-card-value">${data.current.humidity}%</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Pressure:</div>
                        <div class="weather-card-value">${data.current.pressure_mb} mbar</div>
                    </div>
                </div>
            `;
        }
    });
}

function getForecast(location, days) {
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${api}&q=${location}&days=${days}&aqi=no&alerts=no`;
    fetch(url).then(async response => {
        if (response.status == 400) {
            errorMessage.style.display = "block";
            document.querySelector("#forecast-output").innerHTML = "";
            showError("City not found");
            return;
        }
        clearError();
        let data = await response.json();
        if (response.status == 200) {
            errorMessage.style.display = "none";
            
            const favicon = document.querySelector("link[rel='icon']");
            favicon.href = `https:${data.current.condition.icon}?v=${Date.now()}`;

            let forecastHTML = `
                <div class="city-header">
                    <span>
                        ${data.location.name},
                        ${data.location.region ? data.location.region + " , " : ""}
                        ${data.location.country}
                    </span>
                    <img class="weather-icon" src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
                </div>
            `;

            window._forecastData = [];

            data.forecast.forecastday.forEach((day, dayIdx) => {
                const date = formatDate(day.date);
                forecastHTML += `
                    <div class="forecast-day" data-day-idx="${dayIdx}">
                        <div class="forecast-date">${date}</div>
                        <div class="forecast-hours-carousel">
                `;
                window._forecastData[dayIdx] = [];
                day.hour.forEach((hour, hourIdx) => {
                    window._forecastData[dayIdx][hourIdx] = hour;
                    const time = hour.time.split(' ')[1];
                    forecastHTML += `
                        <div class="forecast-hour" data-hour-idx="${hourIdx}">
                            <div class="forecast-hour-time">${time}</div>
                            <img class="forecast-hour-icon" src="https:${hour.condition.icon}" alt="${hour.condition.text}">
                            <div class="forecast-hour-temp">${hour.temp_c}°C</div>
                        </div>
                    `;
                });
                forecastHTML += `
                        </div>
                    </div>
                `;
            });
            document.querySelector("#forecast-output").innerHTML = forecastHTML;
            enableHourModalHandlers();


            document.querySelectorAll('.forecast-hours-carousel').forEach(carousel => {
                let isScrolling = false;
                let startX;
                let scrollLeft;

                carousel.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    carousel.scrollLeft += e.deltaY;
                    
                    if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth) {
                        carousel.scrollLeft = 0;
                    }
                });

                carousel.addEventListener('mousedown', (e) => {
                    isScrolling = true;
                    startX = e.pageX - carousel.offsetLeft;
                    scrollLeft = carousel.scrollLeft;
                });

                carousel.addEventListener('mouseleave', () => {
                    isScrolling = false;
                });

                carousel.addEventListener('mouseup', () => {
                    isScrolling = false;
                });

                carousel.addEventListener('mousemove', (e) => {
                    if (!isScrolling) return;
                    e.preventDefault();
                    const x = e.pageX - carousel.offsetLeft;
                    const walk = (x - startX) * 2;
                    carousel.scrollLeft = scrollLeft - walk;
                });

            });
        }
    });
    function formatDate(dateStr){
        const date = new Date(dateStr);
        const userLanguage = navigator.language || 'en-GB';
        return date.toLocaleDateString(
            userLanguage, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
        );
    }
}



if (btn) {
    btn.addEventListener("click", () => {
        getWeather(field.value);
    });
}

citySelect.addEventListener("change", () => {
    if (document.querySelector("#weather-output")) {
        getWeather(citySelect.value);
    } else if (document.querySelector("#forecast-output")) {
        const days = amountSelect.value.split('-')[0];
        getForecast(citySelect.value, days);
    }
});

if (btnForecast && document.querySelector("#forecast-output")) {
    btnForecast.addEventListener("click", () => {
        const city = field.value.trim() ? field.value.trim() : citySelect.value;
        const days = amountSelect.value;
        getForecast(city, days);
    });
}

if (document.querySelector("#forecast-output")) {
    const city = citySelect.value;
    const days = amountSelect.value;
    getForecast(city, days);
}

function showHourModal(hourData){
    const time = hourData.time.split(' ')[1];

    modal.innerHTML = `
    <button class="close-modal" title="Close">&times;</button>  
    <h2>Погода на ${time}</h2>
    <div style="display:flex;align-items:center;gap:0.7em;margin-bottom:0.5em;">
        <img src="https:${hourData.condition.icon}" alt="${hourData.condition.text}" style="width:60px;height:60px;">
        <span style="font-size:1.1em;">${hourData.condition.text}</span>
    </div>
    <div class="modal-grid">
    <div class="modal-card">
        <div class="modal-label">Температура:</div>
        ${hourData.temp_c} °C
    </div>
    <div class="modal-card">
        <div class="modal-label">Відчувається як:</div>
        ${hourData.feelslike_c} °C
    </div>
    <div class="modal-card">
        <div class="modal-label">Швидкість вітру:</div>
        ${hourData.wind_kph} км/год
    </div>
    <div class="modal-card">
        <div class="modal-label">Пориви вітру:</div>
        ${hourData.gust_kph} км/год
    </div>
    <div class="modal-card">
        <div class="modal-label">Напрямок вітру:</div>
            ${hourData.wind_dir || '-'}
    </div>
    <div class="modal-card">
        <div class="modal-label">Хмарність:</div>
        ${hourData.cloud} %
    </div>
    <div class="modal-card">
        <div class="modal-label">Вологість:</div>
        ${hourData.humidity} %
    </div>
    <div class="modal-card">
        <div class="modal-label">Тиск:</div>
        ${hourData.pressure_mb} mbar
    </div>
    </div>
    `
    overlay.style.display = 'flex';
    modal.querySelector('.close-modal').onclick = () => {
        overlay.style.display = 'none';
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    };
    
}

function enableHourModalHandlers() {
    document.querySelectorAll('.forecast-hour').forEach((el, idx) => {
        el.onclick = function() {
            const dayIdx = el.closest('.forecast-day').dataset.dayIdx;
            const hourIdx = el.dataset.hourIdx;
            if (window._forecastData && window._forecastData[dayIdx] && window._forecastData[dayIdx][hourIdx]) {
                showHourModal(window._forecastData[dayIdx][hourIdx]);
            }
        };
    });
}
