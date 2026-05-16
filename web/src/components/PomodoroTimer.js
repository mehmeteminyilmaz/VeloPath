import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Timer, Settings as SettingsIcon, ChevronDown, Check, Flame, SkipForward } from 'lucide-react';
import '../styles/PomodoroTimer.css';

const PomodoroTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0);
  
  // Custom durations in minutes
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);

  // Active settings in seconds
  const workDuration = workMinutes * 60;
  const shortBreakDuration = shortBreakMinutes * 60;
  const longBreakDuration = longBreakMinutes * 60;

  const getDuration = useCallback((m) => {
    if (m === 'work') return workDuration;
    if (m === 'shortBreak') return shortBreakDuration;
    return longBreakDuration;
  }, [workDuration, shortBreakDuration, longBreakDuration]);

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setShowSettings(false); // reset view
  };

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsActive(false);
  }, [getDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDuration(mode));
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
          body: mode === 'work' ? "Odaklanma bitti! Mola zamanı." : "Mola bitti! Çalışmaya geri dönelim.",
          icon: "/favicon.ico"
        });
      }
      
      // Auto-switch logic
      if (mode === 'work') {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        // Her 4 seansta bir uzun mola
        if (newSessions > 0 && newSessions % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('work');
      }
    }

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft, mode, switchMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

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
          <div className="pomodoro-session-badge">
            <Flame size={14} color="var(--primary)" />
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{sessions}</span>
          </div>
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
            <label>Kısa Mola (dk)</label>
            <input 
              type="number" 
              min="1" 
              max="60" 
              value={shortBreakMinutes} 
              onChange={(e) => setShortBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="pomodoro-input"
            />
          </div>
          <div className="pomodoro-settings-group">
            <label>Uzun Mola (dk)</label>
            <input 
              type="number" 
              min="1" 
              max="60" 
              value={longBreakMinutes} 
              onChange={(e) => setLongBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
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
            Odaklanma ({workMinutes}d)
          </button>
          <button 
            className={`pomodoro-mode-btn break-short ${mode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => switchMode('shortBreak')}
          >
            Kısa ({shortBreakMinutes}d)
          </button>
          <button 
            className={`pomodoro-mode-btn break-long ${mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => switchMode('longBreak')}
          >
            Uzun ({longBreakMinutes}d)
          </button>
        </div>

      <div className="pomodoro-display">
        <div className="pomodoro-circle-container">
          <svg className="pomodoro-svg" viewBox="0 0 120 120">
            <circle className="pomodoro-circle-bg" cx="60" cy="60" r="54" />
            <circle 
              className={`pomodoro-circle-progress ${mode}`} 
              cx="60" cy="60" r="54" 
              style={{ strokeDasharray: 339.29, strokeDashoffset: 339.29 - (339.29 * progress) / 100 }}
            />
          </svg>
          <div className="pomodoro-time-inner">
            <div className="pomodoro-time">{formatTime(timeLeft)}</div>
          </div>
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
        <button 
          className="pomodoro-control-btn reset" 
          onClick={() => {
             if (mode === 'work') switchMode('shortBreak');
             else if (mode === 'shortBreak') switchMode('longBreak');
             else switchMode('work');
          }}
          title="Sonraki Mod"
        >
          <SkipForward size={20} />
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
