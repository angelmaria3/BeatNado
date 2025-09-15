import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherApiKey = Deno.env.get('WEATHER_API_KEY');
    if (!weatherApiKey) {
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Using OpenWeatherMap API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    
    // Map weather condition to mood
    const getWeatherMood = (condition: string, temp: number) => {
      const lowerCondition = condition.toLowerCase();
      if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
        return 'rainy';
      } else if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
        return 'stormy';
      } else if (temp < 5) {
        return 'winter';
      } else if (temp > 25) {
        return 'summer';
      } else if (lowerCondition.includes('cloud')) {
        return 'autumn';
      } else {
        return 'spring';
      }
    };

    // Get current season
    const getSeason = () => {
      const month = new Date().getMonth() + 1;
      if (month >= 3 && month <= 5) return 'spring';
      if (month >= 6 && month <= 8) return 'summer';
      if (month >= 9 && month <= 11) return 'autumn';
      return 'winter';
    };

    const processedWeatherData = {
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      location: weatherData.name,
      country: weatherData.sys.country,
      season: getSeason(),
      mood: getWeatherMood(weatherData.weather[0].main, weatherData.main.temp),
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      icon: weatherData.weather[0].icon
    };

    console.log('Weather data processed:', processedWeatherData);

    return new Response(
      JSON.stringify(processedWeatherData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});