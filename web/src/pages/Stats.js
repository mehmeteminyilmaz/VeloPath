import React, { useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { BarChart, Clock, Award, CheckCircle, TrendingUp, Calendar, Zap } from 'lucide-react';

const Stats = ({ projects, resetData, requestNotificationPermission, setIsSidebarCollapsed, isSidebarCollapsed, onLogout }) => {
  // Veriyi İşle
  const statsData = useMemo(() => {
    const allTasks = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectTitle: p.title })));
    const completedTasks = allTasks.filter(t => t.completed && t.completedAt);

    // 1. Toplam Tamamlanan
    const totalCompleted = completedTasks.length;

    // 2. En Uzun Seri (Ardışık Günler)
    const completionDates = Array.from(new Set(
      completedTasks.map(t => t.completedAt.split('T')[0])
    )).sort();

    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    completionDates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      if (prevDate) {
        const diffInDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
        if (diffInDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = currentDate;
    });

    // 3. En Verimli Gün (Haftanın Günleri)
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const completionsByDay = {};
    completedTasks.forEach(t => {
      const day = new Date(t.completedAt).getDay();
      completionsByDay[day] = (completionsByDay[day] || 0) + 1;
    });
    
    let bestDayIndex = 0;
    let maxDayCompletions = 0;
    Object.keys(completionsByDay).forEach(day => {
      if (completionsByDay[day] > maxDayCompletions) {
        maxDayCompletions = completionsByDay[day];
        bestDayIndex = day;
      }
    });

    // 4. En Verimli Hafta (Mantıksal Hafta)
    const completionsByWeek = {};
    completedTasks.forEach(t => {
      completionsByWeek[t.week] = (completionsByWeek[t.week] || 0) + 1;
    });

    let bestWeekNum = 0;
    let maxWeekCompletions = 0;
    Object.keys(completionsByWeek).forEach(week => {
      if (completionsByWeek[week] > maxWeekCompletions) {
        maxWeekCompletions = completionsByWeek[week];
        bestWeekNum = week;
      }
    });

    // 5. Son 7 Günlük Aktivite (Grafik İçin)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = completedTasks.filter(t => t.completedAt.startsWith(dateStr)).length;
      last7Days.push({ 
        label: dayNames[d.getDay()].substring(0, 3), 
        count: count,
        fullDate: dateStr
      });
    }

    return {
      totalCompleted,
      streak: longestStreak,
      bestDay: totalCompleted > 0 ? dayNames[bestDayIndex] : '-',
      bestWeek: totalCompleted > 0 ? `Hafta ${bestWeekNum}` : '-',
      last7Days
    };
  }, [projects]);

  // Grafik için maksimum değeri bul
  const maxCount = Math.max(...statsData.last7Days.map(d => d.count), 5);

  return (
    <div className="auth-layout">
      <Sidebar resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} />

      <main className="main-content">
        <header className="animate-slide-up" style={{ marginBottom: '3rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Verimlilik Raporu</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Çalışma alışkanlıklarını analiz et ve performansını artır.</p>
        </header>

        {/* Ana Metrikler */}
        <section className="stats-container animate-slide-up delay-100">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tamamlanan Görev</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{statsData.totalCompleted}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
              <Zap size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>En Uzun Seri</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{statsData.streak} Gün</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-low)' }}>
              <Award size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>En Verimli Gün</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{statsData.bestDay}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--status-done)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>En Verimli Hafta</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{statsData.bestWeek}</h3>
            </div>
          </div>
        </section>

        <div className="grid animate-slide-up delay-200" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '2rem' }}>
          {/* Haftalık Aktivite Grafiği */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart size={20} color="var(--primary)" /> Son 7 Günlük Aktivite
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Görev Tamamlama Sayısı</span>
            </div>
            
            <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px', position: 'relative' }}>
              {/* Yatay Kılavuz Çizgileri */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ width: '100%', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}></div>
                ))}
              </div>

              {statsData.last7Days.map((day, idx) => {
                const barHeight = (day.count / maxCount) * 100;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: '40px', 
                        height: `${Math.max(barHeight, 5)}%`, 
                        background: day.count > 0 ? 'linear-gradient(180deg, var(--primary) 0%, rgba(99, 102, 241, 0.4) 100%)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '6px 6px 4px 4px',
                        transition: 'height 1s ease-out',
                        position: 'relative',
                        boxShadow: day.count > 0 ? '0 4px 15px rgba(99, 102, 241, 0.2)' : 'none'
                      }}
                    >
                      {day.count > 0 && (
                        <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {day.count}
                        </span>
                      )}
                    </div>
                    <span style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Özet ve İpucu */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <Calendar size={32} style={{ margin: 'auto' }} />
              </div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>İstikrarlı İlerleme</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Görevlerini küçük parçalara bölmek tamamlama hızını <strong>%40</strong> artırabilir. Haftalık planlarını buna göre düzenlemeyi dene!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stats;
