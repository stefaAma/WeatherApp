const NUM_HOURLY_FORECAST_ELEMENT = 2;
const NUM_DAILY_FORECAST_ELEMENT = 1;
const NUM_POLLUTION_FORECAST_ELEMENT = 1;
const DAILY_ELEMENTS_OFFSET = 2;
const OFFSET_SIDE_INDEX = 3;
const POLLUTION_STARTING_INDEX = 129;
const POLLUTION_ELEMENTS_OFFSET = 2;
const MAX_NUM_HOURS = 24;
const MAX_NUM_DAYS = 7;
const MAX_NUM_POLLUTION_HOURS = POLLUTION_STARTING_INDEX + 24;

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
let searchLabel = document.getElementsByClassName("search-label");
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
let sideContentDailyForecast = document.getElementsByClassName("side-content-info-daily-forecast");
let dailyForecastElement = document.getElementsByClassName("daily-forecast-element");
let sideContentPollutionForecast = document.getElementsByClassName("side-content-info-pollution-forecast");
let pollutionForecastElement = document.getElementsByClassName("pollution-forecast-element");
let alert = document.getElementsByClassName("alert");
let menuItemWrapper = document.getElementById("menu-item-wrapper");

let temperatureDegreeValue;
let maxTemperatureValue;
let minTemperatureValue;

let low_side_index = 0;
let high_side_index = 0;
let lastOptionChosen = -1;

const currentWeatherApi = {
    key: "42c3e3f5f36a943d8d948de6dd8b9dcc",
    url: "https://api.openweathermap.org/data/2.5/weather",
    oneCallUrl: "https://api.openweathermap.org/data/2.5/onecall",
    pollutionUrl: "http://api.openweathermap.org/data/2.5/air_pollution/forecast"
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

function calculateSideDate(date, timezone) {
    let sideDate = new Date(0);
    sideDate.setUTCSeconds(date);
    let soughtTime = calculateUtcDate(timezone, sideDate.getMinutes(), sideDate.getHours(), sideDate.getDate());
    let soughtDate = calculateDate(soughtTime.days, sideDate.getMonth() + 1, sideDate.getFullYear());
    return fixDateTimeValues(soughtTime.minutes, soughtTime.hours, soughtDate.soughtDay, soughtDate.soughtMonth, soughtDate.soughtYear);
}

function successHandlerPollutionContent(data) {

    console.log(data);

    window.sessionStorage.setItem("weatherPollutionContent", JSON.stringify(data));
    window.sessionStorage.setItem("weatherPollutionInfoState", JSON.stringify({state: true}));
    let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
    setPollutionElementsToDefault(data, timezone);
    dismissLoader();
}

function failureHandlerPollutionContent(jqXHR) {
    if (jqXHR !== null && jqXHR.status == 404)
        console.log("error 404");
    else
        console.log("other error");
    window.sessionStorage.setItem("weatherPollutionInfoState", JSON.stringify({state: false}));
    for (let i = 0; i < POLLUTION_ELEMENTS_OFFSET; i++)
        pollutionForecastElement[i].querySelector(".pollution-forecast-time").innerHTML = "N/A";
    dismissLoader();
}

function successHandlerSideContent(data) {

    console.log(data);

    window.sessionStorage.setItem("weatherSideContent", JSON.stringify(data));
    window.sessionStorage.setItem("weatherSideInfoState", JSON.stringify({state: true}));
    let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
    setHourlyElementsToDefault(data, timezone);
    setDailyElementsToDefault(data, timezone);
    let lat = JSON.parse(window.sessionStorage.getItem("weatherData")).coord.lat;
    let long = JSON.parse(window.sessionStorage.getItem("weatherData")).coord.lon;
    $.get(currentWeatherApi.pollutionUrl, {lat: lat, lon: long, appid: currentWeatherApi.key}, successHandlerPollutionContent)
        .fail(failureHandlerPollutionContent);
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
    disableArrows();
    failureHandlerPollutionContent(null);
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
    duplicateElement(dailyForecastElement[0], sideContentDailyForecast[0], NUM_DAILY_FORECAST_ELEMENT);
    duplicateElement(pollutionForecastElement[0], sideContentPollutionForecast[0], NUM_POLLUTION_FORECAST_ELEMENT);
    if (weatherAppState === null)
        $.get(currentWeatherApi.url, {q: "sydney", appid: currentWeatherApi.key}, successHandler).fail(failureHandler);
    else if (JSON.parse(weatherAppState).state === true)
        $.get(currentWeatherApi.url, {q: JSON.parse(weatherData).name, appid: currentWeatherApi.key}, successHandler).fail(failureHandler);
    else
        failureHandler(null);
});

searchBar.addEventListener("keypress", handleKeyPress);

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

function calculateDate(soughtDay, currentMonth, currentYear) {
    let soughtMonth;
    let soughtYear;
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
    else
        throw {name:"IllegalMonth", message:"month value is not >= 1 and <= 12"};
    return {
        soughtDay: soughtDay,
        soughtMonth: soughtMonth,
        soughtYear: soughtYear
    };
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
    let soughtTime = calculateUtcDate(timezone, currentMinutes, currentHour, currentDay);
    soughtMinutes = soughtTime.minutes;
    soughtHour = soughtTime.hours;
    soughtDay = soughtTime.days;
    let soughtDate = calculateDate(soughtDay, currentMonth, currentYear);
    soughtDay = soughtDate.soughtDay;
    soughtMonth = soughtDate.soughtMonth;
    soughtYear = soughtDate.soughtYear;
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

function fixDateTimeValues(minutes, hours, days, months, year) {
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
        fixedMonths: fixedMonths,
        year: year
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

function handleKeyPress(e) {
    let key = e.keyCode || e.which;
    if (key === 13)
        searchCity();
}

function searchCity() {
    let city = searchBar.value.trim();
    if (city !== "") {
        window.sessionStorage.setItem("weatherData", JSON.stringify({name: city}));
        window.sessionStorage.setItem("weatherAppState", JSON.stringify({state: true}));
        window.location.reload();
    }
    else
        window.alert("Please insert a city name!");
    searchBar.value = "";
}

function trueState() {
    searchBar.classList.add("search-city-true-state");
    searchBar.classList.remove("search-city-false-state");
    searchLabel[0].classList.add("search-label-true-state");
    searchLabel[0].classList.remove("search-label-false-state");
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
    document.querySelector("body").style.background = "linear-gradient(to bottom, #e52d27, #b31217)";
    locationZone[0].innerHTML = "N/A City";
    locationDate[0].querySelector("span").innerHTML = "N/A Date";
    temperatureDegree[0].innerHTML = "N/A Temp.";
    maxTemperature[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    minTemperature[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    humidity[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    wind[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    sunrise[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    sunset[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    icon[0].src = "images/weather_sunset.svg";
    searchBar.classList.add("search-city-false-state");
    searchBar.classList.remove("search-city-true-state");
    searchLabel[0].classList.add("search-label-false-state");
    searchLabel[0].classList.remove("search-label-true-state");
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
    disableArrows();
}

function disableArrows() {
    double_up_wrapper[0].classList.add("disable-double");
    double_up_wrapper[0].classList.remove("active-double");
    double_down_wrapper[0].classList.add("disable-double");
    double_down_wrapper[0].classList.remove("active-double");
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
        hamburgerBtn[0].classList.remove("hamburger-btn-closed");
        alert[0].style.animation = "fade-out-alert 1.5s";
        menuItemWrapper.classList.remove("menu-item-wrapper-closed");
        menuItemWrapper.classList.add("menu-item-wrapper-open");
    }
    else {
        hamburgerBtn[0].classList.add("hamburger-btn-closed");
        hamburgerBtn[0].classList.remove("hamburger-btn-open");
        alert[0].style.animation = "fade-in-alert 1.5s";
        menuItemWrapper.classList.remove("menu-item-wrapper-open");
        menuItemWrapper.classList.add("menu-item-wrapper-closed");
    }
}

function openSideContent() {
    sideContent[0].classList.add("side-content-open");
    sideContent[0].classList.remove("side-content-close");
}

function closeSideContent() {
    if (lastOptionChosen !== -1) {
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        if (lastOptionChosen === 0) {
            sideContentHourlyForecast[0].classList.add("side-content-info-hourly-forecast-closed");
            sideContentHourlyForecast[0].classList.remove("side-content-info-hourly-forecast-open");
            for (let i = 0; i < OFFSET_SIDE_INDEX; i++) {
                setHourlyForecastElement(data, timezone, i, i);
                removeThreeElementsAnimation(hourlyForecastElement, i);
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousHourlyElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextHourlyElements);
        }
        else if (lastOptionChosen === 1) {
            sideContentDailyForecast[0].classList.add("side-content-info-daily-forecast-closed");
            sideContentDailyForecast[0].classList.remove("side-content-info-daily-forecast-open");
            for (let i = 0; i < DAILY_ELEMENTS_OFFSET; i++) {
                setDailyForecastElement(data, timezone, i, i);
                removeTwoElementsAnimation(dailyForecastElement, i);
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousDailyElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextDailyElements);
        }
        else if (lastOptionChosen === 2) {
            let data = JSON.parse(window.sessionStorage.getItem("weatherPollutionContent"));
            sideContentPollutionForecast[0].classList.add("side-content-info-pollution-forecast-closed");
            sideContentPollutionForecast[0].classList.remove("side-content-info-pollution-forecast-open");
            let j = POLLUTION_STARTING_INDEX;
            for (let i = 0; i < POLLUTION_ELEMENTS_OFFSET; i++) {
                setPollutionForecastElement(data, timezone, i, j);
                removeTwoElementsAnimation(pollutionForecastElement, i);
                j++;
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousPollutionElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextPollutionElements);
        }
        lastOptionChosen = -1;
        low_side_index = 0;
        high_side_index = 0;
        sideContent[0].classList.add("side-content-close");
        sideContent[0].classList.remove("side-content-open");
    }
}

function setHourlyForecastElement(data, timezone, hourly_forecast_index, data_index) {
    if (JSON.parse(window.sessionStorage.getItem("weatherSideInfoState")).state) {
        let time = calculateSideHours(data.hourly[data_index].dt, timezone);
        hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-time").innerHTML = time.fixedHours + ":" + time.fixedMinutes;
        setTemperature(hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-main-temp"), "K", "C", data.hourly[data_index].temp);
        hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-humidity").querySelector(".hourly-forecast-value").innerHTML = data.hourly[data_index].humidity + "%";
        hourlyForecastElement[hourly_forecast_index].querySelector(".hourly-forecast-wind-speed").querySelector(".hourly-forecast-value").innerHTML = data.hourly[data_index].wind_speed + "m/s";
        setIcon(hourlyForecastElement[hourly_forecast_index].querySelector(".side-temperature-icon"), data.hourly[data_index].weather[0].icon);
    }
}

function setHourlyElementsToDefault(data, timezone) {
    for (let i = 0; i < OFFSET_SIDE_INDEX; i++)
        setHourlyForecastElement(data, timezone, i, i);
}

function setDailyElementsToDefault(data, timezone) {
    for (let i = 0; i < DAILY_ELEMENTS_OFFSET; i++)
        setDailyForecastElement(data, timezone, i, i);
}

function setPollutionElementsToDefault(data, timezone) {
    let j = POLLUTION_STARTING_INDEX;
    for (let i = 0; i < POLLUTION_ELEMENTS_OFFSET; i++) {
        setPollutionForecastElement(data, timezone, i, j);
        j++;
    }
}

function setPollutionForecastElement(data, timezone, pollution_forecast_index, data_index) {
    if (JSON.parse(window.sessionStorage.getItem("weatherPollutionInfoState")).state) {
        let date = calculateSideDate(data.list[data_index].dt, timezone);
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-time").innerHTML = date.year + "/" + date.fixedMonths + "/" + date.fixedDays + " Time: " + date.fixedHours + ":" + date.fixedMinutes;
        try {
            setPollutionAirQuality(data, pollution_forecast_index, data_index);
        } catch (e) {
            console.log("Exception: " + e.name + "\nMessage: " + e.message);
        }
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-CO").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.co + "μg/m3";
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-NO").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.no + "μg/m3";
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-NO-2").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.no2 + "μg/m3";
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-O-3").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.o3 + "μg/m3";
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-SO-2").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.so2 + "μg/m3";
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-NH-3").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.nh3 + "μg/m3";
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-PM-2-5").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.pm2_5 + "μg/m3";
        pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-PM-10").querySelector(".pollution-forecast-value").innerHTML = data.list[data_index].components.pm10 + "μg/m3";
    }
}

function setPollutionAirQuality(data, pollution_forecast_index, data_index) {
    let element = pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-air-quality").querySelector(".pollution-forecast-value");
    let placeholder = pollutionForecastElement[pollution_forecast_index].querySelector(".pollution-forecast-air-quality").querySelector(".pollution-forecast-placeholder");
    let air_quality_index = data.list[data_index].main.aqi;
    if (air_quality_index === 1) {
        element.innerHTML = "Good";
        element.style.color = "#1aff1a";
        placeholder.style.color = "#1aff1a";
    }
    else if (air_quality_index === 2) {
        element.innerHTML = "Fair";
        element.style.color = "#99ff33";
        placeholder.style.color = "#99ff33";
    }
    else if (air_quality_index === 3) {
        element.innerHTML = "Moderate";
        element.style.color = "#ffff1a";
        placeholder.style.color = "#ffff1a";
    }
    else if (air_quality_index === 4) {
        element.innerHTML = "Poor";
        element.style.color = "#ff751a";
        placeholder.style.color = "#ff751a";
    }
    else if (air_quality_index === 5) {
        element.innerHTML = "Very Poor";
        element.style.color = "#ff1a1a";
        placeholder.style.color = "#ff1a1a";
    }
    else
        throw {
            name: "AirQualityIndexException",
            message: "The air_quality_index isn't in range (1 - 5)"
        }
}

function defaultHourlyForecast(data, timezone) {
    for (let i = 0; i < OFFSET_SIDE_INDEX; i++) {
        setHourlyForecastElement(data, timezone, i, i);
        previousThreeElementsAnimation(hourlyForecastElement, i);
    }
    low_side_index = 0;
    high_side_index = OFFSET_SIDE_INDEX - 1;
    setDoubleWrapperToDefault();
}

function defaultDailyForecast(data, timezone) {
    for (let i = 0; i < DAILY_ELEMENTS_OFFSET; i++) {
        setDailyForecastElement(data, timezone, i, i);
        previousTwoElementsAnimation(dailyForecastElement, i);
    }
    low_side_index = 0;
    high_side_index = DAILY_ELEMENTS_OFFSET - 1;
    setDoubleWrapperToDefault();
}

function defaultPollutionForecast(data, timezone) {
    let j = POLLUTION_STARTING_INDEX;
    for (let i = 0; i < POLLUTION_ELEMENTS_OFFSET; i++) {
        setPollutionForecastElement(data, timezone, i, j);
        previousTwoElementsAnimation(pollutionForecastElement, i);
        j += 1;
    }
    low_side_index = POLLUTION_STARTING_INDEX;
    high_side_index = POLLUTION_STARTING_INDEX + (POLLUTION_ELEMENTS_OFFSET - 1);
    setDoubleWrapperToDefault();
}

function setDoubleWrapperToDefault() {
    double_up_wrapper[0].classList.add("disable-double");
    double_up_wrapper[0].classList.remove("active-double");
    if (double_down_wrapper[0].classList.contains("disable-double")) {
        double_down_wrapper[0].classList.add("active-double");
        double_down_wrapper[0].classList.remove("disable-double");
    }
}

function setDailyForecastElement(data, timezone, daily_forecast_index, data_index) {
    if (JSON.parse(window.sessionStorage.getItem("weatherSideInfoState")).state) {
        let date = calculateSideDate(data.daily[data_index].dt, timezone);
        let sunrise = calculateSideHours(data.daily[data_index].sunrise, timezone);
        let sunset = calculateSideHours(data.daily[data_index].sunset, timezone);
        dailyForecastElement[daily_forecast_index].querySelector(".daily-forecast-date").innerHTML = date.year + "/" + date.fixedMonths + "/" + date.fixedDays;
        dailyForecastElement[daily_forecast_index].querySelector(".daily-forecast-sunrise").querySelector(".daily-forecast-value").innerHTML = sunrise.fixedHours + ":" + sunrise.fixedMinutes;
        dailyForecastElement[daily_forecast_index].querySelector(".daily-forecast-sunset").querySelector(".daily-forecast-value").innerHTML = sunset.fixedHours + ":" + sunset.fixedMinutes;
        setTemperature(dailyForecastElement[daily_forecast_index].querySelector(".daily-forecast-day-temp").querySelector(".daily-forecast-value"), "K", "C", data.daily[data_index].temp.day);
        setTemperature(dailyForecastElement[daily_forecast_index].querySelector(".daily-forecast-night-temp").querySelector(".daily-forecast-value"), "K", "C", data.daily[data_index].temp.night);
        setIcon(dailyForecastElement[daily_forecast_index].querySelector(".side-temperature-icon"), data.daily[data_index].weather[0].icon);
    }
}

function displayHourlyForecastElements() {
    if (lastOptionChosen !== 0) {
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
        if (lastOptionChosen === 1) {
            sideContentDailyForecast[0].classList.add("side-content-info-daily-forecast-closed");
            sideContentDailyForecast[0].classList.remove("side-content-info-daily-forecast-open");
            for (let i = 0; i < DAILY_ELEMENTS_OFFSET; i++) {
                setDailyForecastElement(data, timezone, i, i);
                removeTwoElementsAnimation(dailyForecastElement, i);
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousDailyElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextDailyElements);
        }
        if (lastOptionChosen === 2) {
            let data = JSON.parse(window.sessionStorage.getItem("weatherPollutionContent"));
            sideContentPollutionForecast[0].classList.add("side-content-info-pollution-forecast-closed");
            sideContentPollutionForecast[0].classList.remove("side-content-info-pollution-forecast-open");
            let j = POLLUTION_STARTING_INDEX;
            for (let i = 0; i < POLLUTION_ELEMENTS_OFFSET; i++) {
                setPollutionForecastElement(data, timezone, i, j);
                removeTwoElementsAnimation(pollutionForecastElement, i);
                j++;
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousPollutionElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextPollutionElements);
        }
        low_side_index = 0;
        high_side_index = OFFSET_SIDE_INDEX - 1;
        double_up_wrapper[0].querySelector(".fa-angle-double-up").addEventListener("click", displayPreviousHourlyElements);
        double_down_wrapper[0].querySelector(".fa-angle-double-down").addEventListener("click", displayNextHourlyElements);
        if (state.state)
            setDoubleWrapperToDefault();
        else
            disableArrows();
        sideContentHourlyForecast[0].classList.add("side-content-info-hourly-forecast-open");
        sideContentHourlyForecast[0].classList.remove("side-content-info-hourly-forecast-closed");
        if (lastOptionChosen === -1)
            openSideContent();
        lastOptionChosen = 0;
    }
}

function removeTwoElementsAnimation(elementsList, number) {
    if (number === 0) {
        elementsList[number].classList.remove("previous-one-of-two");
        elementsList[number].classList.remove("next-one-of-two");
    }
    else if (number === 1) {
        elementsList[number].classList.remove("previous-two-of-two");
        elementsList[number].classList.remove("next-two-of-two");
    }
    else
        throw {
            name: "TwoElementsAnimationException",
            message: "The element's index isn't in the range (0 - 1)"
        }
}

function removeThreeElementsAnimation(elementsList, number) {
    if (number === 0) {
        elementsList[number].classList.remove("previous-one-of-three");
        elementsList[number].classList.remove("next-one-of-three");
    }
    else if (number === 1) {
        elementsList[number].classList.remove("previous-two-of-three");
        elementsList[number].classList.remove("next-two-of-three");
    }
    else if (number === 2) {
        elementsList[number].classList.remove("previous-three-of-three");
        elementsList[number].classList.remove("next-three-of-three");
    }
    else
        throw {
            name: "ThreeElementsAnimationException",
            message: "The element's index isn't in the range (0 - 2)"
        }
}

function previousThreeElementsAnimation(elementsList, number) {
    if (number === 0) {
        if(elementsList[number].classList.contains("next-one-of-three")) {
            elementsList[number].classList.remove("next-one-of-three");
            elementsList[number].classList.add("previous-one-of-three");
        }
        else if (elementsList[number].classList.contains("previous-one-of-three")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("previous-one-of-three");
    }
    else if (number === 1) {
        if(elementsList[number].classList.contains("next-two-of-three")) {
            elementsList[number].classList.remove("next-two-of-three");
            elementsList[number].classList.add("previous-two-of-three");
        }
        else if (elementsList[number].classList.contains("previous-two-of-three")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("previous-two-of-three");
    }
    else if (number === 2) {
        if(elementsList[number].classList.contains("next-three-of-three")) {
            elementsList[number].classList.remove("next-three-of-three");
            elementsList[number].classList.add("previous-three-of-three");
        }
        else if (elementsList[number].classList.contains("previous-three-of-three")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("previous-three-of-three");
    }
    else
        throw {
            name: "ThreeElementsAnimationException",
            message: "The element's index isn't in the range (0 - 2)"
        }
}

function nextThreeElementsAnimation(elementsList, number) {
    if (number === 0) {
        if(elementsList[number].classList.contains("previous-one-of-three")) {
            elementsList[number].classList.remove("previous-one-of-three");
            elementsList[number].classList.add("next-one-of-three");
        }
        else if (elementsList[number].classList.contains("next-one-of-three")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("next-one-of-three");
    }
    else if (number === 1) {
        if(elementsList[number].classList.contains("previous-two-of-three")) {
            elementsList[number].classList.remove("previous-two-of-three");
            elementsList[number].classList.add("next-two-of-three");
        }
        else if (elementsList[number].classList.contains("next-two-of-three")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("next-two-of-three");
    }
    else if (number === 2) {
        if(elementsList[number].classList.contains("previous-three-of-three")) {
            elementsList[number].classList.remove("previous-three-of-three");
            elementsList[number].classList.add("next-three-of-three");
        }
        else if (elementsList[number].classList.contains("next-three-of-three")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("next-three-of-three");
    }
    else
        throw {
            name: "ThreeElementsAnimationException",
            message: "The element's index isn't in the range (0 - 2)"
        }
}

function previousTwoElementsAnimation(elementsList, number) {
    if (number === 0) {
        if(elementsList[number].classList.contains("next-one-of-two")) {
            elementsList[number].classList.remove("next-one-of-two");
            elementsList[number].classList.add("previous-one-of-two");
        }
        else if (elementsList[number].classList.contains("previous-one-of-two")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("previous-one-of-two");
    }
    else if (number === 1) {
        if(elementsList[number].classList.contains("next-two-of-two")) {
            elementsList[number].classList.remove("next-two-of-two");
            elementsList[number].classList.add("previous-two-of-two");
        }
        else if (elementsList[number].classList.contains("previous-two-of-two")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("previous-two-of-two");
    }
    else
        throw {
            name: "TwoElementsAnimationException",
            message: "The element's index isn't in the range (0 - 1)"
        }
}

function nextTwoElementsAnimation(elementsList, number) {
    if (number === 0) {
        if(elementsList[number].classList.contains("previous-one-of-two")) {
            elementsList[number].classList.remove("previous-one-of-two");
            elementsList[number].classList.add("next-one-of-two");
        }
        else if (elementsList[number].classList.contains("next-one-of-two")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("next-one-of-two");
    }
    else if (number === 1) {
        if(elementsList[number].classList.contains("previous-two-of-two")) {
            elementsList[number].classList.remove("previous-two-of-two");
            elementsList[number].classList.add("next-two-of-two");
        }
        else if (elementsList[number].classList.contains("next-two-of-two")) {
            let clonedElement = elementsList[number].cloneNode(true);
            let emptyText = document.createTextNode("");
            elementsList[number].parentNode.replaceChild(emptyText, elementsList[number]);
            emptyText.parentNode.replaceChild(clonedElement, emptyText);
        }
        else
            elementsList[number].classList.add("next-two-of-two");
    }
    else
        throw {
            name: "TwoElementsAnimationException",
            message: "The element's index isn't in the range (0 - 1)"
        }
}

function displayPreviousHourlyElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
    if (state !== null && state.state && low_side_index > 0) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (low_side_index - OFFSET_SIDE_INDEX >= 0) {
            for (let i = 0; i < OFFSET_SIDE_INDEX; i++) {
                setHourlyForecastElement(data, timezone, i, low_side_index - OFFSET_SIDE_INDEX + i);
                previousThreeElementsAnimation(hourlyForecastElement, i);
            }
            if (high_side_index === MAX_NUM_HOURS - 1) {
                double_down_wrapper[0].classList.add("active-double");
                double_down_wrapper[0].classList.remove("disable-double");
            }
            low_side_index -= OFFSET_SIDE_INDEX;
            high_side_index -= OFFSET_SIDE_INDEX;
            if (low_side_index === 0) {
                double_up_wrapper[0].classList.add("disable-double");
                double_up_wrapper[0].classList.remove("active-double");
            }
        }
        else
            defaultHourlyForecast(data, timezone);
    }
}

function displayNextHourlyElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
    if (state !== null && state.state && high_side_index < MAX_NUM_HOURS - 1) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (high_side_index + OFFSET_SIDE_INDEX < MAX_NUM_HOURS) {
            for (let i = 1; i <= OFFSET_SIDE_INDEX; i++) {
                setHourlyForecastElement(data, timezone, i - 1, high_side_index + i);
                nextThreeElementsAnimation(hourlyForecastElement, i - 1);
            }
            if (low_side_index === 0) {
                double_up_wrapper[0].classList.add("active-double");
                double_up_wrapper[0].classList.remove("disable-double");
            }
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
                nextThreeElementsAnimation(hourlyForecastElement, j);
                j--;
            }
            low_side_index = MAX_NUM_HOURS - OFFSET_SIDE_INDEX;
            high_side_index = MAX_NUM_HOURS - 1;
            double_down_wrapper[0].classList.add("disable-double");
            double_down_wrapper[0].classList.remove("active-double");
        }
    }
}

function displayDailyForecastElements() {
    if (lastOptionChosen !== 1) {
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
        if (lastOptionChosen === 0) {
            sideContentHourlyForecast[0].classList.add("side-content-info-hourly-forecast-closed");
            sideContentHourlyForecast[0].classList.remove("side-content-info-hourly-forecast-open");
            for (let i = 0; i < OFFSET_SIDE_INDEX; i++) {
                setHourlyForecastElement(data, timezone, i, i);
                removeThreeElementsAnimation(hourlyForecastElement, i);
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousHourlyElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextHourlyElements);
        }
        if (lastOptionChosen === 2) {
            let data = JSON.parse(window.sessionStorage.getItem("weatherPollutionContent"));
            sideContentPollutionForecast[0].classList.add("side-content-info-pollution-forecast-closed");
            sideContentPollutionForecast[0].classList.remove("side-content-info-pollution-forecast-open");
            let j = POLLUTION_STARTING_INDEX;
            for (let i = 0; i < POLLUTION_ELEMENTS_OFFSET; i++) {
                setPollutionForecastElement(data, timezone, i, j);
                removeTwoElementsAnimation(pollutionForecastElement, i);
                j++;
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousPollutionElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextPollutionElements);
        }
        low_side_index = 0;
        high_side_index = DAILY_ELEMENTS_OFFSET - 1;
        double_up_wrapper[0].querySelector(".fa-angle-double-up").addEventListener("click", displayPreviousDailyElements);
        double_down_wrapper[0].querySelector(".fa-angle-double-down").addEventListener("click", displayNextDailyElements);
        if (state.state)
            setDoubleWrapperToDefault();
        else
            disableArrows();
        sideContentDailyForecast[0].classList.add("side-content-info-daily-forecast-open");
        sideContentDailyForecast[0].classList.remove("side-content-info-daily-forecast-closed");
        if (lastOptionChosen === -1)
            openSideContent();
        lastOptionChosen = 1;
    }
}

function displayPreviousDailyElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
    if (state !== null && state.state && low_side_index > 0) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (low_side_index - DAILY_ELEMENTS_OFFSET >= 0) {
            for (let i = 0; i < DAILY_ELEMENTS_OFFSET; i++) {
                setDailyForecastElement(data, timezone, i, low_side_index - DAILY_ELEMENTS_OFFSET + i);
                previousTwoElementsAnimation(dailyForecastElement, i);
            }
            if (high_side_index === MAX_NUM_DAYS - 1) {
                double_down_wrapper[0].classList.add("active-double");
                double_down_wrapper[0].classList.remove("disable-double");
            }
            low_side_index -= DAILY_ELEMENTS_OFFSET;
            high_side_index -= DAILY_ELEMENTS_OFFSET;
            if (low_side_index === 0) {
                double_up_wrapper[0].classList.add("disable-double");
                double_up_wrapper[0].classList.remove("active-double");
            }
        }
        else
            defaultDailyForecast(data, timezone);
    }
}

function displayNextDailyElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
    if (state !== null && state.state && high_side_index < MAX_NUM_DAYS - 1) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (high_side_index + DAILY_ELEMENTS_OFFSET < MAX_NUM_DAYS) {
            for (let i = 1; i <= DAILY_ELEMENTS_OFFSET; i++) {
                setDailyForecastElement(data, timezone, i - 1, high_side_index + i);
                nextTwoElementsAnimation(dailyForecastElement, i - 1);
            }
            if (low_side_index === 0) {
                double_up_wrapper[0].classList.add("active-double");
                double_up_wrapper[0].classList.remove("disable-double");
            }
            low_side_index += DAILY_ELEMENTS_OFFSET;
            high_side_index += DAILY_ELEMENTS_OFFSET;
            if (high_side_index === MAX_NUM_DAYS - 1) {
                double_down_wrapper[0].classList.add("disable-double");
                double_down_wrapper[0].classList.remove("active-double");
            }
        } else {
            let j = DAILY_ELEMENTS_OFFSET - 1;
            for (let i = MAX_NUM_DAYS - 1; i >= MAX_NUM_DAYS - DAILY_ELEMENTS_OFFSET; i--) {
                setDailyForecastElement(data, timezone, j, i);
                nextTwoElementsAnimation(dailyForecastElement, j);
                j--;
            }
            low_side_index = MAX_NUM_DAYS - DAILY_ELEMENTS_OFFSET;
            high_side_index = MAX_NUM_DAYS - 1;
            double_down_wrapper[0].classList.add("disable-double");
            double_down_wrapper[0].classList.remove("active-double");
        }
    }
}

function displayPollutionForecastElements() {
    if (lastOptionChosen !== 2) {
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
        let state = JSON.parse(window.sessionStorage.getItem("weatherPollutionInfoState"));
        if (lastOptionChosen === 0) {
            sideContentHourlyForecast[0].classList.add("side-content-info-hourly-forecast-closed");
            sideContentHourlyForecast[0].classList.remove("side-content-info-hourly-forecast-open");
            for (let i = 0; i < OFFSET_SIDE_INDEX; i++) {
                setHourlyForecastElement(data, timezone, i, i);
                removeThreeElementsAnimation(hourlyForecastElement, i);
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousHourlyElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextHourlyElements);
        }
        if (lastOptionChosen === 1) {
            sideContentDailyForecast[0].classList.add("side-content-info-daily-forecast-closed");
            sideContentDailyForecast[0].classList.remove("side-content-info-daily-forecast-open");
            for (let i = 0; i < DAILY_ELEMENTS_OFFSET; i++) {
                setDailyForecastElement(data, timezone, i, i);
                removeTwoElementsAnimation(dailyForecastElement, i);
            }
            double_up_wrapper[0].querySelector(".fa-angle-double-up").removeEventListener("click", displayPreviousDailyElements);
            double_down_wrapper[0].querySelector(".fa-angle-double-down").removeEventListener("click", displayNextDailyElements);
        }
        low_side_index = POLLUTION_STARTING_INDEX;
        high_side_index = POLLUTION_STARTING_INDEX + (POLLUTION_ELEMENTS_OFFSET - 1);
        double_up_wrapper[0].querySelector(".fa-angle-double-up").addEventListener("click", displayPreviousPollutionElements);
        double_down_wrapper[0].querySelector(".fa-angle-double-down").addEventListener("click", displayNextPollutionElements);
        if (state.state)
            setDoubleWrapperToDefault();
        else
            disableArrows();
        sideContentPollutionForecast[0].classList.add("side-content-info-pollution-forecast-open");
        sideContentPollutionForecast[0].classList.remove("side-content-info-pollution-forecast-closed");
        if (lastOptionChosen === -1)
            openSideContent();
        lastOptionChosen = 2;
    }
}

function displayPreviousPollutionElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherPollutionInfoState"));
    if (state !== null && state.state && low_side_index > POLLUTION_STARTING_INDEX) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherPollutionContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (low_side_index - POLLUTION_ELEMENTS_OFFSET >= POLLUTION_STARTING_INDEX) {
            for (let i = 0; i < POLLUTION_ELEMENTS_OFFSET; i++) {
                setPollutionForecastElement(data, timezone, i, low_side_index - POLLUTION_ELEMENTS_OFFSET + i);
                previousTwoElementsAnimation(pollutionForecastElement, i);
            }
            if (high_side_index === MAX_NUM_POLLUTION_HOURS - 1) {
                double_down_wrapper[0].classList.add("active-double");
                double_down_wrapper[0].classList.remove("disable-double");
            }
            low_side_index -= POLLUTION_ELEMENTS_OFFSET;
            high_side_index -= POLLUTION_ELEMENTS_OFFSET;
            if (low_side_index === POLLUTION_STARTING_INDEX) {
                double_up_wrapper[0].classList.add("disable-double");
                double_up_wrapper[0].classList.remove("active-double");
            }
        }
        else
            defaultPollutionForecast(data, timezone);
    }
}

function displayNextPollutionElements() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherPollutionInfoState"));
    if (state !== null && state.state && high_side_index < MAX_NUM_POLLUTION_HOURS - 1) {
        let data = JSON.parse(window.sessionStorage.getItem("weatherPollutionContent"));
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        if (high_side_index + POLLUTION_ELEMENTS_OFFSET < MAX_NUM_POLLUTION_HOURS) {
            for (let i = 1; i <= POLLUTION_ELEMENTS_OFFSET; i++) {
                setPollutionForecastElement(data, timezone, i - 1, high_side_index + i);
                nextTwoElementsAnimation(pollutionForecastElement, i - 1);
            }
            if (low_side_index === POLLUTION_STARTING_INDEX) {
                double_up_wrapper[0].classList.add("active-double");
                double_up_wrapper[0].classList.remove("disable-double");
            }
            low_side_index += POLLUTION_ELEMENTS_OFFSET;
            high_side_index += POLLUTION_ELEMENTS_OFFSET;
            if (high_side_index === MAX_NUM_POLLUTION_HOURS - 1) {
                double_down_wrapper[0].classList.add("disable-double");
                double_down_wrapper[0].classList.remove("active-double");
            }
        } else {
            let j = POLLUTION_ELEMENTS_OFFSET - 1;
            for (let i = MAX_NUM_POLLUTION_HOURS - 1; i >= MAX_NUM_POLLUTION_HOURS - POLLUTION_ELEMENTS_OFFSET; i--) {
                setPollutionForecastElement(data, timezone, j, i);
                nextTwoElementsAnimation(dailyForecastElement, j);
                j--;
            }
            low_side_index = MAX_NUM_POLLUTION_HOURS - POLLUTION_ELEMENTS_OFFSET;
            high_side_index = MAX_NUM_POLLUTION_HOURS - 1;
            double_down_wrapper[0].classList.add("disable-double");
            double_down_wrapper[0].classList.remove("active-double");
        }
    }
}

function openModal() {
    let state = JSON.parse(window.sessionStorage.getItem("weatherSideInfoState"));
    let data = JSON.parse(window.sessionStorage.getItem("weatherSideContent"));
    let overlay = document.getElementsByClassName("overlay")[0];
    let modal = document.getElementsByClassName("modal")[0];
    if (state != null && state.state && data.alerts !== undefined && data.alerts !== null) {
        document.getElementsByClassName("modal-header")[0].getElementsByTagName("H2")[0].innerHtml = data.alerts[0].event;
        let timezone = JSON.parse(window.sessionStorage.getItem("weatherData")).timezone;
        let date = calculateSideDate(data.alerts[0].start, timezone);
        document.getElementsByClassName("modal-date-start-value")[0].innerHTML = date.year + "/" + date.fixedMonths + "/" + date.fixedDays + " Time " + date.fixedHours + ":" + date.fixedMinutes;
        date = calculateSideDate(data.alerts[0].end, timezone);
        document.getElementsByClassName("modal-date-end-value")[0].innerHTML = date.year + "/" + date.fixedMonths + "/" + date.fixedDays + " Time " + date.fixedHours + ":" + date.fixedMinutes;
        document.getElementsByClassName("modal-description")[0].innerHTML = data.alerts[0].description;
        document.getElementsByClassName("modal-source-value")[0].innerHTML = data.alerts[0].sender_name;
    }
    overlay.classList.add("overlay-enabled");
    overlay.classList.remove("overlay-disabled");
    modal.classList.add("modal-open");
    modal.classList.remove("modal-closed");
}

function closeModal() {
    let overlay = document.getElementsByClassName("overlay")[0];
    let modal = document.getElementsByClassName("modal")[0];
    overlay.classList.add("overlay-disabled");
    overlay.classList.remove("overlay-enabled");
    modal.classList.add("modal-closed");
    modal.classList.remove("modal-open");
}