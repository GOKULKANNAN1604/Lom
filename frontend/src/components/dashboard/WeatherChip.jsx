import React, { useEffect, useState } from 'react';

// Maps World Weather Online condition codes to beautiful emojis
const getWeatherEmoji = (code, desc) => {
  const c = parseInt(code, 10);
  if (c === 113) return '☀️'; // Sunny/Clear
  if (c === 116) return '⛅'; // Partly Cloudy
  if (c === 119) return '☁️'; // Cloudy
  if (c === 122) return '☁️'; // Overcast
  if ([143, 248, 260].includes(c)) return '🌫️'; // Mist/Fog
  if ([176, 263, 266, 293, 296, 353].includes(c)) return '🌦️'; // Light Rain / Drizzle
  if ([185, 281, 284, 299, 302, 305, 308, 311, 314, 356, 359].includes(c)) return '🌧️'; // Heavy/Moderate Rain
  if ([200, 386, 389].includes(c)) return '⛈️'; // Thunderstorm
  if ([179, 182, 317, 320, 392, 395].includes(c)) return '🌨️'; // Snow/Sleet
  
  // Fallback on keywords in description
  const d = (desc || '').toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) return '⛈️';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return '🌧️';
  if (d.includes('snow') || d.includes('sleet') || d.includes('hail')) return '🌨️';
  if (d.includes('fog') || d.includes('mist') || d.includes('haze') || d.includes('dust')) return '🌫️';
  if (d.includes('cloud') || d.includes('overcast')) return '⛅';
  if (d.includes('sun') || d.includes('clear')) return '☀️';
  
  return '🌡️';
};

const WeatherChip = () => {
  const [weather, setWeather] = useState({ icon: '🌥️', temp: '--', description: '', location: '' });
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    // Set user timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);

    const fetchWeather = async (query = '') => {
      try {
        const resp = await fetch(`https://wttr.in/${query}?format=j1`);
        if (!resp.ok) throw new Error('Weather API error');
        const data = await resp.json();
        const cur = data.current_condition[0];
        const code = cur.weatherCode;
        const desc = cur.weatherDesc[0]?.value;
        const temp = cur.temp_C;
        const emoji = getWeatherEmoji(code, desc);

        let location = '';
        if (data.nearest_area && data.nearest_area[0]) {
          const area = data.nearest_area[0];
          const city = area.areaName[0]?.value;
          const country = area.country[0]?.value;
          location = city || country || '';
        }

        setWeather({
          icon: emoji,
          temp: temp + '°C',
          description: desc,
          location: location
        });
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    };

    // Load by IP first (immediate, no permission required, highly reliable)
    fetchWeather('');

    // If geolocation is available, refine search
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeather(`${latitude},${longitude}`);
        },
        () => {
          // Geolocation prompt denied or timed out — fallback is already active
        }
      );
    }
  }, []);

  const displayLocation = weather.location || (timezone ? timezone.split('/').pop().replace('_', ' ') : '');

  return (
    <div className="flex items-center gap-2 text-xs text-secondary bg-white/[0.03] border border-border rounded-xl px-3 py-1.5 shadow-sm">
      <span className="text-sm leading-none" role="img" aria-label="weather-emoji">
        {weather.icon}
      </span>
      <span className="font-bold text-primary">{weather.temp}</span>
      {displayLocation && (
        <span className="text-[10px] text-muted font-bold tracking-wider uppercase border-l border-border pl-2 leading-none">
          {displayLocation}
        </span>
      )}
    </div>
  );
};

export default WeatherChip;
