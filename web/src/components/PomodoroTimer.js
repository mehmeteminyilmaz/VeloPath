import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Timer, Settings as SettingsIcon, ChevronDown, Check } from 'lucide-react';
import '../styles/PomodoroTimer.css';

const PomodoroTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  
  // Custom durations in minutes
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Active settings in seconds
  const workDuration = workMinutes * 60;
  const breakDuration = breakMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setShowSettings(false); // reset view
  };

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? workDuration : breakDuration);
    setIsActive(false);
  }, [workDuration, breakDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workDuration : breakDuration);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      clearInterval(interval);
      
      // Notify user
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("VeloPath Pomodoro", {
          body: mode === 'work' ? "Çalışma süresi bitti! Mola zamanı." : "Mola bitti! Çalışmaya geri dönelim.",
          icon: "/favicon.ico"
        });
      }
      
      // Switch mode automatically
      switchMode(mode === 'work' ? 'break' : 'work');
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, switchMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work' 
    ? ((workDuration - timeLeft) / workDuration) * 100
    : ((breakDuration - timeLeft) / breakDuration) * 100;

  if (!isOpen) {
    return (
      <button 
        className="pomodoro-toggle-btn glass-panel" 
        onClick={toggleOpen}
        title="Pomodoro Zamanlayıcı"
      >
        <Timer size={24} className={isActive ? "pomodoro-active-icon" : ""} />
        {isActive && <span className="pomodoro-mini-time">{formatTime(timeLeft)}</span>}
      </button>
    );
  }

  return (
    <div className="pomodoro-container glass-panel">
      <div className="pomodoro-header">
        <div className="pomodoro-title">
          <Timer size={18} />
          <span>Odak Zamanı</span>
        </div>
        <div className="pomodoro-header-actions">
          <button 
            className={`pomodoro-icon-btn ${showSettings ? 'active' : ''}`} 
            onClick={() => setShowSettings(!showSettings)}
            title="Ayarlar"
          >
            <SettingsIcon size={18} />
          </button>
          <button className="pomodoro-icon-btn" onClick={toggleOpen} title="Gizle">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="pomodoro-settings fade-in">
          <div className="pomodoro-settings-group">
            <label>Çalışma Süresi (dk)</label>
            <input 
              type="number" 
              min="1" 
              max="120" 
              value={workMinutes} 
              onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="pomodoro-input"
            />
          </div>
          <div className="pomodoro-settings-group">
            <label>Mola Süresi (dk)</label>
            <input 
              type="number" 
              min="1" 
              max="60" 
              value={breakMinutes} 
              onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="pomodoro-input"
            />
          </div>
          <button 
            className="pomodoro-save-btn"
            onClick={() => {
              setShowSettings(false);
              switchMode(mode); // reset with new times
            }}
          >
            <Check size={18} />
            Kaydet ve Uygula
          </button>
        </div>
      ) : (
        <div className="pomodoro-timer-view fade-in">

        <div className="pomodoro-modes">
          <button 
            className={`pomodoro-mode-btn ${mode === 'work' ? 'active' : ''}`}
            onClick={() => switchMode('work')}
          >
            Çalışma ({workMinutes}d)
          </button>
          <button 
            className={`pomodoro-mode-btn break ${mode === 'break' ? 'active' : ''}`}
            onClick={() => switchMode('break')}
          >
            Mola ({breakMinutes}d)
          </button>
        </div>

      <div className="pomodoro-display">
        <div className="pomodoro-time">{formatTime(timeLeft)}</div>
        <div className="pomodoro-progress-bg">
          <div 
            className={`pomodoro-progress-fill ${mode}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="pomodoro-controls">
        <button 
          className="pomodoro-control-btn reset" 
          onClick={resetTimer}
          title="Sıfırla"
        >
          <Square size={20} />
        </button>
        <button 
          className={`pomodoro-control-btn main ${isActive ? 'pause' : 'play'}`} 
          onClick={toggleTimer}
        >
          {isActive ? <Pause size={28} /> : <Play size={28} />}
        </button>
      </div>
      
        {mode === 'work' && isActive && (
          <div className="pomodoro-status-text">
            Şu an odaklanma modundasınız. Bildirimler devam ederken dikkatinizi dağıtmayın.
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
