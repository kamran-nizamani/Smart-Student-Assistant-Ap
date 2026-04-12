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
    // Simulating API call with mock data
    setTimeout(() => {
      setWeather({
        city: cityName,
        temp: 22,
        condition: 'Partly Cloudy',
        humidity: 45,
        wind: 12,
        high: 25,
        low: 18
      });
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city);
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Cloud')) return <Cloud className="w-16 h-16 text-slate-400" />;
    if (condition.includes('Rain')) return <CloudRain className="w-16 h-16 text-blue-400" />;
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
