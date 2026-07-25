/* ==========================================================================
   DYNAMIC WEATHER APP - JAVASCRIPT LOGIC
   Open-Meteo API (Free Geocoding & Weather API)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // State Variables
  let currentUnit = 'C'; // 'C' or 'F'
  let currentCityData = { name: 'Phetchaburi', country: 'Thailand', lat: 13.1119, lon: 99.9405 };
  let currentWeatherData = null;
  let favoriteCities = JSON.parse(localStorage.getItem('weather_fav_cities')) || ['Phetchaburi', 'Bangkok', 'Chiang Mai', 'Tokyo', 'London'];

  // DOM Elements
  const cityInput = document.getElementById('city-input');
  const searchBtn = document.getElementById('search-btn');
  const geoBtn = document.getElementById('geo-btn');
  const unitBtn = document.getElementById('unit-btn');
  const favContainer = document.getElementById('fav-container');
  const loaderOverlay = document.getElementById('loader-overlay');
  const favToggleBtn = document.getElementById('fav-toggle-btn');

  // WMO Weather Code Interpreter Dictionary
  const wmoWeatherMap = {
    0: { text: 'ท้องฟ้าแจ่มใส (Clear Sky)', icon: 'fa-sun', theme: 'theme-clear-day', color: '#F59E0B' },
    1: { text: 'แจ่มใสเป็นส่วนใหญ่ (Mainly Clear)', icon: 'fa-cloud-sun', theme: 'theme-clear-day', color: '#F59E0B' },
    2: { text: 'มีเมฆบางส่วน (Partly Cloudy)', icon: 'fa-cloud-sun', theme: 'theme-cloudy', color: '#38BDF8' },
    3: { text: 'มีเมฆมาก (Overcast)', icon: 'fa-cloud', theme: 'theme-cloudy', color: '#94A3B8' },
    45: { text: 'มีหมอก (Fog)', icon: 'fa-smog', theme: 'theme-cloudy', color: '#CBD5E1' },
    48: { text: 'หมอกน้ำค้างแข็ง (Depositing Rime Fog)', icon: 'fa-smog', theme: 'theme-cloudy', color: '#CBD5E1' },
    51: { text: 'ละอองฝนเบาบาง (Light Drizzle)', icon: 'fa-cloud-rain', theme: 'theme-rainy', color: '#38BDF8' },
    53: { text: 'ละอองฝนปานกลาง (Drizzle)', icon: 'fa-cloud-rain', theme: 'theme-rainy', color: '#38BDF8' },
    55: { text: 'ละอองฝนตกหนัก (Heavy Drizzle)', icon: 'fa-cloud-showers-heavy', theme: 'theme-rainy', color: '#0284C7' },
    61: { text: 'ฝนตกเล็กน้อย (Slight Rain)', icon: 'fa-cloud-rain', theme: 'theme-rainy', color: '#38BDF8' },
    63: { text: 'ฝนตกปานกลาง (Moderate Rain)', icon: 'fa-cloud-showers-heavy', theme: 'theme-rainy', color: '#0284C7' },
    65: { text: 'ฝนตกหนักมาก (Heavy Rain)', icon: 'fa-cloud-showers-water', theme: 'theme-rainy', color: '#1E3A8A' },
    71: { text: 'หิมะตกเล็กน้อย (Slight Snow)', icon: 'fa-snowflake', theme: 'theme-snowy', color: '#E0F2FE' },
    73: { text: 'หิมะตกปานกลาง (Moderate Snow)', icon: 'fa-snowflake', theme: 'theme-snowy', color: '#BAE6FD' },
    75: { text: 'หิมะตกหนัก (Heavy Snow)', icon: 'fa-snowflake', theme: 'theme-snowy', color: '#7DD3FC' },
    80: { text: 'ฝนซู่เล็กน้อย (Slight Rain Showers)', icon: 'fa-cloud-sun-rain', theme: 'theme-rainy', color: '#38BDF8' },
    81: { text: 'ฝนซูปานกลาง (Moderate Showers)', icon: 'fa-cloud-showers-heavy', theme: 'theme-rainy', color: '#0284C7' },
    82: { text: 'ฝนซู่รุนแรง (Violent Showers)', icon: 'fa-cloud-showers-water', theme: 'theme-rainy', color: '#1E3A8A' },
    95: { text: 'พายุฝนฟ้าคะนอง (Thunderstorm)', icon: 'fa-cloud-bolt', theme: 'theme-thunder', color: '#F59E0B' },
    96: { text: 'พายุฝนพร้อมลูกเห็บ (Thunderstorm + Hail)', icon: 'fa-cloud-bolt', theme: 'theme-thunder', color: '#EF4444' }
  };

  // Helper Functions
  const showLoader = () => loaderOverlay?.classList.add('active');
  const hideLoader = () => loaderOverlay?.classList.remove('active');

  const convertTemp = (tempC) => {
    if (tempC === null || tempC === undefined) return '--';
    if (currentUnit === 'F') {
      return Math.round((tempC * 9 / 5) + 32) + '°F';
    }
    return Math.round(tempC) + '°C';
  };

  // Render Favorites Bar
  const renderFavorites = () => {
    if (!favContainer) return;
    favContainer.innerHTML = '';
    favoriteCities.forEach(cityName => {
      const tag = document.createElement('span');
      tag.className = 'fav-tag';
      tag.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cityName}`;
      tag.addEventListener('click', () => searchCity(cityName));
      favContainer.appendChild(tag);
    });
  };

  // Search City Lat/Lon via Open-Meteo Geocoding API
  async function searchCity(cityName) {
    if (!cityName.trim()) return;
    showLoader();
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        currentCityData = {
          name: place.name,
          country: place.country || place.admin1 || '',
          lat: place.latitude,
          lon: place.longitude
        };
        await fetchWeatherData(place.latitude, place.longitude);
      } else {
        alert(`ไม่พบข้อมูลเมือง "${cityName}" กรุณาลองค้นหาชื่ออื่นภาษาอังกฤษครับ`);
      }
    } catch (err) {
      console.error('Error searching city:', err);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่');
    } finally {
      hideLoader();
    }
  }

  // Fetch Weather Data via Open-Meteo Forecast API
  async function fetchWeatherData(lat, lon) {
    showLoader();
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
      const res = await fetch(weatherUrl);
      const data = await res.json();
      currentWeatherData = data;
      renderWeatherDashboard(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูลสภาพอากาศ');
    } finally {
      hideLoader();
    }
  }

  // Render Full Weather Dashboard UI
  function renderWeatherDashboard(data) {
    const current = data.current_weather;
    const daily = data.daily;
    const hourly = data.hourly;

    const weatherInfo = wmoWeatherMap[current.weathercode] || { text: 'สภาพอากาศปกติ', icon: 'fa-sun', theme: 'theme-clear-day', color: '#F59E0B' };

    // 1. Update Dynamic Theme
    document.body.className = '';
    // Check if night time (6pm - 6am)
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      document.body.classList.add('theme-clear-night');
    } else {
      document.body.classList.add(weatherInfo.theme);
    }

    // 2. City & Location
    document.getElementById('display-city').textContent = currentCityData.name;
    document.getElementById('display-country').textContent = currentCityData.country;
    document.getElementById('display-date').textContent = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

    // 3. Current Temp & Condition
    document.getElementById('display-temp').textContent = convertTemp(current.temperature);
    document.getElementById('display-condition').textContent = weatherInfo.text;
    document.getElementById('weather-icon').className = `fa-solid ${weatherInfo.icon} weather-icon-large`;
    document.getElementById('weather-icon').style.color = weatherInfo.color;

    const maxTemp = daily?.temperature_2m_max?.[0];
    const minTemp = daily?.temperature_2m_min?.[0];
    document.getElementById('display-range').textContent = `สูงสุด: ${convertTemp(maxTemp)} | ต่ำสุด: ${convertTemp(minTemp)}`;

    // 4. Stats Grid (Feels like, Wind, Humidity, UV, Pressure)
    document.getElementById('stat-feels').textContent = convertTemp(current.temperature - 0.5); // Approx
    document.getElementById('stat-wind').textContent = `${current.windspeed} km/h`;
    
    const currentHumidity = hourly?.relativehumidity_2m?.[0] || 65;
    document.getElementById('stat-humidity').textContent = `${currentHumidity}%`;

    const uvMax = daily?.uv_index_max?.[0] || 5.2;
    document.getElementById('stat-uv').textContent = `${uvMax} Index`;

    // 5. Render 24-Hour Forecast
    const hourlyScroll = document.getElementById('hourly-scroll');
    hourlyScroll.innerHTML = '';
    const nowHour = new Date().getHours();
    for (let i = 0; i < 24; i++) {
      const idx = nowHour + i;
      if (idx >= hourly.time.length) break;
      
      const timeStr = new Date(hourly.time[idx]).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const tempVal = hourly.temperature_2m[idx];
      const code = hourly.weathercode[idx];
      const hInfo = wmoWeatherMap[code] || wmoWeatherMap[0];

      const hCard = document.createElement('div');
      hCard.className = 'hourly-card';
      hCard.innerHTML = `
        <span class="hourly-time">${timeStr}</span>
        <i class="fa-solid ${hInfo.icon} hourly-icon" style="color:${hInfo.color}"></i>
        <span class="hourly-temp">${convertTemp(tempVal)}</span>
      `;
      hourlyScroll.appendChild(hCard);
    }

    // 6. Render 7-Day Forecast
    const dailyList = document.getElementById('daily-list');
    dailyList.innerHTML = '';
    for (let d = 0; d < Math.min(7, daily.time.length); d++) {
      const dayDate = new Date(daily.time[d]);
      const dayName = d === 0 ? 'วันนี้' : dayDate.toLocaleDateString('th-TH', { weekday: 'short' });
      const code = daily.weathercode[d];
      const dInfo = wmoWeatherMap[code] || wmoWeatherMap[0];
      const dMax = daily.temperature_2m_max[d];
      const dMin = daily.temperature_2m_min[d];

      const dRow = document.createElement('div');
      dRow.className = 'daily-row';
      dRow.innerHTML = `
        <span class="daily-day">${dayName}</span>
        <div class="daily-condition">
          <i class="fa-solid ${dInfo.icon}" style="color:${dInfo.color}"></i>
          <span>${dInfo.text.split(' (')[0]}</span>
        </div>
        <div class="daily-temp-bar">
          <span style="color: var(--text-muted);">${convertTemp(dMin)}</span>
          <span style="color: var(--text-primary);">${convertTemp(dMax)}</span>
        </div>
      `;
      dailyList.appendChild(dRow);
    }

    // Update Favorite Toggle Button State
    if (favoriteCities.includes(currentCityData.name)) {
      favToggleBtn?.classList.add('active');
    } else {
      favToggleBtn?.classList.remove('active');
    }
  }

  // Event Listeners
  searchBtn?.addEventListener('click', () => {
    searchCity(cityInput.value);
  });

  cityInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCity(cityInput.value);
  });

  // Toggle °C / °F
  unitBtn?.addEventListener('click', () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    unitBtn.textContent = `°${currentUnit}`;
    if (currentWeatherData) {
      renderWeatherDashboard(currentWeatherData);
    }
  });

  // Geolocation API (Current Location)
  geoBtn?.addEventListener('click', () => {
    if (navigator.geolocation) {
      showLoader();
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          currentCityData = { name: 'ตำแหน่งของคุณ', country: 'GPS Location', lat, lon };
          await fetchWeatherData(lat, lon);
        },
        (error) => {
          hideLoader();
          alert('ไม่สามารถระบุพิกัดตำแหน่งปัจจุบันได้ กรุณาอนุญาตการเข้าถึง Location ในเบราว์เซอร์ครับ');
        }
      );
    } else {
      alert('เบราว์เซอร์ของคุณไม่รองรับ Geolocation');
    }
  });

  // Favorite Toggle Button
  favToggleBtn?.addEventListener('click', () => {
    const cityName = currentCityData.name;
    if (favoriteCities.includes(cityName)) {
      favoriteCities = favoriteCities.filter(c => c !== cityName);
      favToggleBtn.classList.remove('active');
    } else {
      favoriteCities.push(cityName);
      favToggleBtn.classList.add('active');
    }
    localStorage.setItem('weather_fav_cities', JSON.stringify(favoriteCities));
    renderFavorites();
  });

  // Initial Load (Default: Phetchaburi)
  renderFavorites();
  fetchWeatherData(currentCityData.lat, currentCityData.lon);
});
