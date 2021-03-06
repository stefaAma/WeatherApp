//let weatherData;
//let weatherAppState = true;
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

let temperatureDegreeValue;
let maxTemperatureValue;
let minTemperatureValue;

const currentWeatherApi = {
    key: "42c3e3f5f36a943d8d948de6dd8b9dcc",
    url: "https://api.openweathermap.org/data/2.5/weather"
};

window.addEventListener("load", () => {
    let weatherData = window.sessionStorage.getItem("weatherData");
    let weatherAppState = window.sessionStorage.getItem("weatherAppState");
    if (weatherAppState === null) {
        $.get(currentWeatherApi.url, {q: "sydney", appid: currentWeatherApi.key}, data => {
            window.sessionStorage.setItem("weatherData", JSON.stringify(data));
            window.sessionStorage.setItem("weatherAppState", JSON.stringify({state: true}));
            console.log(data);
            setWeather(data);
        }).fail(jqXHR => {
            if (jqXHR.status == 404)
                console.log("error 404");
            else
                console.log("other error");
            falseState();
        });
    }
    else if (JSON.parse(weatherAppState).state === true) {
        $.get(currentWeatherApi.url, {q: JSON.parse(weatherData).name, appid: currentWeatherApi.key}, data => {
            window.sessionStorage.setItem("weatherData", JSON.stringify(data));
            console.log(data);
            setWeather(data);
        }).fail(jqXHR => {
            if (jqXHR.status == 404)
                console.log("error 404");
            else
                console.log("other error");
            falseState();
        });
    }
    else {
        window.alert("Please insert a city name");
        falseState();
    }
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
        setIcon(icon, data.weather[0].icon);
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

function setIcon(icon, iconCode) {
    if (iconCode === "01d") {
        icon[0].src = "images/day.svg";
    }
    else if (iconCode === "02d") {
        icon[0].src = "images/cloudy-day-1.svg";
    }
    else if (iconCode === "03d" || iconCode === "04d" || iconCode === "03n" || iconCode === "04n") {
        icon[0].src = "images/cloudy.svg";
    }
    else if (iconCode === "09d" || iconCode === "09n" || iconCode === "10n") {
        icon[0].src = "images/rainy-6.svg";
    }
    else if (iconCode === "10d") {
        icon[0].src = "images/rainy-3.svg";
    }
    else if (iconCode === "11d" || iconCode === "11n") {
        icon[0].src = "images/thunder.svg";
    }
    else if (iconCode === "13d" || iconCode === "13n") {
        icon[0].src = "images/snowy-5.svg";
    }
    else if (iconCode === "01n") {
        icon[0].src = "images/night.svg";
    }
    else if (iconCode === "02n") {
        icon[0].src = "images/cloudy-night-1.svg";
    }
    else {
        icon[0].src = "images/weather_sunset.svg";
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
    let sunriseDate = new Date(0);
    sunriseDate.setUTCSeconds(data.sys.sunrise);
    let soughtSunriseDate = calculateUtcDate(data.timezone, sunriseDate.getMinutes(), sunriseDate.getHours(), null);
    let fixedSunriseTime = fixDateTimeValues(soughtSunriseDate.minutes, soughtSunriseDate.hours, null, null);
    let sunriseValue = fixedSunriseTime.fixedHours + ":" + fixedSunriseTime.fixedMinutes;
    setTemperatureInfoValue(sunrise, sunriseValue);
    let sunsetDate = new Date(0);
    sunsetDate.setUTCSeconds(data.sys.sunset);
    let soughtSunsetDate = calculateUtcDate(data.timezone, sunsetDate.getMinutes(), sunsetDate.getHours(), null);
    let fixSunsetTime = fixDateTimeValues(soughtSunsetDate.minutes, soughtSunsetDate.hours, null, null);
    let sunsetValue = fixSunsetTime.fixedHours + ":" + fixSunsetTime.fixedMinutes;
    setTemperatureInfoValue(sunset, sunsetValue);
}

function setTemperatureInfoValue (temperatureInfo, value) {
    let children = temperatureInfo[0].children;
    for (i = 0; i < children.length; i++) {
        if (children[i].className === "temperature-info-value")
            children[i].innerHTML = value;
    }
}

function degreeConverter(temperatureValue, unitMeasureStart, unitMeasureEnd) {
    if (unitMeasureStart === "K" && unitMeasureEnd === "C") {
        temperatureValue = temperatureValue - 273.15;
    }
    else if (unitMeasureStart === "K" && unitMeasureEnd === "F") {
        temperatureValue = 1.80 * (temperatureValue - 273.15) + 32;
    }
    else if (unitMeasureStart === "C" && unitMeasureEnd === "F") {
        temperatureValue = (1.80 * temperatureValue) + 32;
    }
    else if (unitMeasureStart === "C" && unitMeasureEnd === "K") {
        temperatureValue = temperatureValue + 273.15;
    }
    else if (unitMeasureStart === "F" && unitMeasureEnd === "C") {
        temperatureValue = (temperatureValue - 32) / 1.80;
    }
    else if (unitMeasureStart === "F" && unitMeasureEnd === "K") {
        temperatureValue = (temperatureValue - 32) / 1.80 + 273.15;
    }
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
    if (unitMeasureEnd === "C") {
        temperatureDegree.innerHTML = stringTemperatureValue + "°C";
    }
    else if (unitMeasureEnd === "F") {
        temperatureDegree.innerHTML = stringTemperatureValue + "°F";
    }
    else {
        temperatureDegree.innerHTML = stringTemperatureValue + "K";
    }
    return temperatureValue;
}

function setDate(locationDate, delay) {
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
    let soughtDate = calculateUtcDate(delay, currentMinutes, currentHour, currentDay);
    soughtMinutes = soughtDate.minutes;
    soughtHour = soughtDate.hours;
    soughtDay = soughtDate.days;
    //day/month/year settings
    //console.log("day/month/year settings");
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
    else if (currentMonth === 2 && leapMonth(currentYear)) {
        if (soughtDay > 29) {
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
    else if (currentMonth === 2 && !leapMonth(currentYear)) {
        if (soughtDay > 28) {
            soughtDay -= 28;
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
            if (leapMonth(currentYear)) {
                soughtDay = 29 + soughtDay;
            }
            else {
                soughtDay = 28 + soughtDay;
            }
            soughtMonth = currentMonth - 1;
            soughtYear = currentYear;
        }
        else {
            soughtMonth = currentMonth;
            soughtYear = currentYear;
        }
    }
    else if (currentMonth === 4) {
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
    else if (currentMonth === 5) {
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
    else if (currentMonth === 6) {
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
    else if (currentMonth === 7) {
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
    else if (currentMonth === 9) {
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
    else if (currentMonth === 10) {
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
    else if (currentMonth === 11) {
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
    locationDate[0].innerHTML = soughtYear + "/" + fixedDateTime.fixedMonths + "/" + fixedDateTime.fixedDays + " Time " + fixedDateTime.fixedHours + ":" + fixedDateTime.fixedMinutes;
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
    if (minutes >= 0 && minutes <= 9) {
        fixedMinutes = "0" + minutes;
    }
    else {
        fixedMinutes = minutes;
    }
    if (hours >= 0 && hours <= 9) {
        fixedHours = "0" + hours;
    }
    else {
        fixedHours = hours;
    }
    if (days !== null && days >= 1 && days <= 9) {
        fixedDays = "0" + days;
    }
    else  {
        fixedDays = days;
    }
    if (months !== null && months >= 1 && months <= 9) {
        fixedMonths = "0" + months;
    }
    else {
        fixedMonths = months;
    }
    return {
        fixedMinutes: fixedMinutes,
        fixedHours: fixedHours,
        fixedDays: fixedDays,
        fixedMonths: fixedMonths
    }
}

function modifyDegreeUnitMeasure() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true) {
        let temperatureString = temperatureDegree[0].innerHTML;
        let separatorIndex = temperatureString.indexOf("°");
        let unitMeasureStart;
        if (separatorIndex !== -1)
            unitMeasureStart = temperatureString.substring(separatorIndex + 1, temperatureString.length);
        else
            unitMeasureStart = "K";
        let maxTemperatureElement = maxTemperature[0].querySelector(".temperature-info-value");
        let minTemperatureElement = minTemperature[0].querySelector(".temperature-info-value");
        let maxTemperatureString = maxTemperatureElement.innerHTML;
        separatorIndex = maxTemperatureString.indexOf("°");
        let maxUnitMeasureStart;
        if (separatorIndex !== -1)
            maxUnitMeasureStart = maxTemperatureString.substring(separatorIndex + 1, maxTemperatureString.length);
        else
            maxUnitMeasureStart = "K";
        let minTemperatureString = minTemperatureElement.innerHTML;
        separatorIndex = minTemperatureString.indexOf("°");
        let minUnitMeasureStart;
        if (separatorIndex !== -1)
            minUnitMeasureStart = minTemperatureString.substring(separatorIndex + 1, minTemperatureString.length);
        else
            minUnitMeasureStart = "K";
        if (unitMeasureStart === "C") {
            temperatureDegreeValue = setTemperature(temperatureDegree[0], unitMeasureStart, "F", temperatureDegreeValue);
            if (maxUnitMeasureStart !== "F") {
                maxTemperatureValue = setTemperature(maxTemperatureElement, maxUnitMeasureStart, "F", maxTemperatureValue);
            }
            if (minUnitMeasureStart !== "F") {
                minTemperatureValue = setTemperature(minTemperatureElement, minUnitMeasureStart, "F", minTemperatureValue);
            }
        } else if (unitMeasureStart === "F") {
            temperatureDegreeValue = setTemperature(temperatureDegree[0], unitMeasureStart, "K", temperatureDegreeValue);
            if (maxUnitMeasureStart !== "K") {
                maxTemperatureValue = setTemperature(maxTemperatureElement, maxUnitMeasureStart, "K", maxTemperatureValue);
            }
            if (minUnitMeasureStart !== "K") {
                minTemperatureValue = setTemperature(minTemperatureElement, minUnitMeasureStart, "K", minTemperatureValue);
            }
        } else {
            temperatureDegreeValue = setTemperature(temperatureDegree[0], unitMeasureStart, "C", temperatureDegreeValue);
            if (maxUnitMeasureStart !== "C") {
                maxTemperatureValue = setTemperature(maxTemperatureElement, maxUnitMeasureStart, "C", maxTemperatureValue);
            }
            if (minUnitMeasureStart !== "C") {
                minTemperatureValue = setTemperature(minTemperatureElement, minUnitMeasureStart, "C", minTemperatureValue);
            }
        }
    }
}

function modifyMaxDegreeUnitMeasure() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true) {
        let maxTemperatureElement = maxTemperature[0].querySelector(".temperature-info-value");
        maxTemperatureValue = modifyMaxMinDegreeUnitMeasure(maxTemperatureElement, maxTemperatureValue);
    }
}

function modifyMinDegreeUnitMeasure() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true) {
        let minTemperatureElement = minTemperature[0].querySelector(".temperature-info-value");
        minTemperatureValue = modifyMaxMinDegreeUnitMeasure(minTemperatureElement, minTemperatureValue);
    }
}

function modifyMaxMinDegreeUnitMeasure(temperatureElement, temperatureValue) {
    let temperatureString = temperatureElement.innerHTML;
    let separatorIndex = temperatureString.indexOf("°");
    let unitMeasureStart;
    if (separatorIndex !== -1)
        unitMeasureStart = temperatureString.substring(separatorIndex + 1, temperatureString.length);
    else
        unitMeasureStart = "K";
    if (unitMeasureStart === "C") {
        temperatureValue = setTemperature(temperatureElement, unitMeasureStart, "F", temperatureValue);
    }
    else if (unitMeasureStart === "F") {
        temperatureValue = setTemperature(temperatureElement, unitMeasureStart, "K", temperatureValue);
    }
    else {
        temperatureValue = setTemperature(temperatureElement, unitMeasureStart, "C", temperatureValue);
    }
    return temperatureValue;
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
    //searchBar.classList.remove("search-city-false-state");
    searchBar.style.borderBottom = "3px solid #7D3C98";
    searchBar.style.boxShadow = "";
    searchButton[0].style.border = "3px solid #7D3C98";
    searchButton[0].style.boxShadow = "";
    window.sessionStorage.setItem("weatherAppState", JSON.stringify({state: true}));
}

function falseState() {
    locationZone[0].innerHTML = "N/A City";
    locationDate[0].innerHTML = "N/A Date";
    temperatureDegree[0].innerHTML = "N/A Temperature";
    maxTemperature[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    minTemperature[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    humidity[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    wind[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    sunrise[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    sunset[0].querySelector(".temperature-info-value").innerHTML = "N/A";
    icon[0].src = "images/weather_sunset.svg";
    //searchBar.classList.add("search-city-false-state");
    searchBar.style.borderBottom = "3px solid darkred";
    searchBar.style.boxShadow = "0 0 2px 0px #FFFFFF," +
                                "0 0 5px 0px #ff9999," +
                                "0 0 10px 0px #e60000";
    searchButton[0].style.border = "3px solid darkred";
    searchButton[0].style.boxShadow = "0 0 2px 0px #FFFFFF," +
                                    "0 0 5px 0px #ff9999," +
                                    "0 0 10px 0px #e60000";
    window.sessionStorage.setItem("weatherAppState", JSON.stringify({state: false}));
}

function searchingBarFocus() {
    searchBar.style.boxShadow = "2px 5px 5px rgba(0,0,0,0.6)";
}

function searchingBarFocusOut() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true)
        searchBar.style.boxShadow = "";
    else
        searchBar.style.boxShadow = "0 0 2px 0px #FFFFFF," +
                                    "0 0 5px 0px #ff9999," +
                                    "0 0 10px 0px #e60000";
}

function searchingButtonHover() {
    searchButton[0].style.boxShadow = "2px 5px 5px rgba(0,0,0,0.6)";
}

function searchingButtonHoverOut() {
    if (JSON.parse(window.sessionStorage.getItem("weatherAppState")).state === true)
        searchButton[0].style.boxShadow = "";
    else
        searchButton[0].style.boxShadow =   "0 0 2px 0px #FFFFFF," +
                                            "0 0 5px 0px #ff9999," +
                                            "0 0 10px 0px #e60000";
}
