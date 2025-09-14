import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import alarmBg from "@/assets/alarm-bg.jpg";

const AlarmPage = () => {
  const navigate = useNavigate();
  const [alarmTime, setAlarmTime] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [alarmTriggered, setAlarmTriggered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (alarmTime && isAlarmActive) {
      const checkAlarm = () => {
        const now = new Date();
        const [hours, minutes] = alarmTime.split(':');
        const alarmDate = new Date();
        alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (now >= alarmDate && !alarmTriggered) {
          setAlarmTriggered(true);
          setIsAlarmActive(false);
          // Navigate to snake game after 2 seconds
          setTimeout(() => {
            navigate('/game');
          }, 2000);
        }
      };

      const interval = setInterval(checkAlarm, 1000);
      return () => clearInterval(interval);
    }
  }, [alarmTime, isAlarmActive, alarmTriggered, navigate]);

  const handleSetAlarm = () => {
    if (alarmTime) {
      setIsAlarmActive(true);
      setAlarmTriggered(false);
    }
  };

  const handleStopAlarm = () => {
    setIsAlarmActive(false);
    setAlarmTriggered(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6">
        <Card className="bg-card/90 backdrop-blur-sm border-primary/30 neon-border">
          <div className="p-8 text-center space-y-6">
            {/* Current Time Display */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold neon-text text-primary animate-neon-pulse">
                {formatTime(currentTime)}
              </h1>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Alarm Status */}
            {alarmTriggered && (
              <div className="animate-pulse">
                <h2 className="text-2xl font-bold text-secondary neon-text">
                  🚨 WAKE UP! 🚨
                </h2>
                <p className="text-foreground mt-2">
                  Get ready for the Snake Challenge!
                </p>
              </div>
            )}

            {/* Alarm Setup */}
            {!alarmTriggered && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alarm-time" className="text-foreground">
                    Set Alarm Time
                  </Label>
                  <Input
                    id="alarm-time"
                    type="time"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className="bg-background/80 border-primary/30 text-foreground"
                  />
                </div>

                {isAlarmActive && (
                  <div className="text-center">
                    <p className="text-primary neon-text animate-neon-pulse">
                      ⏰ Alarm set for {alarmTime}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleSetAlarm}
                    disabled={!alarmTime || isAlarmActive}
                    className="flex-1 retro-button bg-primary text-primary-foreground hover:bg-primary/80"
                  >
                    Set Alarm
                  </Button>
                  <Button
                    onClick={handleStopAlarm}
                    disabled={!isAlarmActive}
                    variant="secondary"
                    className="flex-1 retro-button"
                  >
                    Stop
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Test Button */}
            <div className="pt-4 border-t border-border/30">
              <Button
                onClick={() => navigate('/game')}
                variant="outline"
                className="w-full retro-button border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                🎮 Test Snake Game
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlarmPage;