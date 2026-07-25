/* ==========================================================================
   SKYPULSE WEATHER AI - LANDING PAGE INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // 2. Live Weather Preview Widget (Open-Meteo API)
  const widgetInput = document.getElementById('widget-city-input');
  const widgetSearchBtn = document.getElementById('widget-search-btn');
  const widgetCityName = document.getElementById('widget-city-name');
  const widgetTemp = document.getElementById('widget-temp');
  const widgetCondition = document.getElementById('widget-condition');
  const widgetIcon = document.getElementById('widget-icon');
  const widgetWind = document.getElementById('widget-wind');
  const widgetHumidity = document.getElementById('widget-humidity');

  const weatherMap = {
    0: { text: 'แจ่มใส (Clear Sky)', icon: 'fa-sun', color: '#F59E0B' },
    1: { text: 'แจ่มใสเป็นส่วนใหญ่', icon: 'fa-cloud-sun', color: '#F59E0B' },
    2: { text: 'มีเมฆบางส่วน', icon: 'fa-cloud-sun', color: '#38BDF8' },
    3: { text: 'มีเมฆมาก', icon: 'fa-cloud', color: '#94A3B8' },
    61: { text: 'ฝนตกเล็กน้อย', icon: 'fa-cloud-rain', color: '#38BDF8' },
    63: { text: 'ฝนตกปานกลาง', icon: 'fa-cloud-showers-heavy', color: '#0284C7' },
    95: { text: 'พายุฝนฟ้าคะนอง', icon: 'fa-cloud-bolt', color: '#EF4444' }
  };

  async function fetchLivePreview(cityName) {
    if (!cityName.trim()) return;
    try {
      // Geocoding API
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        // Forecast API
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true&hourly=relativehumidity_2m`);
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        const info = weatherMap[current.weathercode] || weatherMap[0];

        if (widgetCityName) widgetCityName.textContent = place.name;
        if (widgetTemp) widgetTemp.textContent = `${Math.round(current.temperature)}°C`;
        if (widgetCondition) widgetCondition.textContent = info.text;
        if (widgetIcon) {
          widgetIcon.className = `fa-solid ${info.icon}`;
          widgetIcon.style.color = info.color;
        }
        if (widgetWind) widgetWind.textContent = `${current.windspeed} km/h`;
        if (widgetHumidity) {
          const hum = weatherData.hourly?.relativehumidity_2m?.[0] || 65;
          widgetHumidity.textContent = `${hum}%`;
        }
      }
    } catch (err) {
      console.error('Widget error:', err);
    }
  }

  widgetSearchBtn?.addEventListener('click', () => fetchLivePreview(widgetInput.value));
  widgetInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchLivePreview(widgetInput.value);
  });

  // Initial Widget Data (Phetchaburi)
  fetchLivePreview('Phetchaburi');

  // 3. Pricing Toggle (Monthly vs Annual)
  const billingToggle = document.getElementById('billing-toggle');
  const pricePro = document.getElementById('price-pro');

  billingToggle?.addEventListener('change', (e) => {
    if (e.target.checked) {
      if (pricePro) pricePro.textContent = '฿99';
    } else {
      if (pricePro) pricePro.textContent = '฿129';
    }
  });

  // 4. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
});
