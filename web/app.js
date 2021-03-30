const NUM_HOURLY_FORECAST_ELEMENT = 2;
const OFFSET_SIDE_INDEX = 3;
const MAX_NUM_HOURS = 24;

let locationZone = document.getElementsByClassName("location-zone");
let locationDate = document.getElementsByClassName("location-date");
let temperatureDegree = document.getElementsByClassName("temperature-degree");
let maxTemperature = document.getElementsByClassName("temperature-info-max");
let minTemperature = document.getElementsByClassName("temperature-info-low");
let humidity = document.getElementsByClassName("temperature-info-rain");
let wind = document.getElementsByClassName("temperature-info-wind");
let sunrise = document.getElementsByClassName("temperature-info-sunrise");
let sunset = document.getElementsByClassName("temperature-info-sunset");
let icon = document.getElementsByClassName("temperature-icon");
let searchBar = document.getElementById("search-city");
let searchButton = document.getElementsByClassName("search-confirm");
let content = document.getElementsByClassName("content");
let wrapLoader = document.getElementsByClassName("wrap-loader");
let sideMenu = document.getElementsByClassName("side-menu");
let hamburgerBtn = document.getElementsByClassName("hamburger-btn");
let sideContent = document.getElementsByClassName("side-content");
let sideContentHourlyForecast = document.getElementsByClassName("side-content-info-hourly-forecast");
let hourlyForecastElement = document.getElementsByClassName("hourly-forecast-element");
let double_up_wrapper = document.getElementsByClassName("angle-double-up-wrapper");
let double_down_wrapper = document.getElementsByClassName("angle-double-down-wrapper");

let temperatureDegreeValue;
let maxTemperatureValue;
let minTemperatureValue;

let low_side_index = 0;
let high_side_index = OFFSET_SIDE_INDEX - 1;

const currentWeatherApi = {
    key: "42c3e3f5f36a943d8d948de6dd8b9dcc",
    url: "https://api.openweathermap.org/data/2.5/weather",
    oneCallUrl: "https://api.openweathermap.org/data/2.5/onecall"
};

function duplicateElement(toDuplicate, parentElement, numDuplications) {
    for (let i = 0; i < numDuplications; i++) {
        let clone = toDuplicate.cloneNode(true);
        parentElement.appendChild(clone);
    }
}

function dismissLoader() {
    content[0].style.display = "flex";
    wrapLoader[0].style.display = "none";
}

function calculateSideHours(time, timezone) {
    let sideTime = new Date(0);
    sideTime.setUTCSeconds(time);
    let soughtTime = calculateUtcDate(timezone, sideTime.getMinutes(), sideTime.getHours(), null);
    return fixDateTimeValues(soughtTime.minutes, soughtTime.hours, null, null);
}

function successHandlerSideContent(data) {
    //console.log(data);
    window.sessionStorage.setItem("weatherSideContent", JSON.stringify(data));
    window.sessionStorage.setItem("weatherSideInfoState", JSON.stringify({state: true}));
    let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
    for (let i = 0; i < OFFSET_SIDE_INDEX; i++)
        setHourlyForecastElement(data, timezone, i, i);
    dismissLoader();
}

function failureHandlerSideContent(jqXHR) {
    if (jqXHR !== null && jqXHR.status == 404)
        console.log("error 404");
    else
        console.log("other error");
    window.sessionStorage.setItem("weatherSideInfoState", JSON.stringify({state: false}));
    for (let i = 0; i < OFFSET_SIDE_INDEX; i++) {
        hourlyForecastElement[i].querySelector(".hourly-forecast-time").innerHTML = "N/A";
        hourlyForecastElement[i].querySelector(".hourly-forecast-main-temp").innerHTML = "N/A";
        hourlyForecastElement[i].querySelector(".side-temperature-icon").src = "images/weather_sunset.svg";
    }
    dismissLoader();
}

function setSideContent(contentStatus) {
    if (contentStatus === true) {
        let lat = JSON.parse(window.sessionStorage.getItem("weatherData")).coord.lat;
        let long = JSON.parse(window.sessionStorage.getItem("weatherData")).coord.lon;
        $.get(currentWeatherApi.oneCallUrl, {lat: lat, lon: long, appid: currentWeatherApi.key}, successHandlerSideContent)
            .fail(failureHandlerSideContent);
    }
    else
        failureHandlerSideContent(null);
}

function successHandler(data) {
    window.sessionStorage.setItem("weatherData", JSON.stringify(data));
    trueState();
    //console.log(data);
    setWeather(data);
    setSideContent(true);
}

function failureHandler(jqXHR) {
    if (jqXHR !== null && jqXHR.status == 404)
        console.log("error 404");
    else
        console.log("other error");
    falseState();
    setSideContent(false);
}

window.addEventListener("load", () => {
    let weatherData = window.sessionStorage.getItem("weatherData");
    let weatherAppState = window.sessionStorage.getItem("weatherAppState");
    duplicateElement(hourlyForecastElement[0], sideContentHourlyForecast[0], NUM_HOURLY_FORECAST_ELEMENT);
    if (weatherAppState === null)
        $.get(currentWeatherApi.url, {q: "sydney", appid: currentWeatherApi.key}, successHandler).fail(failureHandler);
    else if (JSON.parse(weatherAppState).state === true)
        $.get(currentWeatherApi.url, {q: JSON.parse(weatherData).name, appid: currentWeatherApi.key}, successHandler).fail(failureHandler);
    else
        failureHandler(null);
});

function setWeather(data) {
    locationZone[0].innerHTML = data.name + " (" + data.sys.country + ")";
    try {
        setDate(locationDate, data.timezone);
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
    try {
        temperatureDegreeValue = setTemperature(temperatureDegree[0], "K", "C", data.main.temp);
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
    setTemperatureInfo(data, maxTemperature, minTemperature, humidity, wind, sunrise, sunset);
    try {
        setIcon(icon[0], data.weather[0].icon);
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

function setIcon(icon, iconCode) {
    if (iconCode === "01d")
        icon.src = "images/day.svg";
    else if (iconCode === "02d")
        icon.src = "images/cloudy-day-1.svg";
    else if (iconCode === "03d" || iconCode === "04d" || iconCode === "03n" || iconCode === "04n")
        icon.src = "images/cloudy.svg";
    else if (iconCode === "09d" || iconCode === "09n" || iconCode === "10n")
        icon.src = "images/rainy-6.svg";
    else if (iconCode === "10d")
        icon.src = "images/rainy-3.svg";
    else if (iconCode === "11d" || iconCode === "11n")
        icon.src = "images/thunder.svg";
    else if (iconCode === "13d" || iconCode === "13n")
        icon.src = "images/snowy-5.svg";
    else if (iconCode === "01n")
        icon.src = "images/night.svg";
    else if (iconCode === "02n")
        icon.src = "images/cloudy-night-1.svg";
    else {
        icon.src = "images/weather_sunset.svg";
        throw {name: "IllegalIconCode", message: "the icon code cannot be mapped into any icon"}
    }
}

function setTemperatureInfo(data, maxTemperature, minTemperature, humidity, wind, sunrise, sunset) {
    let maxTemperatureElement = maxTemperature[0].querySelector(".temperature-info-value");
    maxTemperatureValue = setTemperature(maxTemperatureElement, "K", "C", data.main.temp_max);
    let minTemperatureElement = minTemperature[0].querySelector(".temperature-info-value");
    minTemperatureValue = setTemperature(minTemperatureElement, "K", "C", data.main.temp_min);
    let humidityValue = data.main.humidity + "%";
    setTemperatureInfoValue(humidity, humidityValue);
    let windSpeedValue = data.wind.speed + "m/s";
    setTemperatureInfoValue(wind, windSpeedValue);
    setSunTime(sunrise, data.sys.sunrise, data.timezone);
    setSunTime(sunset, data.sys.sunset, data.timezone);
}

function setSunTime(sunInfo, localSunTime, timezone) {
    let sunTime = new Date(0);
    sunTime.setUTCSeconds(localSunTime);
    let soughtSunTime = calculateUtcDate(timezone, sunTime.getMinutes(), sunTime.getHours(), null);
    let fixedSunTime = fixDateTimeValues(soughtSunTime.minutes, soughtSunTime.hours, null, null);
    let sunTimeValue = fixedSunTime.fixedHours + ":" + fixedSunTime.fixedMinutes;
    setTemperatureInfoValue(sunInfo, sunTimeValue);
}

function setTemperatureInfoValue (temperatureInfo, value) {
    let children = temperatureInfo[0].children;
    for (i = 0; i < children.length; i++) {
        if (children[i].className === "temperature-info-value")
            children[i].innerHTML = value;
    }
}

function degreeConverter(temperatureValue, unitMeasureStart, unitMeasureEnd) {
    if (unitMeasureStart === "K" && unitMeasureEnd === "C")
        temperatureValue = temperatureValue - 273.15;
    else if (unitMeasureStart === "K" && unitMeasureEnd === "F")
        temperatureValue = 1.80 * (temperatureValue - 273.15) + 32;
    else if (unitMeasureStart === "C" && unitMeasureEnd === "F")
        temperatureValue = (1.80 * temperatureValue) + 32;
    else if (unitMeasureStart === "C" && unitMeasureEnd === "K")
        temperatureValue = temperatureValue + 273.15;
    else if (unitMeasureStart === "F" && unitMeasureEnd === "C")
        temperatureValue = (temperatureValue - 32) / 1.80;
    else if (unitMeasureStart === "F" && unitMeasureEnd === "K")
        temperatureValue = (temperatureValue - 32) / 1.80 + 273.15;
    else {
        if ((unitMeasureStart !== "C" && unitMeasureStart !== "F" && unitMeasureStart !== "K") ||
            (unitMeasureEnd !== "C" && unitMeasureEnd !== "F" && unitMeasureEnd !== "K")) {
            throw {name: "IllegalUnitMeasures", message: "the unit measures doesn't fit any valid conversion pattern"}
        }
    }
    return temperatureValue;
}

function setTemperature(temperatureDegree, unitMeasureStart, unitMeasureEnd, temperatureValue) {
    temperatureValue = degreeConverter(temperatureValue, unitMeasureStart, unitMeasureEnd);
    let intValue = Math.floor(temperatureValue);
    let decimalValue = temperatureValue - intValue;
    decimalValue = Math.floor(decimalValue * 10);
    let stringTemperatureValue;
    if (decimalValue > 0)
        stringTemperatureValue = intValue + "." + decimalValue;
    else
        stringTemperatureValue = intValue;

    if (unitMeasureEnd === "C")
        temperatureDegree.innerHTML = stringTemperatureValue + "°C";
    else if (unitMeasureEnd === "F")
        temperatureDegree.innerHTML = stringTemperatureValue + "°F";
    else
        temperatureDegree.innerHTML = stringTemperatureValue + "K";
    return temperatureValue;
}

function setDate(locationDate, timezone) {
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    let currentDay = currentDate.getDate();
    let currentMonth = currentDate.getMonth() + 1;
    let currentYear = currentDate.getFullYear();
    let soughtHour;
    let soughtMinutes;
    let soughtDay;
    let soughtMonth;
    let soughtYear;
    let soughtDate = calculateUtcDate(timezone, currentMinutes, currentHour, currentDay);
    soughtMinutes = soughtDate.minutes;
    soughtHour = soughtDate.hours;
    soughtDay = soughtDate.days;
    // day/month/year settings
    if (currentMonth === 1) {
        if (soughtDay > 31) {
            soughtDay -= 31;
            soughtMonth = currentMonth + 1;
            soughtYear = currentYear;
        }
        else if (soughtDay <= 0) {
            soughtDay = 31 + soughtDay;
            soughtMonth = 12;
            soughtYear = currentYear - 1;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else if (currentMonth === 2) {
        if (soughtDay > 28 && !leapMonth(currentYear)) {
            soughtDay -= 28;
            soughtMonth = currentMonth + 1;
            soughtYear = currentYear;
        }
        else if (soughtDay > 29 && leapMonth(currentYear)) {
            soughtDay -= 29;
            soughtMonth = currentMonth + 1;
            soughtYear = currentYear;
        }
        else if (soughtDay <= 0) {
            soughtDay = 31 + soughtDay;
            soughtMonth = currentMonth - 1;
            soughtYear = currentYear;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else if (currentMonth === 3) {
        if (soughtDay > 31) {
            soughtDay -= 31;
            soughtMonth = currentMonth + 1;
            soughtYear = currentYear;
        }
        else if (soughtDay <= 0) {
            if (leapMonth(currentYear))
                soughtDay = 29 + soughtDay;
            else
                soughtDay = 28 + soughtDay;
            soughtMonth = currentMonth - 1;
            soughtYear = currentYear;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else if (currentMonth === 4 || currentMonth === 6 || currentMonth === 9 || currentMonth === 11) {
        if (soughtDay > 30) {
            soughtDay -= 30;
            soughtMonth = currentMonth + 1;
            soughtYear = currentYear;
        }
        else if (soughtDay <= 0) {
            soughtDay = 31 + soughtDay;
            soughtMonth = currentMonth - 1;
            soughtYear = currentYear;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else if (currentMonth === 5 || currentMonth === 7 || currentMonth === 10) {
        if (soughtDay > 31) {
            soughtDay -= 31;
            soughtMonth = currentMonth + 1;
            soughtYear = currentYear;
        }
        else if (soughtDay <= 0) {
            soughtDay = 30 + soughtDay;
            soughtMonth = currentMonth - 1;
            soughtYear = currentYear;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else if (currentMonth === 8) {
        if (soughtDay > 31) {
            soughtDay -= 31;
            soughtMonth = currentMonth + 1;
            soughtYear = currentYear;
        }
        else if (soughtDay <= 0) {
            soughtDay = 31 + soughtDay;
            soughtMonth = currentMonth - 1;
            soughtYear = currentYear;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else if (currentMonth === 12) {
        if (soughtDay > 31) {
            soughtDay -= 31;
            soughtMonth = 1;
            soughtYear = currentYear + 1;
        }
        else if (soughtDay <= 0) {
            soughtDay = 30 + soughtDay;
            soughtMonth = currentMonth - 1;
            soughtYear = currentYear;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else {
        throw {name:"IllegalMonth", message:"month value is not >= 1 and <= 12"}
    }
    let fixedDateTime = fixDateTimeValues(soughtMinutes, soughtHour, soughtDay, soughtMonth);
    locationDate[0].querySelector("span").innerHTML = soughtYear + "/" + fixedDateTime.fixedMonths + "/" + fixedDateTime.fixedDays + " Time " + fixedDateTime.fixedHours + ":" + fixedDateTime.fixedMinutes;
}

function leapMonth(currentYear) {
    return (currentYear % 4) === 0;
}

function calculateUtcDate(delay, minutes, hours, days) {
    let delayUTC = delay / 3600;
    let delayHours = Math.floor(delayUTC);
    let decimalUTC = delayUTC - delayHours;
    let delayMinutes = (decimalUTC * 60) / 100;
    let localDelayUTC = (new Date().getTimezoneOffset() * -1) / 60;
    let localDelayHours = Math.floor(localDelayUTC);
    let localDecimalUTC = localDelayUTC - localDelayHours;
    let localDelayMinutes = (localDecimalUTC * 60) / 100;
    let diffMinutes = delayMinutes - localDelayMinutes;
    let diffHours = delayHours - localDelayHours;
    let diffDay = 0;
    if (diffMinutes >= 60) {
        diffMinutes -= 60;
        diffHours += 1;
    }
    else if (diffMinutes <= -60) {
        diffMinutes += 60;
        diffHours -= 1;
    }
    if (diffHours >= 24) {
        diffHours -= 24;
        diffDay += 1;
    }
    else if (diffHours <= -24) {
        diffHours += 24;
        diffDay -= 1;
    }
    let soughtMinutes = minutes + diffMinutes;
    let soughtHour;
    let soughtDay;
    if (soughtMinutes >= 60) {
        soughtMinutes -= 60;
        soughtHour = 1;
    }
    else if (soughtMinutes < 0) {
        soughtMinutes = 60 + soughtMinutes;
        soughtHour = - 1;
    }
    else
        soughtHour = 0;
    soughtHour +=  hours + diffHours;
    if (soughtHour >= 24) {
        soughtHour -= 24;
        soughtDay = 1;
    }
    else if (soughtHour < 0) {
        soughtHour = 24 + soughtHour;
        soughtDay = - 1;
    }
    else
        soughtDay = 0;
    if (days !== null && days !== undefined)
        soughtDay += days + diffDay;
    else
        soughtDay = 0;
    return {
        minutes: soughtMinutes,
        hours: soughtHour,
        days: soughtDay
    }
}

function fixDateTimeValues(minutes, hours, days, months) {
    let fixedMinutes;
    let fixedHours;
    let fixedDays;
    let fixedMonths;
    if (minutes >= 0 && minutes <= 9)
        fixedMinutes = "0" + minutes;
    else
        fixedMinutes = minutes;

    if (hours >= 0 && hours <= 9)
        fixedHours = "0" + hours;
    else
        fixedHours = hours;

    if (days !== null && days >= 1 && days <= 9)
        fixedDays = "0" + days;
    else
        fixedDays = days;

    if (months !== null && months >= 1 && months <= 9)
        fixedMonths = "0" + months;
    else
        fixedMonths = months;

    return {
        fixedMinutes: fixedMinutes,
        fixedHours: fixedHours,
        fixedDays: fixedDays,
        fixedMonths: fixedMonths
    }
}

function modifyDegreeUnitMeasure() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true) {
        let maxTemperatureElement = maxTemperature[0].querySelector(".temperature-info-value");
        let minTemperatureElement = minTemperature[0].querySelector(".temperature-info-value");
        let mainUnitMeasureStart = findUnitMeasureStart(temperatureDegree[0].innerHTML);
        let mainUnitMeasureEnd = findUnitMeasureEnd(mainUnitMeasureStart);
        let maxUnitMeasureStart = findUnitMeasureStart(maxTemperatureElement.innerHTML);
        let minUnitMeasureStart = findUnitMeasureStart(minTemperatureElement.innerHTML);
        temperatureDegreeValue = setTemperature(temperatureDegree[0], mainUnitMeasureStart, mainUnitMeasureEnd, temperatureDegreeValue);
        maxTemperatureValue = setTemperature(maxTemperatureElement, maxUnitMeasureStart, mainUnitMeasureEnd, maxTemperatureValue);
        minTemperatureValue = setTemperature(minTemperatureElement, minUnitMeasureStart, mainUnitMeasureEnd, minTemperatureValue)
    }
}

function findUnitMeasureStart(temperatureString) {
    let separatorIndex = temperatureString.indexOf("°");
    let unitMeasure;
    if (separatorIndex !== -1)
        unitMeasure = temperatureString.substring(separatorIndex + 1, temperatureString.length);
    else
        unitMeasure = "K";
    return unitMeasure;
}

function findUnitMeasureEnd(unitMeasureStart) {
    let unitMeasureEnd;
    if (unitMeasureStart === "C")
        unitMeasureEnd = "F";
    else if (unitMeasureStart === "F")
        unitMeasureEnd = "K";
    else
        unitMeasureEnd = "C";
    return unitMeasureEnd;
}

function modifyMaxDegreeUnitMeasure() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true) {
        let maxTemperatureElement = maxTemperature[0].querySelector(".temperature-info-value");
        let maxUnitMeasureStart = findUnitMeasureStart(maxTemperatureElement.innerHTML);
        let maxUnitMeasureEnd = findUnitMeasureEnd(maxUnitMeasureStart);
        maxTemperatureValue = setTemperature(maxTemperatureElement, maxUnitMeasureStart, maxUnitMeasureEnd, maxTemperatureValue);
    }
}

function modifyMinDegreeUnitMeasure() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true) {
        let minTemperatureElement = minTemperature[0].querySelector(".temperature-info-value");
        let minUnitMeasureStart = findUnitMeasureStart(minTemperatureElement.innerHTML);
        let minUnitMeasureEnd = findUnitMeasureEnd(minUnitMeasureStart);
        minTemperatureValue = setTemperature(minTemperatureElement, minUnitMeasureStart, minUnitMeasureEnd, minTemperatureValue);
    }
}

function searchCity() {
    let city = searchBar.value.trim();
    if (city !== "") {
        $.get(currentWeatherApi.url, {q: city, appid: currentWeatherApi.key}, data => {
            window.sessionStorage.setItem("weatherData", JSON.stringify(data));
            console.log(data);
            setWeather(data);
            if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === false)
                trueState();
        }).fail(jqXHR => {
            window.sessionStorage.removeItem("weatherData");
            if (jqXHR.status == 404)
                console.log("error 404");
            else
                console.log("other error");
            falseState();
        });
    }
    else
        window.alert("Please insert a city name!");
    searchBar.value = "";
}

function trueState() {
    searchBar.classList.add("search-city-true-state");
    searchBar.classList.remove("search-city-false-state");
    searchButton[0].classList.add("search-confirm-true-state");
    searchButton[0].classList.remove("search-confirm-false-state");
    locationDate[0].querySelector(".fa-refresh").classList.add("fa-refresh-true-state");
    locationDate[0].querySelector(".fa-refresh").classList.remove("fa-refresh-false-state");
    temperatureDegree[0].classList.add("temperature-degree-true-state");
    temperatureDegree[0].classList.remove("temperature-degree-false-state");
    maxTemperature[0].classList.add("temperature-info-max-true-state");
    maxTemperature[0].classList.remove("temperature-info-max-false-state");
    minTemperature[0].classList.add("temperature-info-low-true-state");
    minTemperature[0].classList.remove("temperature-info-low-false-state");
    window.sessionStorage.setItem("weatherAppState", JSON.stringify({state: true}));
}

function falseState() {
    window.sessionStorage.setItem("weatherAppState", JSON.stringify({state: false}));
    locationZone[0].innerHTML = "N/A City";
    locationDate[0].querySelector("span").innerHTML = "N/A Date";
    temperatureDegree[0].innerHTML = "N/A Temperature";
    maxTemperature[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    minTemperature[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    humidity[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    wind[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    sunrise[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    sunset[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    icon[0].src = "images/weather_sunset.svg";
    searchBar.classList.add("search-city-false-state");
    searchBar.classList.remove("search-city-true-state");
    searchButton[0].classList.add("search-confirm-false-state");
    searchButton[0].classList.remove("search-confirm-true-state");
    locationDate[0].querySelector(".fa-refresh").classList.add("fa-refresh-false-state");
    locationDate[0].querySelector(".fa-refresh").classList.remove("fa-refresh-true-state");
    temperatureDegree[0].classList.add("temperature-degree-false-state");
    temperatureDegree[0].classList.remove("temperature-degree-true-state");
    maxTemperature[0].classList.add("temperature-info-max-false-state");
    maxTemperature[0].classList.remove("temperature-info-max-true-state");
    minTemperature[0].classList.add("temperature-info-low-false-state");
    minTemperature[0].classList.remove("temperature-info-low-true-state");
}

function refresh() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true)
        window.location.reload();
}

function openSideMenu() {
    sideMenu[0].classList.toggle("side-menu-open");
    sideMenu[0].classList.toggle("side-menu-closed");
    if (sideMenu[0].classList.contains("side-menu-open")) {
        hamburgerBtn[0].classList.add("hamburger-btn-open");
        hamburgerBtn[0].classList.remove("hamburger-btn-closed")
    }
    else {
        hamburgerBtn[0].classList.add("hamburger-btn-closed");
        hamburgerBtn[0].classList.remove("hamburger-btn-open");
    }
}

function openSideContent() {
    if (sideContent[0].classList.contains("side-content-open") === false) {
        sideContent[0].classList.add("side-content-open");
        sideContent[0].classList.remove("side-content-close");
    }
}

function closeSideContent() {
    if (sideContent[0].classList.contains("side-content-close") === false) {
        sideContent[0].classList.add("side-content-close");
        sideContent[0].classList.remove("side-content-open");
    }
    if (low_side_index > 0) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        defaultHourlyForecast(data, timezone);
    }
}

function displayNextElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
    if (state !== null && state.state && high_side_index < MAX_NUM_HOURS - 1) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (high_side_index + OFFSET_SIDE_INDEX < MAX_NUM_HOURS) {
            for (let i = 1; i <= OFFSET_SIDE_INDEX; i++)
                setHourlyForecastElement(data, timezone, i - 1, high_side_index + i);
            low_side_index += OFFSET_SIDE_INDEX;
            high_side_index += OFFSET_SIDE_INDEX;
            if (high_side_index === MAX_NUM_HOURS - 1) {
                double_down_wrapper[0].classList.add("disable-double");
                double_down_wrapper[0].classList.remove("active-double");
            }
        } else {
            let j = OFFSET_SIDE_INDEX - 1;
            for (let i = MAX_NUM_HOURS - 1; i >= MAX_NUM_HOURS - OFFSET_SIDE_INDEX; i--) {
                setHourlyForecastElement(data, timezone, j, i);
                j--;
            }
            low_side_index = MAX_NUM_HOURS - OFFSET_SIDE_INDEX;
            high_side_index = MAX_NUM_HOURS - 1;
            double_down_wrapper[0].classList.add("disable-double");
            double_down_wrapper[0].classList.remove("active-double");
        }
        if (double_up_wrapper[0].classList.contains("disable-double")) {
            double_up_wrapper[0].classList.add("active-double");
            double_up_wrapper[0].classList.remove("disable-double");
        }
    }
}

function displayPreviousElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
    if (state !== null && state.state && low_side_index > 0) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (low_side_index - OFFSET_SIDE_INDEX >= 0) {
            for (let i = 0; i < OFFSET_SIDE_INDEX; i++)
                setHourlyForecastElement(data, timezone, i, low_side_index - OFFSET_SIDE_INDEX + i);
            low_side_index -= OFFSET_SIDE_INDEX;
            high_side_index -= OFFSET_SIDE_INDEX;
            if (low_side_index === 0) {
                double_up_wrapper[0].classList.add("disable-double");
                double_up_wrapper[0].classList.remove("active-double");
            }
        }
        else
            defaultHourlyForecast(data, timezone);
        if (double_down_wrapper[0].classList.contains("disable-double")) {
            double_down_wrapper[0].classList.add("active-double");
            double_down_wrapper[0].classList.remove("disable-double");
        }
    }
}

function setHourlyForecastElement(data, timezone, hourly_forecast_index, data_index) {
    let time = calculateSideHours(data.hourly[data_index].dt, timezone);
    hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-time").innerHTML = time.fixedHours + ":" + time.fixedMinutes;
    setTemperature(hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-main-temp"), "K", "C", data.hourly[data_index].temp);
    hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-humidity").querySelector(".hourly-forecast-value").innerHTML = data.hourly[data_index].humidity + "%";
    hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-wind-speed").querySelector(".hourly-forecast-value").innerHTML = data.hourly[data_index].wind_speed + "m/s";
    setIcon(hourlyForecastElement[hourly_forecast_index].querySelector(".side-temperature-icon"), data.hourly[data_index].weather[0].icon);
}

function defaultHourlyForecast(data, timezone) {
    for (let i = 0; i < OFFSET_SIDE_INDEX; i++)
        setHourlyForecastElement(data, timezone, i, i);
    low_side_index = 0;
    high_side_index = OFFSET_SIDE_INDEX - 1;
    double_up_wrapper[0].classList.add("disable-double");
    double_up_wrapper[0].classList.remove("active-double");
    if (double_down_wrapper[0].classList.contains("disable-double")) {
        double_down_wrapper[0].classList.add("active-double");
        double_down_wrapper[0].classList.remove("disable-double");
    }
}