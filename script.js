// API Keys
const apiKey = '191d5a6d69251396ba3854082a68376a';  // OpenWeatherMap API key

// Global Variables
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
migrateUsers(); // Ensure all users have the defaultLocation property

// Replace the entire DOMContentLoaded event listener in script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize city input autocomplete
    const cityInput = document.getElementById('cityInput');
    const citySuggestions = document.getElementById('citySuggestions');

    if (cityInput && citySuggestions) {
        cityInput.addEventListener('input', debounce(function() {
            const input = this.value.trim();
            citySuggestions.innerHTML = '';
            citySuggestions.style.display = 'none';

            if (input.length < 3) return;

            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.length > 0) {
                        citySuggestions.style.display = 'block';
                        data.forEach(city => {
                            const div = document.createElement('div');
                            div.textContent = `${city.name}, ${city.country}`;
                            div.onclick = () => {
                                cityInput.value = city.name;
                                citySuggestions.style.display = 'none';
                                // Call appropriate function based on current page
                                if (window.location.href.includes('forecast.html')) {
                                    getForecast();
                                } else if (window.location.href.includes('historical.html')) {
                                    getHistoricalWeather();
                                } else if (window.location.href.includes('recommender.html')) {
                                    getRecommendations();
                                } else {
                                    getWeather();
                                }
                            };
                            citySuggestions.appendChild(div);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error fetching city data:', error);
                });
        }, 300));

        // Close suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (!cityInput.contains(event.target) && !citySuggestions.contains(event.target)) {
                citySuggestions.style.display = 'none';
            }
        });
    }

    // Check if user is logged in
    checkUserLogin();

    // Load page-specific content
    loadPageContent();
});

function loadPageContent() {
    const path = window.location.pathname;
    
    if (path.includes('forecast.html')) {
        // Restrict access to logged-in users
        if (!currentUser) {
            alert("Please log in to view the 5-day forecast.");
            window.location.href = '../index.html';
            return;
        }
        
        // Load forecast page content for logged-in users
        if (currentUser && currentUser.defaultLocation) {
            document.getElementById('cityInput').value = currentUser.defaultLocation;
            getForecast();
        }
    } else if (path.includes('historical.html')) {
        // Restrict access to logged-in users
        if (!currentUser) {
            alert("Please log in to view historical weather data.");
            window.location.href = '../index.html';
            return;
        }
        
        // Load historical page content for logged-in users
        if (currentUser && currentUser.defaultLocation) {
            document.getElementById('cityInput').value = currentUser.defaultLocation;
        }
        
        // Set max date to today and min date to 15 years ago
        const historicalDate = document.getElementById('historicalDate');
        if (historicalDate) {
            const today = new Date();
            const fifteenYearsAgo = new Date();
            fifteenYearsAgo.setFullYear(today.getFullYear() - 15);
            
            historicalDate.max = today.toISOString().split('T')[0];
            historicalDate.min = fifteenYearsAgo.toISOString().split('T')[0];
            historicalDate.value = today.toISOString().split('T')[0]; // Default to today
        }
    } else if (path.includes('profile.html')) {
        // Restrict access to logged-in users
        if (!currentUser) {
            alert("Please log in to view your profile.");
            window.location.href = '../index.html';
            return;
        }
        
        // Load profile page content for logged-in users
        if (currentUser) {
            document.getElementById('loginRequired').style.display = 'none';
            document.getElementById('profileContainer').style.display = 'block';
            
            // Display user information
            document.getElementById('profileUsername').textContent = currentUser.username;
            document.getElementById('accountCreated').textContent = 'N/A'; // Could add creation date to user object
            
            // Set temperature unit preference
            const unitRadios = document.querySelectorAll('input[name="temperatureUnit"]');
            unitRadios.forEach(radio => {
                if (radio.value === currentUser.preferences.temperatureUnit) {
                    radio.checked = true;
                }
            });
            
            // Display default location
            if (currentUser.defaultLocation) {
                document.getElementById('defaultLocationDisplay').textContent = currentUser.defaultLocation;
            }
            
            // Display favorite locations
            updateProfileFavoritesList();
        }
    } else if (path.includes('recommender.html')) {
        // Restrict access to logged-in users
        if (!currentUser) {
            alert("Please log in to use the activity recommender.");
            window.location.href = '../index.html';
            return;
        }
        
        // Load recommender page content for logged-in users
        if (currentUser) {
            document.getElementById('loginRequired').style.display = 'none';
            document.getElementById('activityPreferences').style.display = 'block';
            
            if (currentUser.defaultLocation) {
                document.getElementById('cityInput').value = currentUser.defaultLocation;
                getRecommendations();
            }
        }
    } else {
        // Main page (index.html)
        if (currentUser && currentUser.defaultLocation) {
            document.getElementById('cityInput').value = currentUser.defaultLocation;
            getWeather();
        }
        
        // Hide additional features for guest users on the main page
        if (!currentUser) {
            // Hide navigation buttons
            const navButtons = [
                'homeNav',
                'forecastNav',
                'historicalNav',
                'recommenderNav'
            ];
            
            navButtons.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'none';
                }
            });
            
            // Hide loading text
            const loadingText = document.getElementById('loading');
            if (loadingText) {
                loadingText.style.display = 'none';
            }
            
            // Hide gray line under search bar
            const grayLine = document.querySelector('.gray-line');
            if (grayLine) {
                grayLine.style.display = 'none';
            }
            
            // Hide other elements
            const elementsToHide = [
                'weatherMapContainer',
                'forecastResult',
                'historicalResult',
                'recommendationsContainer',
                'aqiResult',
                'uvIndexResult',
                'hourlyForecast',
                'localTime',
                'setHomeLocationButton',
                'weatherResult'
            ];
            
            elementsToHide.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.style.display = 'none';
                }
            });
            
            // Show only the specified elements
            const elementsToShow = [
                'search-container',
                'cityInput',
                'citySuggestions'
            ];
            
            elementsToShow.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.style.display = 'block';
                }
            });
            
            // Show registration benefits
            const registrationBenefits = document.getElementById('registrationBenefits');
            if (registrationBenefits) {
                registrationBenefits.style.display = 'block';
            }
        }
    }
}

// User Authentication Functions
function migrateUsers() {
    users = users.map(user => {
        if (!user.defaultLocation) {
            user.defaultLocation = null;
        }
        if (!user.preferences) {
            user.preferences = {
                temperatureUnit: 'Celsius'
            };
        }
        return user;
    });
    localStorage.setItem('users', JSON.stringify(users));
}

function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !password) {
        alert("Please enter a username and password.");
        return;
    }

    // Check if the user already exists
    if (users.some(user => user.username === username)) {
        alert("Username already exists. Please choose another.");
        return;
    }

    // Create a new user
    const newUser = {
        username: username,
        password: password, // In a real app, you should hash the password!
        preferences: {
            temperatureUnit: 'Celsius' // Default preference
        },
        defaultLocation: null // Default location
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration successful. Please log in.");
    closeModal('registerModal');
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI elements
        updateUIForLoggedInUser();
        
        alert("Login successful.");
        closeModal('loginModal');
        
        // Load default location weather if set
        if (currentUser.defaultLocation) {
            document.getElementById('cityInput').value = currentUser.defaultLocation;
            
            // Call appropriate function based on current page
            const path = window.location.pathname;
            if (path.includes('forecast.html')) {
                getForecast();
            } else if (path.includes('historical.html')) {
                // Just set the input, user needs to select date
            } else if (path.includes('recommender.html')) {
                getRecommendations();
            } else if (path.includes('profile.html')) {
                loadPageContent();
            } else {
                getWeather();
            }
        }
    } else {
        alert("Invalid username or password.");
    }
}


function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Update UI elements
    updateUIForLoggedOutUser();
    
    // Reset the city input field and clear results
    document.getElementById('cityInput').value = '';
    
    // Hide weather-related elements
    const weatherElements = ['weatherResult', 'forecastResult', 'aqiResult', 'uvIndexResult', 'localTime', 'historicalResult', 'recommendationsContainer', 'weatherSummary'];
    weatherElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Show registration benefits
    const registrationBenefits = document.getElementById('registrationBenefits');
    if (registrationBenefits) registrationBenefits.style.display = 'block';
    
    // Show login required on specific pages
    const loginRequired = document.getElementById('loginRequired');
    if (loginRequired) loginRequired.style.display = 'block';
    
    // Hide profile container
    const profileContainer = document.getElementById('profileContainer');
    if (profileContainer) profileContainer.style.display = 'none';

    // Clear the time interval when logging out
    if (window.localTimeInterval) {
        clearInterval(window.localTimeInterval);
    }
        
    // Hide the local time display
    const localTime = document.getElementById('localTime');
    if (localTime) localTime.style.display = 'none';
    
    // Reset background to default
    updateBackground();
    
    alert("Logged out successfully.");
}

function checkUserLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    // Hide login/register buttons
    const loginButton = document.querySelector('#userSection button[onclick="showLoginModal()"]');
    const registerButton = document.querySelector('#userSection button[onclick="showRegisterModal()"]');
    if (loginButton) loginButton.style.display = 'none';
    if (registerButton) registerButton.style.display = 'none';
    
    // Show profile section
    const profileSection = document.getElementById('profileSection');
    if (profileSection) profileSection.style.display = 'flex';
    
    // Show navigation buttons
    const navButtons = [
        'forecastNav',
        'historicalNav',
        'recommenderNav'
    ];
    
    navButtons.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    });

    // Show user-only elements
    const userOnlyElements = [
        'unitToggle', 
        'defaultLocation', 
        'locationButton',
        'weatherMapContainer',
        'forecastResult',
        'historicalResult',
        'recommendationsContainer',
        'aqiResult',
        'uvIndexResult',
        'hourlyForecast',
        'localTime',
        'setHomeLocationButton',
        'weatherResult'
    ];
    
    userOnlyElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'block';
    });
    
    // Display welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;
        welcomeMessage.style.display = 'block';
    }
    
    // Display username
    const loggedInUser = document.getElementById('loggedInUser');
    if (loggedInUser) loggedInUser.textContent = currentUser.username;
    
    // Hide registration benefits
    const registrationBenefits = document.getElementById('registrationBenefits');
    if (registrationBenefits) registrationBenefits.style.display = 'none';
    
    // Hide login required message
    const loginRequired = document.getElementById('loginRequired');
    if (loginRequired) loginRequired.style.display = 'none';
    
    // Show profile container
    const profileContainer = document.getElementById('profileContainer');
    if (profileContainer) profileContainer.style.display = 'block';
    
    // Show activity preferences
    const activityPreferences = document.getElementById('activityPreferences');
    if (activityPreferences) activityPreferences.style.display = 'block';
}

function updateUIForLoggedOutUser() {
    // Show login/register buttons
    const loginButton = document.querySelector('#userSection button[onclick="showLoginModal()"]');
    const registerButton = document.querySelector('#userSection button[onclick="showRegisterModal()"]');
    if (loginButton) loginButton.style.display = 'inline-block';
    if (registerButton) registerButton.style.display = 'inline-block';
    
    // Hide profile section
    const profileSection = document.getElementById('profileSection');
    if (profileSection) profileSection.style.display = 'none';

    // Hide navigation buttons
    const navButtons = [
        'forecastNav',
        'historicalNav',
        'recommenderNav'
    ];
    
    navButtons.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });

    // Hide user-only elements
    const userOnlyElements = [
        'unitToggle', 
        'defaultLocation', 
        'locationButton',
        'weatherMapContainer',
        'forecastResult',
        'historicalResult',
        'recommendationsContainer',
        'aqiResult',
        'uvIndexResult',
        'hourlyForecast',
        'localTime',
        'setHomeLocationButton',
        'weatherResult'
    ];
    
    userOnlyElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Hide welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) welcomeMessage.style.display = 'none';
    
    // Show registration benefits
    const registrationBenefits = document.getElementById('registrationBenefits');
    if (registrationBenefits) registrationBenefits.style.display = 'block';
    
    // Hide login required message
    const loginRequired = document.getElementById('loginRequired');
    if (loginRequired) loginRequired.style.display = 'none';
    
    // Hide profile container
    const profileContainer = document.getElementById('profileContainer');
    if (profileContainer) profileContainer.style.display = 'none';
    
    // Hide activity preferences
    const activityPreferences = document.getElementById('activityPreferences');
    if (activityPreferences) activityPreferences.style.display = 'none';
}

function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            
            // Only show local time if user is logged in
            if (currentUser) {
                // Clear any previous time display
                if (window.localTimeInterval) {
                    clearInterval(window.localTimeInterval);
                }
                getLocalTime(data.coord.lat, data.coord.lon, data.name, data.sys.country);
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert("Error fetching weather data. Please try again.");
        })
        .finally(() => {
            if (loading) loading.style.display = 'none';
        });

}

function displayWeather(data) {
    // Validate data first
    if (!data || !data.weather || !data.weather[0]) {
        console.error('Invalid weather data received:', data);
        return;
    }

    // Update main weather elements
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    document.getElementById('description').textContent = capitalizeFirstLetter(data.weather[0].description);

    // Temperature handling
    const unit = (currentUser && currentUser.preferences.temperatureUnit === 'Fahrenheit') ? 'F' : 'C';
    document.getElementById('temperatureUnit').textContent = unit;

    const temp = convertTemp(data.main.temp, unit);
    const feelsLike = convertTemp(data.main.feels_like, unit);

    // Update temperatures
    document.getElementById('temperature').textContent = Math.round(temp);
    
    // Update feels like temperature display
    const feelsLikeValue = document.querySelector('.feels-like-value');
    feelsLikeValue.textContent = Math.round(feelsLike);


    // Update weather details
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('windSpeed').textContent = data.wind.speed.toFixed(1);
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('country').textContent = data.sys.country;

    // Format sunrise/sunset times
    const sunriseDate = new Date(data.sys.sunrise * 1000);
    const sunsetDate = new Date(data.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = sunriseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('sunset').textContent = sunsetDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Show weather card
    document.getElementById('weatherResult').style.display = 'block';
    updateBackground(data);

    // Show default location button for logged in users
    const defaultLocation = document.getElementById('defaultLocation');
    if (defaultLocation) {
        defaultLocation.style.display = currentUser ? 'block' : 'none';
    }

    // Show unit toggle for logged in users
    const unitToggle = document.getElementById('unitToggle');
    if (unitToggle) {
        unitToggle.style.display = currentUser ? 'flex' : 'none';
    }

    // Get additional data if user is logged in
    if (currentUser) {
        getAirQuality(data.coord.lat, data.coord.lon);
        getUVIndex(data.coord.lat, data.coord.lon);
        getLocalTime(data.coord.lat, data.coord.lon, data.name, data.sys.country);
        
        if (data.coord) {
            loadWeatherMap(data.coord.lat, data.coord.lon);
            getHourlyForecast(data.coord.lat, data.coord.lon);
        }
    } else {
        const hourlyContainer = document.querySelector('.hourly-forecast-container');
        const weatherMap = document.querySelector('.weather-map-container');
        if (hourlyContainer) hourlyContainer.style.display = 'none';
        if (weatherMap) weatherMap.style.display = 'none';
    }

    // Helper functions
    function convertTemp(temp, unit) {
        return unit === 'F' ? (temp * 9/5) + 32 : temp;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

function loadWeatherMap(lat, lon) {
    const zoom = 6;
    const layers = ['clouds', 'precipitation', 'temp', 'wind'];
    const mapContainer = document.getElementById('weatherMap');
    
    mapContainer.innerHTML = '';
    
    const mapUrl = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=${layers[0]}&lat=${lat}&lon=${lon}&zoom=${zoom}`;
    const mapFrame = document.createElement('iframe');
    
    // Add sandbox attributes to limit iframe capabilities
    mapFrame.sandbox = 'allow-same-origin allow-scripts';
    mapFrame.src = mapUrl;
    mapFrame.width = '100%';
    mapFrame.height = '300';
    mapFrame.frameBorder = '0';
    mapFrame.style.borderRadius = '8px';
    
    // Silence errors from the iframe
    mapFrame.onload = function() {
        this.contentWindow.onerror = function() {
            return true; // Silences all errors from the iframe
        };
    };
    
    mapContainer.appendChild(mapFrame);
    
    // Update map controls
    document.querySelectorAll('.map-type').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.map-type').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            mapFrame.src = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=${this.dataset.layer}&lat=${lat}&lon=${lon}&zoom=${zoom}`;
        });
    });
}

function updateWeatherMap(lat, lon, layer) {
    const mapImage = document.getElementById('mapImage');
    const zoom = 5; // Adjust zoom level as needed
    
    // Construct the OpenWeatherMap URL
    const mapUrl = `https://tile.openweathermap.org/map/${layer}_new/${zoom}/${lat}/${lon}.png?appid=${apiKey}`;
    
    // Set the image source
    mapImage.src = mapUrl;
    
    // Add timestamp to prevent caching
    mapImage.src += `&t=${new Date().getTime()}`;
}


function getHourlyForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            // Hide hourly forecast section if there's an error
            const hourlyContainer = document.querySelector('.hourly-forecast-container');
            if (hourlyContainer) hourlyContainer.style.display = 'none';
        });
}

function displayHourlyForecast(data) {
    const hourlyContainer = document.querySelector('.hourly-forecast-container');
    const hourlyForecast = document.getElementById('hourlyForecast');
    
    if (!hourlyContainer || !hourlyForecast) return;
    
    hourlyForecast.innerHTML = '';
    
    // Show only the next 24 hours of forecast (API returns 3-hour intervals for 5 days)
    const now = new Date();
    const next24Hours = data.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;
    });
    
    if (next24Hours.length === 0) {
        hourlyContainer.style.display = 'none';
        return;
    }
    
    next24Hours.forEach(hour => {
        const hourDate = new Date(hour.dt * 1000);
        const timeString = hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Convert temperature if user prefers Fahrenheit
        let temp = hour.main.temp;
        if (currentUser && currentUser.preferences.temperatureUnit === 'Fahrenheit') {
            temp = (temp * 9/5) + 32;
        }
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hourly-time">${timeString}</div>
            <div class="hourly-icon">
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
            </div>
            <div class="hourly-temp">${Math.round(temp)}°</div>
            <div class="hourly-desc">${capitalizeFirstLetter(hour.weather[0].description)}</div>
        `;
        
        hourlyForecast.appendChild(hourlyItem);
    });
    
    hourlyContainer.style.display = 'block';
}


function getAirQuality(lat, lon) {
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(aqiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayAirQuality(data);
        })
        .catch(error => {
            console.error('Error fetching air quality data:', error);
            // Ensure AQI section is hidden if there's an error
            const aqiResult = document.getElementById('aqiResult');
            if (aqiResult) aqiResult.style.display = 'none';
        });
}

function displayAirQuality(data) {
    const aqiResult = document.getElementById('aqiResult');
    const aqiValue = document.getElementById('aqiValue');
    const aqiCategory = document.getElementById('aqiCategory');
    const healthTip = document.getElementById('healthTip');

    const aqi = data.list[0].main.aqi;
    
    // AQI categories and health tips
    const aqiInfo = {
        1: { category: "Good", tip: "Air quality is satisfactory with little health risk." },
        2: { category: "Fair", tip: "Acceptable air quality, but some pollutants may affect sensitive individuals." },
        3: { category: "Moderate", tip: "Members of sensitive groups may experience health effects." },
        4: { category: "Poor", tip: "Everyone may begin to experience health effects." },
        5: { category: "Very Poor", tip: "Health warnings of emergency conditions." }
    };

    aqiValue.textContent = `AQI: ${aqi}`;
    aqiCategory.textContent = `Category: ${aqiInfo[aqi].category}`;
    healthTip.textContent = `Health Tip: ${aqiInfo[aqi].tip}`;

    // Always show AQI result if we have data
    aqiResult.style.display = 'block';
}

function getUVIndex(lat, lon) {
    const uvUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}`;

    fetch(uvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.current && data.current.uvi !== undefined) {
                displayUVIndex(data.current.uvi);
            }
        })
        .catch(error => {
            console.error('Error fetching UV index data:', error);
            // Ensure UV index section is hidden if there's an error
            const uvIndexResult = document.getElementById('uvIndexResult');
            if (uvIndexResult) uvIndexResult.style.display = 'none';
        });
}

function displayUVIndex(uvi) {
    const uvIndexResult = document.getElementById('uvIndexResult');
    const uvIndexValue = document.getElementById('uvIndexValue');
    const uvIndexCategory = document.getElementById('uvIndexCategory');
    const uvIndexTip = document.getElementById('uvIndexTip');

    // UV Index categories and recommendations
    let category, tip;
    if (uvi < 3) {
        category = "Low";
        tip = "Wear sunglasses on bright days.";
    } else if (uvi < 6) {
        category = "Moderate";
        tip = "Stay in shade near midday when the sun is strongest.";
    } else if (uvi < 8) {
        category = "High";
        tip = "Reduce time in the sun between 10 a.m. and 4 p.m.";
    } else if (uvi < 11) {
        category = "Very High";
        tip = "Minimize sun exposure between 10 a.m. and 4 p.m.";
    } else {
        category = "Extreme";
        tip = "Try to avoid sun exposure between 10 a.m. and 4 p.m.";
    }

    uvIndexValue.textContent = `UV Index: ${uvi.toFixed(1)}`;
    uvIndexCategory.textContent = `Category: ${category}`;
    uvIndexTip.textContent = `Recommendation: ${tip}`;

    // Always show UV index if we have data
    uvIndexResult.style.display = 'block';
}

function getLocalTime(lat, lon, city, country) {
    // Use timezone API to get local time
    const timezoneUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(timezoneUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayLocalTime(data.timezone, city, country);
        })
        .catch(error => {
            console.error('Error fetching timezone data:', error);
        });
}

function displayLocalTime(timezoneOffset, city, country) {
    const localTimeElement = document.getElementById('localTime');
    
    // Clear any existing interval to prevent switching
    if (window.localTimeInterval) {
        clearInterval(window.localTimeInterval);
    }

    function updateTime() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (1000 * timezoneOffset));
        
        localTimeElement.innerHTML = `
            <h3>Local Time</h3>
            <p>${city}, ${country}</p>
            <div class="time-circle">${localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <p>${localTime.toLocaleDateString()}</p>
        `;
    }

    // Initial update
    updateTime();
    
    // Update every second
    window.localTimeInterval = setInterval(updateTime, 1000);
    
    localTimeElement.style.display = 'block';
}

function getForecast() {
    const city = document.getElementById('cityInput').value;
    if (!city) return;

    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (!data.list || !data.list[0]) throw new Error('Invalid forecast data');
            displayForecast(data);
            updateBackground(data.list[0]); // Pass the first forecast item
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            setDefaultBackground(); // Set default background on error
        })
        .finally(() => {
            if (loading) loading.style.display = 'none';
        });
}

function displayForecast(data) {
    const forecastResult = document.getElementById('forecastResult');
    const forecastContainer = document.getElementById('forecastContainer');
    const cityName = document.getElementById('cityName');
    
    if (!forecastResult || !forecastContainer || !cityName) return;
    
    cityName.textContent = data.city.name;
    forecastContainer.innerHTML = '';
    
    // Group forecast data by day with min/max temps
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString();
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                date: date,
                temps: [],
                temps_max: [],
                temps_min: [],
                icons: [],
                descriptions: [],
                humidity: [],
                wind_speed: []
            };
        }
        
        dailyForecasts[day].temps.push(item.main.temp);
        dailyForecasts[day].temps_max.push(item.main.temp_max);
        dailyForecasts[day].temps_min.push(item.main.temp_min);
        dailyForecasts[day].icons.push(item.weather[0].icon);
        dailyForecasts[day].descriptions.push(item.weather[0].description);
        dailyForecasts[day].humidity.push(item.main.humidity);
        dailyForecasts[day].wind_speed.push(item.wind.speed);
    });
    
    // Create forecast cards for each day
    Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
        // Calculate values
        const avgTemp = forecast.temps.reduce((sum, temp) => sum + temp, 0) / forecast.temps.length;
        const maxTemp = Math.max(...forecast.temps_max);
        const minTemp = Math.min(...forecast.temps_min);
        const avgHumidity = forecast.humidity.reduce((sum, h) => sum + h, 0) / forecast.humidity.length;
        const avgWindSpeed = forecast.wind_speed.reduce((sum, ws) => sum + ws, 0) / forecast.wind_speed.length;
        
        // Get most frequent icon and description
        const mostFrequentIcon = getMostFrequent(forecast.icons);
        const mostFrequentDescription = getMostFrequent(forecast.descriptions);
        
        // Unit conversion if needed
        let unit = '°C';
        let displayTemp = Math.round(avgTemp);
        let displayMax = Math.round(maxTemp);
        let displayMin = Math.round(minTemp);
        
        if (currentUser && currentUser.preferences.temperatureUnit === 'Fahrenheit') {
            unit = '°F';
            displayTemp = Math.round((avgTemp * 9/5) + 32);
            displayMax = Math.round((maxTemp * 9/5) + 32);
            displayMin = Math.round((minTemp * 9/5) + 32);
        }
        
        // Create forecast card
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-card';
        forecastDay.innerHTML = `
            <div class="forecast-day">${forecast.date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
            <div class="forecast-date">${forecast.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
            
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${mostFrequentIcon}@2x.png" alt="${mostFrequentDescription}">
            </div>
            
            <div class="current-temp">${displayTemp}${unit}</div>
            <div class="weather-desc">${capitalizeFirstLetter(mostFrequentDescription)}</div>
            
            <div class="temp-range">
                <span class="max-temp">↑ ${displayMax}${unit}</span>
                <span class="min-temp">↓ ${displayMin}${unit}</span>
            </div>
            
            <div class="additional-info">
                <span class="humidity">💧 ${Math.round(avgHumidity)}%</span>
                <span class="wind">🌬️ ${Math.round(avgWindSpeed)} m/s</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastDay);
    });
    
    forecastResult.style.display = 'block';
}

// Helper functions
function getMostFrequent(items) {
    const counts = {};
    items.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getHistoricalWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const dateInput = document.getElementById('historicalDate').value;
    
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    
    if (!dateInput) {
        alert("Please select a date.");
        return;
    }

    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';

    try {
        const selectedDate = new Date(dateInput);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Date validation (last 15 years)
        const fifteenYearsAgo = new Date(today);
        fifteenYearsAgo.setFullYear(today.getFullYear() - 15);
        
        if (selectedDate > today) {
            alert("Please select a date in the past.");
            return;
        }

        if (selectedDate < fifteenYearsAgo) {
            alert("Historical data is only available from the past 15 years.");
            return;
        }

        // First get coordinates for the city
        const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
        );
        
        if (!geoResponse.ok) {
            throw new Error('Failed to get city coordinates');
        }
        
        const geoData = await geoResponse.json();
        if (!geoData || geoData.length === 0) {
            throw new Error('City not found');
        }
        
        const { lat, lon } = geoData[0];
        
        // Convert selected date to Unix timestamp
        const unixTimestamp = Math.floor(selectedDate.getTime() / 1000);
        
        // Get historical weather data
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${unixTimestamp}&units=metric&appid=${apiKey}`
        );
        
        if (!weatherResponse.ok) {
            throw new Error(`API error: ${weatherResponse.statusText}`);
        }
        
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.data || weatherData.data.length === 0) {
            throw new Error('No weather data available for this date');
        }
        
        // Use the first data point as a representative for the day
        const representativeData = weatherData.data[0];
        
        // Handle cases where weather data is incomplete
        if (!representativeData.weather || !representativeData.weather[0]) {
            throw new Error('Missing weather data');
        }
        
        displayHistoricalWeather(representativeData, city, dateInput);
        
        // Update background based on weather data
        updateBackground(representativeData);

    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
        
        // Hide the result if there's an error
        const historicalResult = document.getElementById('historicalResult');
        if (historicalResult) historicalResult.style.display = 'none';
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function displayHistoricalWeather(weatherData, city, dateInput) {
    const resultDiv = document.getElementById('historicalResult');
    if (!resultDiv) return;

    // Format date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateInput).toLocaleDateString('en-US', options);

    // Update UI
    document.getElementById('historicalCity').textContent = city;
    document.getElementById('historicalDateDisplay').textContent = formattedDate;
    
    // Temperature unit
    const unit = (currentUser?.preferences?.temperatureUnit === 'Fahrenheit') ? 'F' : 'C';
    document.getElementById('temperatureUnit').textContent = unit;

    const convertTemp = (temp) => {
        return unit === 'F' ? Math.round((temp * 9/5) + 32) : Math.round(temp);
    };

    // Update weather data with better error handling
    document.getElementById('temperature').textContent = weatherData.temp ? convertTemp(weatherData.temp) : '--';
    
    // Handle missing description
    const weatherInfo = weatherData.weather?.[0] || {};
    const description = weatherInfo.description || weatherInfo.main || 'Data not available';
    document.getElementById('description').textContent = capitalizeFirstLetter(description);
    
    document.getElementById('humidity').textContent = weatherData.humidity ?? '--';
    document.getElementById('windSpeed').textContent = weatherData.wind_speed ? weatherData.wind_speed.toFixed(1) : '--';
    document.getElementById('pressure').textContent = weatherData.pressure ?? '--';

    resultDiv.style.display = 'block';
    
    // Update background if weather data is available
    if (weatherInfo.main) {
        updateBackground({ weather: [{ main: weatherInfo.main }] });
    }
}

// Update the DOMContentLoaded event for historical page
document.addEventListener('DOMContentLoaded', function() {
    const historicalDate = document.getElementById('historicalDate');
    if (historicalDate) {
        // Set max date to today
        const today = new Date();
        historicalDate.max = today.toISOString().split('T')[0];
        
        // Set min date to 15 years ago
        const minDate = new Date(today);
        minDate.setFullYear(today.getFullYear() - 15);
        historicalDate.min = minDate.toISOString().split('T')[0];
        
        // Set default date to yesterday
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        historicalDate.value = yesterday.toISOString().split('T')[0];
    }
});

function getRecommendations() {
    const city = document.getElementById('cityInput').value;
    
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    
    if (!currentUser) {
        alert("Please log in to use the activity recommender.");
        return;
    }
    
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
    
    // First get current weather for the city
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.weather || !data.weather[0]) {
                throw new Error('Invalid weather data: Missing weather information');
            }
            
            displayWeatherSummary(data);
            generateActivityRecommendations(data);
            
            // Update background based on weather data
            updateBackground(data);
        })
        .catch(error => {
            console.error('Error fetching weather data for recommendations:', error);
            alert("Error fetching weather data. Please try again.");
            setDefaultBackground();
        })
        .finally(() => {
            if (loading) loading.style.display = 'none';
        });
}

function displayWeatherSummary(data) {
    const weatherSummary = document.getElementById('weatherSummary');
    const cityName = document.getElementById('cityName');
    const temperature = document.getElementById('temperature');
    const temperatureUnit = document.getElementById('temperatureUnit');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    
    if (!weatherSummary || !cityName || !temperature || !temperatureUnit || 
        !description || !humidity || !windSpeed) {
        return;
    }
    
    // Convert temperature if user prefers Fahrenheit
    let temp = data.main.temp;
    let unit = 'C';
    if (currentUser && currentUser.preferences.temperatureUnit === 'Fahrenheit') {
        temp = (temp * 9/5) + 32;
        unit = 'F';
    }
    
    cityName.textContent = data.name;
    temperature.textContent = Math.round(temp);
    temperatureUnit.textContent = unit;
    description.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;
    
    // Improve text visibility by adding a semi-transparent background
    weatherSummary.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    weatherSummary.style.padding = '20px';
    weatherSummary.style.borderRadius = '10px';
    weatherSummary.style.marginTop = '20px';
    weatherSummary.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
    
    weatherSummary.style.display = 'block';
}

function generateActivityRecommendations(weatherData) {
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    const activityRecommendations = document.getElementById('activityRecommendations');
    
    if (!recommendationsContainer || !activityRecommendations || !window.activityDatabase) {
        console.error('Missing elements or activity database not loaded');
        return;
    }
    
    // Get user preferences
    const outdoorActivities = document.getElementById('outdoorActivities').checked;
    const indoorActivities = document.getElementById('indoorActivities').checked;
    const minIntensity = parseInt(document.getElementById('minIntensity').value);
    const maxIntensity = parseInt(document.getElementById('maxIntensity').value);
    const minDuration = parseInt(document.getElementById('minDuration').value);
    const maxDuration = parseInt(document.getElementById('maxDuration').value);
    
    // Filter activities based on weather and user preferences
    const filteredActivities = window.activityDatabase.filter(activity => {
        // Filter by category
        if (activity.category === 'outdoor' && !outdoorActivities) return false;
        if (activity.category === 'indoor' && !indoorActivities) return false;
        
        // Filter by intensity
        if (activity.intensity < minIntensity || activity.intensity > maxIntensity) return false;
        
        // Filter by duration
        if (activity.duration < minDuration || activity.duration > maxDuration) return false;
        
        // Filter by weather conditions
        const weatherCondition = weatherData.weather[0].description.toLowerCase();
        const isWeatherSuitable = activity.weatherConditions.some(condition => 
            weatherCondition.includes(condition) || condition === 'clouds' && weatherCondition.includes('cloud')
        );
        
        // Check temperature
        const isTemperatureSuitable = 
            weatherData.main.temp >= activity.temperatureRange.min && 
            weatherData.main.temp <= activity.temperatureRange.max;
        
        // Check wind speed if applicable
        const isWindSpeedSuitable = activity.windSpeedMax === undefined || 
            weatherData.wind.speed <= activity.windSpeedMax;
        
        // Check minimum wind speed if applicable
        const isWindSpeedMinSuitable = activity.windSpeedMin === undefined || 
            weatherData.wind.speed >= activity.windSpeedMin;
        
        return isWeatherSuitable && isTemperatureSuitable && isWindSpeedSuitable && isWindSpeedMinSuitable;
    });
    
    // Ensure at least one outdoor and one indoor activity are displayed
    let finalActivities = [...filteredActivities];
    
    if (finalActivities.length === 0 || !finalActivities.some(a => a.category === 'outdoor')) {
        const defaultOutdoor = window.activityDatabase.find(a => a.category === 'outdoor');
        if (defaultOutdoor && !finalActivities.includes(defaultOutdoor)) {
            finalActivities.push(defaultOutdoor);
        }
    }
    
    if (finalActivities.length === 0 || !finalActivities.some(a => a.category === 'indoor')) {
        const defaultIndoor = window.activityDatabase.find(a => a.category === 'indoor');
        if (defaultIndoor && !finalActivities.includes(defaultIndoor)) {
            finalActivities.push(defaultIndoor);
        }
    }
    
    // Display recommendations
    activityRecommendations.innerHTML = '';
    
    if (finalActivities.length === 0) {
        activityRecommendations.innerHTML = '<p>No activities available. Please try again later.</p>';
    } else {
        // Sort activities by suitability (simple algorithm)
        const sortedActivities = finalActivities.sort((a, b) => {
            // Prioritize activities with more matching weather conditions
            const aMatchCount = a.weatherConditions.filter(condition => 
                weatherData.weather[0].description.toLowerCase().includes(condition)
            ).length;
            
            const bMatchCount = b.weatherConditions.filter(condition => 
                weatherData.weather[0].description.toLowerCase().includes(condition)
            ).length;
            
            return bMatchCount - aMatchCount;
        });
        
        // Display top 6 activities (or all if fewer than 6)
        const activitiesToDisplay = sortedActivities.slice(0, 6);
        
        activitiesToDisplay.forEach(activity => {
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            
            // Add icon based on activity title
            const icon = getActivityIcon(activity.name);
            
            const tagsHtml = activity.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            activityCard.innerHTML = `
                <div class="activity-icon">${icon}</div>
                <h3>${activity.name}</h3>
                <p class="description">${activity.description}</p>
                <p>Category: ${activity.category === 'outdoor' ? 'Outdoor' : 'Indoor'}</p>
                <p>Intensity: ${'★'.repeat(activity.intensity)}${'☆'.repeat(5 - activity.intensity)}</p>
                <p>Duration: ${activity.duration} minutes</p>
                <div class="tags">${tagsHtml}</div>
            `;
            
            activityRecommendations.appendChild(activityCard);
        });
    }
    
    recommendationsContainer.style.display = 'block';
}

function getActivityIcon(activityName) {
    // Map activity names to Font Awesome icons
    const iconMap = {
        'Hiking': '<i class="fas fa-hiking"></i>',
        'Cycling': '<i class="fas fa-bicycle"></i>',
        'Picnic': '<i class="fas fa-utensils"></i>',
        'Photography': '<i class="fas fa-camera"></i>',
        'Jogging': '<i class="fas fa-running"></i>',
        'Gardening': '<i class="fas fa-seedling"></i>',
        'Reading': '<i class="fas fa-book"></i>',
        'Cooking': '<i class="fas fa-utensils"></i>',
        'Board Games': '<i class="fas fa-gamepad"></i>',
        'Movie Marathon': '<i class="fas fa-film"></i>',
        'Home Workout': '<i class="fas fa-dumbbell"></i>',
        'Arts and Crafts': '<i class="fas fa-paint-brush"></i>',
        'Baking': '<i class="fas fa-birthday-cake"></i>',
        'Online Learning': '<i class="fas fa-laptop"></i>',
        'Indoor Swimming': '<i class="fas fa-swimmer"></i>',
        'Museum Visit': '<i class="fas fa-landmark"></i>',
        'Shopping': '<i class="fas fa-shopping-bag"></i>',
        'Hot Cocoa and Book': '<i class="fas fa-mug-hot"></i>',
        'Puzzle Solving': '<i class="fas fa-puzzle-piece"></i>'
    };
    
    return iconMap[activityName] || '<i class="fas fa-question"></i>';
}

// User Preferences Functions
function updatePreferences() {
    if (!currentUser) return;
    
    const temperatureUnit = document.querySelector('input[name="temperatureUnit"]:checked').value;
    
    currentUser.preferences.temperatureUnit = temperatureUnit;
    
    // Update in users array
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].preferences = currentUser.preferences;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Refresh weather display with new unit
    const path = window.location.pathname;
    if (path.includes('forecast.html')) {
        getForecast();
    } else if (path.includes('historical.html')) {
        getHistoricalWeather();
    } else if (path.includes('recommender.html')) {
        getRecommendations();
    } else {
        getWeather();
    }
}

function setDefaultLocation() {
    if (!currentUser) return;
    
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert("Please enter a city name first.");
        return;
    }
    
    currentUser.defaultLocation = city;
    
    // Update in users array
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].defaultLocation = city;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    alert(`${city} has been set as your default location.`);
    
    // Update profile page if on it
    const defaultLocationDisplay = document.getElementById('defaultLocationDisplay');
    if (defaultLocationDisplay) {
        defaultLocationDisplay.textContent = city;
    }
}

function updateDefaultLocation() {
    if (!currentUser) return;
    
    const city = document.getElementById('defaultLocationInput').value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    
    currentUser.defaultLocation = city;
    
    // Update in users array
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].defaultLocation = city;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    document.getElementById('defaultLocationDisplay').textContent = city;
    document.getElementById('defaultLocationInput').value = '';
    
    alert(`${city} has been set as your default location.`);
}

// Favorites Functions
function showFavCities() {
    const favCitiesModal = document.getElementById('favCitiesModal');
    favCitiesModal.style.display = 'block';
    updateFavCitiesList();
}

function toggleFavCityActions() {
    const favCityActions = document.getElementById('favCityActions');
    favCityActions.style.display = favCityActions.style.display === 'none' ? 'block' : 'none';
}

function addFavCity() {
    const cityInput = document.getElementById('favCityInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    
    if (!currentUser) {
        alert('Please log in to add favorite cities.');
        return;
    }
    
    // Initialize favorites array if it doesn't exist
    if (!currentUser.favorites) {
        currentUser.favorites = [];
    }
    
    // Check if city is already in favorites
    if (currentUser.favorites.includes(city)) {
        alert('City already in favorites.');
        return;
    }
    
    // Add to favorites
    currentUser.favorites.push(city);
    
    // Update in users array
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].favorites = currentUser.favorites;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    cityInput.value = '';
    updateFavCitiesList();
    
    // Also update profile favorites list if on profile page
    updateProfileFavoritesList();
}

function removeFavCity(city) {
    if (!currentUser || !currentUser.favorites) return;
    
    // Remove from favorites
    currentUser.favorites = currentUser.favorites.filter(c => c !== city);
    
    // Update in users array
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].favorites = currentUser.favorites;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    updateFavCitiesList();
    
    // Also update profile favorites list if on profile page
    updateProfileFavoritesList();
}

function updateFavCitiesList() {
    const favCitiesList = document.getElementById('favCitiesList');
    if (!favCitiesList) return;
    
    favCitiesList.innerHTML = '';
    
    if (!currentUser || !currentUser.favorites || currentUser.favorites.length === 0) {
        favCitiesList.innerHTML = '<li>No favorite cities added yet.</li>';
        return;
    }
    
    currentUser.favorites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        
        // Add click handler to show weather for this city
        li.style.cursor = 'pointer';
        li.onclick = function(e) {
            if (e.target !== this) return; // Ignore clicks on child elements
            
            document.getElementById('cityInput').value = city;
            closeModal('favCitiesModal');
            
            // Call appropriate function based on current page
            const path = window.location.pathname;
            if (path.includes('forecast.html')) {
                getForecast();
            } else if (path.includes('historical.html')) {
                // Just set the input, user needs to select date
            } else if (path.includes('recommender.html')) {
                getRecommendations();
            } else {
                getWeather();
            }
        };
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = function(e) {
            e.stopPropagation(); // Prevent triggering the li click
            removeFavCity(city);
        };
        
        li.appendChild(removeBtn);
        favCitiesList.appendChild(li);
    });
}

function updateProfileFavoritesList() {
    const profileFavoritesList = document.getElementById('profileFavoritesList');
    if (!profileFavoritesList) return;
    
    profileFavoritesList.innerHTML = '';
    
    if (!currentUser || !currentUser.favorites || currentUser.favorites.length === 0) {
        profileFavoritesList.innerHTML = '<li>No favorite cities added yet.</li>';
        return;
    }
    
    currentUser.favorites.forEach(city => {
        const li = document.createElement('li');
        
        const citySpan = document.createElement('span');
        citySpan.textContent = city;
        li.appendChild(citySpan);
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = function() {
            removeFavCity(city);
        };
        
        li.appendChild(removeBtn);
        profileFavoritesList.appendChild(li);
    });
}

function addToFavorites() {
    const cityInput = document.getElementById('newFavoriteInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    
    if (!currentUser) {
        alert('Please log in to add favorite cities.');
        return;
    }
    
    // Initialize favorites array if it doesn't exist
    if (!currentUser.favorites) {
        currentUser.favorites = [];
    }
    
    // Check if city is already in favorites
    if (currentUser.favorites.includes(city)) {
        alert('City already in favorites.');
        return;
    }
    
    // Add to favorites
    currentUser.favorites.push(city);
    
    // Update in users array
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].favorites = currentUser.favorites;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    cityInput.value = '';
    updateProfileFavoritesList();
}

// Geolocation Functions
function getLocation() {
    if (navigator.geolocation) {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            error => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please enter a city name.');
                if (loading) loading.style.display = 'none';
            }
        );
    } else {
        alert('Geolocation is not supported by this browser. Please enter a city name.');
    }
}

function getLocationForForecast() {
    if (navigator.geolocation) {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getForecastByCoords(lat, lon);
            },
            error => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please enter a city name.');
                if (loading) loading.style.display = 'none';
            }
        );
    } else {
        alert('Geolocation is not supported by this browser. Please enter a city name.');
    }
}

function getLocationForHistorical() {
    if (navigator.geolocation) {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getHistoricalWeatherByCoords(lat, lon);
            },
            error => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please enter a city name.');
                if (loading) loading.style.display = 'none';
            }
        );
    } else {
        alert('Geolocation is not supported by this browser. Please enter a city name.');
    }
}

function getLocationForRecommendations() {
    if (navigator.geolocation) {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getRecommendationsByCoords(lat, lon);
            },
            error => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please enter a city name.');
                if (loading) loading.style.display = 'none';
            }
        );
    } else {
        alert('Geolocation is not supported by this browser. Please enter a city name.');
    }
}

function getWeatherByCoords(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const loading = document.getElementById('loading');
    
    if (loading) loading.style.display = 'block';

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('cityInput').value = data.name;
            displayWeather(data);
            
            if (currentUser) {
                // Clear any previous time display
                if (window.localTimeInterval) {
                    clearInterval(window.localTimeInterval);
                }
                getLocalTime(lat, lon, data.name, data.sys.country);
                
                // Get additional data
                getHourlyForecast(lat, lon);
                getWeatherSummary(lat, lon);
            } else {
                // Hide premium features if not logged in
                const hourlyContainer = document.querySelector('.hourly-forecast-container');
                const summaryContainer = document.querySelector('.weather-summary-container');
                if (hourlyContainer) hourlyContainer.style.display = 'none';
                if (summaryContainer) summaryContainer.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert("Error fetching weather data. Please try again.");
            
            // Hide premium features on error
            const hourlyContainer = document.querySelector('.hourly-forecast-container');
            const summaryContainer = document.querySelector('.weather-summary-container');
            if (hourlyContainer) hourlyContainer.style.display = 'none';
            if (summaryContainer) summaryContainer.style.display = 'none';
        })
        .finally(() => {
            if (loading) loading.style.display = 'none';
        });
}

function getForecastByCoords(lat, lon) {
    const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    
    fetch(reverseGeoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(geoData => {
            if (geoData.length === 0) {
                throw new Error('Location not found');
            }
            
            // Update city input with the retrieved location name
            document.getElementById('cityInput').value = geoData[0].name;
            
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            return fetch(forecastUrl);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
            
            // Update background based on current weather
            updateBackground(data.list[0].weather[0].main);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert("Error fetching forecast data. Please try again.");
        })
        .finally(() => {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        });
}

function getWeatherByCoords(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const loading = document.getElementById('loading');
    
    if (loading) loading.style.display = 'block';

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('cityInput').value = data.name;
            displayWeather(data);
            
            // Load weather map for all users
            loadWeatherMap(lat, lon);
            
            if (currentUser) {
                // Clear any previous time display
                if (window.localTimeInterval) {
                    clearInterval(window.localTimeInterval);
                }
                getLocalTime(lat, lon, data.name, data.sys.country);
                
                // Get hourly forecast for logged-in users
                getHourlyForecast(lat, lon);
            } else {
                // Hide premium features if not logged in
                const hourlyContainer = document.querySelector('.hourly-forecast-container');
                if (hourlyContainer) hourlyContainer.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert("Error fetching weather data. Please try again.");
            
            // Hide elements on error
            const hourlyContainer = document.querySelector('.hourly-forecast-container');
            const weatherMap = document.querySelector('.weather-map-container');
            if (hourlyContainer) hourlyContainer.style.display = 'none';
            if (weatherMap) weatherMap.style.display = 'none';
        })
        .finally(() => {
            if (loading) loading.style.display = 'none';
        });
}

function getRecommendationsByCoords(lat, lon) {
    const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    
    fetch(reverseGeoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(geoData => {
            if (geoData.length === 0) {
                throw new Error('Location not found');
            }
            
            // Update city input with the retrieved location name
            document.getElementById('cityInput').value = geoData[0].name;
            
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            return fetch(weatherUrl);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWeatherSummary(data);
            generateActivityRecommendations(data);
            
            // Update background based on weather
            updateBackground(data.weather[0].main);
        })
        .catch(error => {
            console.error('Error fetching weather data for recommendations:', error);
            alert("Error fetching weather data. Please try again.");
        })
        .finally(() => {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        });
}

// UI Helper Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function toggleMenu() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu.style.display === 'none') {
        dropdownMenu.style.display = 'block';
    } else {
        dropdownMenu.style.display = 'none';
    }
}

// Close dropdown menu when clicking outside
document.addEventListener('click', function(event) {
    const menuButton = document.getElementById('menuButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
    }
});

function showSettings() {
    // Implement settings functionality
    alert("Settings page is not yet implemented.");
}

function updateBackground(weatherData) {
    // Validate input data structure
    if (!weatherData || typeof weatherData !== 'object') {
        console.error('Invalid weather data: No data received');
        setDefaultBackground();
        return;
    }

    // Check for required weather array
    if (!weatherData.weather || !Array.isArray(weatherData.weather) || weatherData.weather.length === 0) {
        console.error('Invalid weather data: Missing weather array', weatherData);
        setDefaultBackground();
        return;
    }

    // Validate first weather entry
    const primaryWeather = weatherData.weather[0];
    if (!primaryWeather || !primaryWeather.main) {
        console.error('Invalid weather data: Missing main weather information', weatherData);
        setDefaultBackground();
        return;
    }

    // Weather condition mapping with fallbacks
    const weatherImages = {
        'Clear': 'clear.jpg',
        'Clouds': 'scattered.jpg',
        'Rain': 'rain.jpg',
        'Drizzle': 'drizzle.jpg',
        'Thunderstorm': 'thunderstorm.jpg',
        'Snow': 'snow.jpg',
        'Mist': 'mist.jpg',
        'Fog': 'mist.jpg',
        'Haze': 'haze.jpg',
        'Smoke': 'smoke.jpg',
        // Additional variations
        'Sand': 'haze.jpg',
        'Dust': 'haze.jpg',
        'Squalls': 'thunderstorm.jpg',
        'Tornado': 'thunderstorm.jpg'
    };

    // Normalize main weather (capitalize first letter)
    const mainWeather = primaryWeather.main;
    
    // Find matching image with fallback logic
    let imageFile = 'default.jpg';
    
    // First try exact match
    if (weatherImages[mainWeather]) {
        imageFile = weatherImages[mainWeather];
    }
    // Then try partial matches
    else {
        for (const [key, value] of Object.entries(weatherImages)) {
            if (mainWeather.toLowerCase().includes(key.toLowerCase())) {
                imageFile = value;
                break;
            }
        }
    }

    // Determine correct path based on current page location
    const isPagesPath = window.location.pathname.includes('/pages/');
    const basePath = isPagesPath ? '../images/' : 'images/';
    const imagePath = basePath + imageFile;

    // Create image preloader to verify file exists
    const img = new Image();
    img.onload = function() {
        document.body.style.backgroundImage = `url('${imagePath}')`;
        document.body.style.transition = 'background-image 0.5s ease-in-out';
        console.log('Background successfully set to:', imagePath);
    };
    img.onerror = function() {
        console.warn('Failed to load background image:', imagePath);
        setDefaultBackground();
    };
    img.src = imagePath;
}

// Helper function for default background
function setDefaultBackground() {
    const isPagesPath = window.location.pathname.includes('/pages/');
    const defaultPath = isPagesPath ? '../images/default.jpg' : 'images/default.jpg';
    
    document.body.style.backgroundImage = `url('${defaultPath}')`;
    document.body.style.transition = 'background-image 0.5s ease-in-out';
}

function updateRecommendations() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert("Please enter a city name first.");
        return;
    }
    
    getRecommendations();
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Window load event to check login status
window.addEventListener('load', function() {
    checkUserLogin();
    loadPageContent();
});
