import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Loader2, Youtube, RefreshCw } from "lucide-react";

// Import seasonal backgrounds
import rainyBg from "@/assets/rainy-bg.jpg";
import springBg from "@/assets/spring-bg.jpg";
import summerBg from "@/assets/summer-bg.jpg";
import winterBg from "@/assets/winter-bg.jpg";
import autumnBg from "@/assets/autumn-bg.jpg"; 
import stormyBg from "@/assets/stormy-bg.jpg";

type WeatherData = {
  temperature: number;
  condition: string;
  description: string;
  location: string;
  country: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  mood: 'sunny' | 'rainy' | 'cold' | 'stormy' | 'spring' | 'summer' | 'autumn' | 'winter';
  humidity: number;
  windSpeed: number;
  icon: string;
};

type MusicRecommendation = {
  title: string;
  artist: string;
  genre: string;
  reason: string;
  youtubeQuery: string;
};

type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
};

const SEASON_BACKGROUNDS = {
  spring: springBg,
  summer: summerBg,
  autumn: autumnBg,
  winter: winterBg,
  rainy: rainyBg,
  stormy: stormyBg,
};

const WEATHER_MOODS = {
  sunny: {
    icon: '☀',
    color: 'hsl(var(--sunny))',
    genres: ['pop', 'upbeat', 'feel-good'],
    vibes: ['energetic', 'happy', 'uplifting']
  },
  rainy: {
    icon: '🌧',
    color: 'hsl(var(--rainy))',
    genres: ['lo-fi', 'jazz', 'indie'],
    vibes: ['relaxing', 'contemplative', 'cozy']
  },
  cold: {
    icon: '❄',
    color: 'hsl(var(--cold))',
    genres: ['ambient', 'electronic', 'chillout'],
    vibes: ['calm', 'atmospheric', 'dreamy']
  },
  stormy: {
    icon: '🌩',
    color: 'hsl(var(--stormy))',
    genres: ['rock', 'energetic', 'powerful'],
    vibes: ['intense', 'dramatic', 'powerful']
  },
  spring: {
    icon: '🌸',
    color: 'hsl(var(--spring))',
    genres: ['indie', 'acoustic', 'fresh'],
    vibes: ['refreshing', 'hopeful', 'renewed']
  },
  summer: {
    icon: '🌞',
    color: 'hsl(var(--summer))',
    genres: ['pop', 'tropical', 'upbeat'],
    vibes: ['energetic', 'warm', 'joyful']
  },
  autumn: {
    icon: '🍂',
    color: 'hsl(var(--autumn))',
    genres: ['folk', 'indie', 'mellow'],
    vibes: ['nostalgic', 'cozy', 'reflective']
  },
  winter: {
    icon: '❄️',
    color: 'hsl(var(--winter))',
    genres: ['ambient', 'classical', 'peaceful'],
    vibes: ['serene', 'contemplative', 'peaceful']
  }
};

const SAMPLE_MUSIC_RECOMMENDATIONS: Record<string, MusicRecommendation[]> = {
  sunny: [
    { title: "Good as Hell", artist: "Lizzo", genre: "Pop", reason: "Perfect upbeat energy for a sunny day!", youtubeQuery: "Lizzo Good as Hell" },
    { title: "Walking on Sunshine", artist: "Katrina and the Waves", genre: "Pop Rock", reason: "Classic sunny day anthem", youtubeQuery: "Walking on Sunshine Katrina Waves" },
    { title: "Here Comes the Sun", artist: "The Beatles", genre: "Rock", reason: "The ultimate sunshine song", youtubeQuery: "Here Comes the Sun Beatles" }
  ],
  rainy: [
    { title: "Rainy Days and Mondays", artist: "The Carpenters", genre: "Soft Rock", reason: "Perfect for contemplative rainy moments", youtubeQuery: "Rainy Days Mondays Carpenters" },
    { title: "Lo-Fi Hip Hop Radio", artist: "ChilledCow", genre: "Lo-Fi", reason: "Cozy beats for rainy day vibes", youtubeQuery: "lofi hip hop radio" },
    { title: "The Night We Met", artist: "Lord Huron", genre: "Indie Folk", reason: "Melancholic and beautiful for rainy weather", youtubeQuery: "The Night We Met Lord Huron" }
  ],
  cold: [
    { title: "Weightless", artist: "Marconi Union", genre: "Ambient", reason: "Scientifically designed to reduce anxiety - perfect for cold, quiet moments", youtubeQuery: "Weightless Marconi Union" },
    { title: "Svefn-g-englar", artist: "Sigur Rós", genre: "Post-Rock", reason: "Ethereal and atmospheric like a winter landscape", youtubeQuery: "Svefn-g-englar Sigur Ros" },
    { title: "Winter Journey", artist: "Max Richter", genre: "Neo-Classical", reason: "Contemplative classical for cold weather", youtubeQuery: "Winter Journey Max Richter" }
  ],
  stormy: [
    { title: "Thunderstruck", artist: "AC/DC", genre: "Hard Rock", reason: "High energy to match the storm's power!", youtubeQuery: "Thunderstruck AC/DC" },
    { title: "Immigrant Song", artist: "Led Zeppelin", genre: "Rock", reason: "Epic and powerful like thunder", youtubeQuery: "Immigrant Song Led Zeppelin" },
    { title: "Storm", artist: "Godspeed You! Black Emperor", genre: "Post-Rock", reason: "Dramatic instrumental that captures storm intensity", youtubeQuery: "Storm Godspeed You Black Emperor" }
  ]
};

const WeatherMusicPage = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [musicRecommendations, setMusicRecommendations] = useState<MusicRecommendation[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingYoutube, setLoadingYoutube] = useState(false);
  
  // Get user's location and fetch weather data
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setLocationError(null);
      
      // Get user's location
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });
      
      const { latitude, longitude } = position.coords;
      console.log('Got location:', latitude, longitude);
      
      // Call weather edge function
      const { data: weatherData, error: weatherError } = await supabase.functions.invoke('get-weather', {
        body: { latitude, longitude }
      });
      
      if (weatherError) {
        console.error('Weather API error:', weatherError);
        throw new Error(weatherError.message || 'Failed to fetch weather data');
      }
      
      console.log('Weather data received:', weatherData);
      setWeather(weatherData);
      
      // Set music recommendations based on weather mood
      const moodRecommendations = SAMPLE_MUSIC_RECOMMENDATIONS[weatherData.mood] || 
                                   SAMPLE_MUSIC_RECOMMENDATIONS.sunny;
      setMusicRecommendations(moodRecommendations);
      setCurrentTrack(moodRecommendations[0] || null);
      
      toast.success(`Weather loaded for ${weatherData.location}, ${weatherData.country}`);
      
    } catch (error: any) {
      console.error('Error fetching weather:', error);
      setLocationError(error.message);
      
      if (error.code === 1) {
        toast.error("Location access denied. Using default weather.");
      } else if (error.code === 2) {
        toast.error("Location unavailable. Using default weather.");
      } else if (error.code === 3) {
        toast.error("Location request timeout. Using default weather.");
      } else {
        toast.error("Failed to get weather data. Using default.");
      }
      
      // Fallback to mock data
      const fallbackWeather: WeatherData = {
        temperature: 20,
        condition: 'Clear',
        description: 'Clear sky',
        location: 'Unknown Location',
        country: '',
        season: 'spring',
        mood: 'sunny',
        humidity: 50,
        windSpeed: 5,
        icon: '01d'
      };
      
      setWeather(fallbackWeather);
      setMusicRecommendations(SAMPLE_MUSIC_RECOMMENDATIONS.sunny);
      setCurrentTrack(SAMPLE_MUSIC_RECOMMENDATIONS.sunny[0]);
    } finally {
      setLoading(false);
    }
  };
  
  // Search YouTube for music recommendations
  const searchYouTubeMusic = async (mood: string) => {
    try {
      setLoadingYoutube(true);
      const genres = WEATHER_MOODS[mood as keyof typeof WEATHER_MOODS]?.genres || ['music'];
      const searchQuery = `${genres[0]} music ${mood} weather playlist`;
      
      console.log('Searching YouTube for:', searchQuery);
      
      const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke('search-youtube', {
        body: { query: searchQuery, maxResults: 6 }
      });
      
      if (youtubeError) {
        console.error('YouTube search error:', youtubeError);
        toast.error("Failed to load YouTube recommendations");
        return;
      }
      
      console.log('YouTube results:', youtubeData);
      setYoutubeVideos(youtubeData.results || []);
      toast.success("YouTube recommendations loaded!");
      
    } catch (error: any) {
      console.error('Error searching YouTube:', error);
      toast.error("Failed to search YouTube");
    } finally {
      setLoadingYoutube(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);
  
  // Auto-search YouTube when weather is loaded
  useEffect(() => {
    if (weather && weather.mood) {
      searchYouTubeMusic(weather.mood);
    }
  }, [weather]);

  const getBackgroundImage = () => {
    if (!weather) return rainyBg;
    
    if (weather.mood === 'rainy') return SEASON_BACKGROUNDS.rainy;
    if (weather.mood === 'stormy') return SEASON_BACKGROUNDS.stormy;
    return SEASON_BACKGROUNDS[weather.season];
  };

  const getWakeUpMessage = () => {
    if (!weather) return "Getting your wake-up vibe...";
    
    const messages = {
      sunny: "☀ Rise and shine! It's a beautiful day ahead!",
      rainy: "🌧 Cozy vibes for a peaceful wake-up",
      cold: "❄ Embrace the calm and start fresh",
      stormy: "⚡ Channel that storm energy - you've got this!"
    };
    
    return messages[weather.mood];
  };

  const openYouTubeVideo = (video: YouTubeVideo) => {
    window.open(video.url, '_blank');
  };

  const openYouTubeSearch = (track: MusicRecommendation) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.youtubeQuery)}`;
    window.open(searchUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center neon-border border-primary/30">
          <div className="space-y-4">
            <Loader2 className="animate-spin text-4xl mx-auto text-primary" />
            <p className="text-lg text-primary neon-text">
              {locationError ? "Setting up default weather..." : "Getting your location and weather data..."}
            </p>
            {locationError && (
              <p className="text-sm text-muted-foreground">
                {locationError}
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col justify-center p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Wake-up Message */}
          <Card className="bg-card/90 backdrop-blur-sm border-primary/30 neon-border">
            <div className="p-6 text-center">
              <h1 className="text-3xl font-bold text-primary neon-text animate-neon-pulse mb-2">
                Good Morning! 🌅
              </h1>
              <p className="text-xl text-foreground">
                {getWakeUpMessage()}
              </p>
            </div>
          </Card>

          {/* Weather Display */}
          {weather && (
            <Card className="bg-card/90 backdrop-blur-sm border-primary/30 neon-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Today's Weather</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{weather.location}{weather.country && `, ${weather.country}`}</span>
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-4xl weather-icon mb-2"
                      style={{ color: WEATHER_MOODS[weather.mood as keyof typeof WEATHER_MOODS]?.color }}
                    >
                      {WEATHER_MOODS[weather.mood as keyof typeof WEATHER_MOODS]?.icon}
                    </div>
                    <Button
                      onClick={fetchWeatherData}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-2xl font-bold text-foreground">{weather.temperature}°C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="text-lg font-semibold text-foreground">{weather.condition}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="text-lg font-semibold text-foreground">{weather.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Vibe</p>
                    <div className="flex justify-center gap-1 mt-1">
                      {WEATHER_MOODS[weather.mood as keyof typeof WEATHER_MOODS]?.vibes.map((vibe) => (
                        <Badge key={vibe} variant="secondary" className="text-xs">
                          {vibe}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Current Track */}
          {currentTrack && (
            <Card className="bg-card/90 backdrop-blur-sm border-secondary/30 neon-border">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-secondary neon-text mb-4">
                  🎵 Now Playing Recommendation
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{currentTrack.title}</h3>
                    <p className="text-lg text-muted-foreground">by {currentTrack.artist}</p>
                  </div>
                  <Badge variant="outline" className="text-accent border-accent">
                    {currentTrack.genre}
                  </Badge>
                  <p className="text-sm text-muted-foreground italic">
                    "{currentTrack.reason}"
                  </p>
                  <Button
                    onClick={() => openYouTubeSearch(currentTrack)}
                    className="w-full retro-button bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    🎬 Play on YouTube
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* YouTube Music Videos */}
          {youtubeVideos.length > 0 && (
            <Card className="bg-card/90 backdrop-blur-sm border-secondary/30 neon-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-secondary neon-text">
                    🎵 YouTube Music for Your Weather
                  </h2>
                  {loadingYoutube && <Loader2 className="animate-spin w-5 h-5 text-secondary" />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {youtubeVideos.map((video) => (
                    <div key={video.id} className="bg-background/50 rounded-lg border border-border/30 overflow-hidden hover:border-secondary/50 transition-colors">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <h4 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">{video.channelTitle}</p>
                        <Button
                          onClick={() => openYouTubeVideo(video)}
                          size="sm"
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Youtube className="w-4 h-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Music Recommendations */}
          <Card className="bg-card/90 backdrop-blur-sm border-accent/30 neon-border">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-accent neon-text mb-4">
                Curated Music Recommendations
              </h2>
              <div className="grid gap-4">
                {musicRecommendations.map((track, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{track.title}</h4>
                      <p className="text-sm text-muted-foreground">{track.artist} • {track.genre}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">{track.reason}</p>
                    </div>
                    <Button
                      onClick={() => openYouTubeSearch(track)}
                      variant="outline"
                      size="sm"
                      className="retro-button border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      Search
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/alarm')}
              variant="outline"
              className="flex-1 retro-button border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              ⏰ Set New Alarm
            </Button>
            <Button
              onClick={() => navigate('/game')}
              variant="outline"
              className="flex-1 retro-button border-game-primary text-game-primary hover:bg-game-primary hover:text-black"
            >
              🎮 Play Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMusicPage;