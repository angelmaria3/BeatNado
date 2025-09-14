import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  icon: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  mood: 'sunny' | 'rainy' | 'cold' | 'stormy';
};

type MusicRecommendation = {
  title: string;
  artist: string;
  genre: string;
  reason: string;
  youtubeQuery: string;
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
  const [currentTrack, setCurrentTrack] = useState<MusicRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate weather data (in real app, this would come from OpenWeather API)
  useEffect(() => {
    const mockWeatherData = (): WeatherData => {
      const conditions = [
        { condition: 'Clear', mood: 'sunny' as const, season: 'summer' as const, temp: 24 },
        { condition: 'Rain', mood: 'rainy' as const, season: 'autumn' as const, temp: 16 },
        { condition: 'Snow', mood: 'cold' as const, season: 'winter' as const, temp: -2 },
        { condition: 'Thunderstorm', mood: 'stormy' as const, season: 'spring' as const, temp: 18 }
      ];
      
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      return {
        temperature: randomCondition.temp,
        condition: randomCondition.condition,
        description: `${randomCondition.condition} with ${randomCondition.mood} vibes`,
        icon: WEATHER_MOODS[randomCondition.mood].icon,
        season: randomCondition.season,
        mood: randomCondition.mood
      };
    };

    setTimeout(() => {
      const weatherData = mockWeatherData();
      setWeather(weatherData);
      setMusicRecommendations(SAMPLE_MUSIC_RECOMMENDATIONS[weatherData.mood] || []);
      setCurrentTrack(SAMPLE_MUSIC_RECOMMENDATIONS[weatherData.mood]?.[0] || null);
      setLoading(false);
    }, 1000);
  }, []);

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

  const openYouTubeSearch = (track: MusicRecommendation) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.youtubeQuery)}`;
    window.open(searchUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center neon-border border-primary/30">
          <div className="space-y-4">
            <div className="animate-spin text-4xl">🌍</div>
            <p className="text-lg text-primary neon-text">
              Checking the weather and finding your perfect wake-up music...
            </p>
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
                  <h2 className="text-2xl font-bold text-foreground">Today's Weather</h2>
                  <div 
                    className="text-4xl weather-icon"
                    style={{ color: WEATHER_MOODS[weather.mood].color }}
                  >
                    {weather.icon}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-2xl font-bold text-foreground">{weather.temperature}°C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="text-lg font-semibold text-foreground">{weather.condition}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Vibe</p>
                    <div className="flex justify-center gap-1 mt-1">
                      {WEATHER_MOODS[weather.mood].vibes.map((vibe) => (
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

          {/* Music Recommendations */}
          <Card className="bg-card/90 backdrop-blur-sm border-accent/30 neon-border">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-accent neon-text mb-4">
                More Weather-Matched Music
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
                      Play
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