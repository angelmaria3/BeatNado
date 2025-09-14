import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import alarmBg from "@/assets/alarm-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  // Auto-redirect to alarm page after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/alarm');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${alarmBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg p-6">
        <Card className="bg-card/90 backdrop-blur-sm border-primary/30 neon-border">
          <div className="p-8 text-center space-y-6">
            {/* App Title */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-primary neon-text animate-neon-pulse">
                🐍⏰🎵
              </h1>
              <h2 className="text-2xl font-bold text-foreground">
                Snake Alarm Weather + Music
              </h2>
              <p className="text-muted-foreground">
                The ultimate retro wake-up experience
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-left">
                <span className="text-lg">⏰</span>
                <span className="text-foreground">Set alarms with style</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <span className="text-lg">🎮</span>
                <span className="text-foreground">Play Snake to wake up</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <span className="text-lg">🌤</span>
                <span className="text-foreground">Weather-based music</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <span className="text-lg">🎵</span>
                <span className="text-foreground">Perfect morning vibes</span>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="space-y-3">
              <div className="text-primary animate-pulse">
                Starting your retro adventure...
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Quick Start */}
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/alarm')}
                className="w-full retro-button bg-primary text-primary-foreground hover:bg-primary/80"
              >
                🚀 Enter Now
              </Button>
              <p className="text-xs text-muted-foreground">
                Auto-redirecting in 3 seconds...
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
