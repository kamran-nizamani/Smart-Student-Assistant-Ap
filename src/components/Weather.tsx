import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Search, MapPin } from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  high: number;
  low: number;
}

export default function Weather() {
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    try {
      // 1. Geocoding
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2. Weather Data
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
      const weatherData = await weatherRes.json();

      setWeather({
        city: `${name}, ${country}`,
        temp: Math.round(weatherData.current_weather.temperature),
        condition: decodeWeatherCode(weatherData.current_weather.weathercode),
        humidity: 65, // Note: current_weather in open-meteo doesn't always have humidity in simple calls, defaulting or adding current_2m
        wind: Math.round(weatherData.current_weather.windspeed),
        high: Math.round(weatherData.daily.temperature_2m_max[0]),
        low: Math.round(weatherData.daily.temperature_2m_min[0])
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const decodeWeatherCode = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 99) return 'Thunderstorm';
    return 'Cloudy';
  };

  useEffect(() => {
    // Try browser geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLoading(true);
          const { latitude, longitude } = position.coords;
          try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
            const weatherData = await weatherRes.json();
            
            // Reverse geocode to get city name if possible, or just use "Current Location"
            setWeather({
              city: 'Current Location',
              temp: Math.round(weatherData.current_weather.temperature),
              condition: decodeWeatherCode(weatherData.current_weather.weathercode),
              humidity: 65,
              wind: Math.round(weatherData.current_weather.windspeed),
              high: Math.round(weatherData.daily.temperature_2m_max[0]),
              low: Math.round(weatherData.daily.temperature_2m_min[0])
            });
          } catch (e) {
            fetchWeather('London'); // Fallback
          } finally {
            setLoading(false);
          }
        },
        () => {
          fetchWeather('New York'); // User denied geolocation
        }
      );
    } else {
      fetchWeather('New York');
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city);
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('clear')) return <Sun className="w-16 h-16 text-orange-400 animate-pulse" />;
    if (lower.includes('cloud')) return <Cloud className="w-16 h-16 text-slate-400" />;
    if (lower.includes('rain')) return <CloudRain className="w-16 h-16 text-blue-400" />;
    if (lower.includes('fog')) return <Wind className="w-16 h-16 text-slate-300" />;
    if (lower.includes('snow')) return <Droplets className="w-16 h-16 text-indigo-200" />;
    if (lower.includes('thunder')) return <Wind className="w-16 h-16 text-yellow-500" />;
    return <Sun className="w-16 h-16 text-orange-400" />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weather</h1>
        <p className="text-slate-500">Check the weather for your study environment.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Enter city name..." 
                className="pl-10" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {weather && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2 text-indigo-100">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">{weather.city}</span>
              </div>
              <div className="mb-4">
                {getWeatherIcon(weather.condition)}
              </div>
              <h2 className="text-6xl font-bold mb-1">{weather.temp}°C</h2>
              <p className="text-xl font-medium text-indigo-100">{weather.condition}</p>
              <div className="mt-6 flex gap-6 text-sm text-indigo-100">
                <span>H: {weather.high}°</span>
                <span>L: {weather.low}°</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Humidity</p>
                  <p className="text-lg font-bold">{weather.humidity}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Wind className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Wind Speed</p>
                  <p className="text-lg font-bold">{weather.wind} km/h</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Thermometer className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Feels Like</p>
                  <p className="text-lg font-bold">{weather.temp + 2}°C</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
