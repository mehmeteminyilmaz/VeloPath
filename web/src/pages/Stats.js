import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { BarChart, Award, CheckCircle, TrendingUp, Calendar, Zap, Bot, ListTodo } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeStatsByAI, getWeeklyPlanByAI } from '../api';

const Stats = ({ projects, resetData, requestNotificationPermission, setIsSidebarCollapsed, isSidebarCollapsed, onLogout, toggleSettings }) => {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [weeklyPlan, setWeeklyPlan] = useState('');
  const [weeklyPlanLoading, setWeeklyPlanLoading] = useState(false);
  const [weeklyPlanError, setWeeklyPlanError] = useState('');
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

    // 4. Verimlilik (%)
    const productivity = allTasks.length > 0
      ? Math.round((totalCompleted / allTasks.length) * 100)
      : 0;

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
      productivity: `%${productivity}`,
      last7Days
    };
  }, [projects]);

  // Kategori bazli istatistik
  const categoryStats = useMemo(() => {
    const CATEGORY_LABELS = {
      yazilim: 'Yazilim & Tech', egitim: 'Egitim', kariyer: 'Kariyer',
      saglik: 'Saglik & Spor', kisisel: 'Kisisel Gelisim', is: 'Is & Girisim',
      yaratici: 'Yaratici', ev: 'Ev & Yasam', diger: 'Diger',
    };
    const CATEGORY_COLORS = {
      yazilim: '#6366f1', egitim: '#8b5cf6', kariyer: '#3b82f6',
      saglik: '#10b981', kisisel: '#f59e0b', is: '#ec4899',
      yaratici: '#f97316', ev: '#06b6d4', diger: '#64748b',
    };
    const map = {};
    projects.filter(p => !p.archived).forEach(p => {
      const cat = p.category || 'diger';
      if (!map[cat]) map[cat] = { label: CATEGORY_LABELS[cat] || cat, color: CATEGORY_COLORS[cat] || '#64748b', total: 0, completed: 0 };
      map[cat].total += p.tasks.length;
      map[cat].completed += p.tasks.filter(t => t.completed).length;
    });
    return Object.values(map)
      .filter(c => c.total > 0)
      .map(c => ({ ...c, pct: c.total === 0 ? 0 : Math.round((c.completed / c.total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [projects]);

  const handleWeeklyPlan = async () => {
    setWeeklyPlanLoading(true);
    setWeeklyPlanError('');
    setWeeklyPlan('');
    try {
      const allTasks = projects
        .filter(p => !p.archived)
        .flatMap(p => p.tasks
          .filter(t => !t.completed)
          .map(t => ({ ...t, projectTitle: p.title }))
        );
      if (allTasks.length === 0) { setWeeklyPlanError('Bekleyen gorev bulunamadi.'); setWeeklyPlanLoading(false); return; }
      const res = await getWeeklyPlanByAI(allTasks);
      if (res.plan) setWeeklyPlan(res.plan);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) setWeeklyPlanError('AI kotasi doldu. Lutfen 1 dakika bekleyin.');
      else setWeeklyPlanError('Plan alinamadi. Sunucu baglantisinizi kontrol edin.');
    } finally {
      setWeeklyPlanLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    setAiError('');
    setAiAnalysis('');
    try {
      const res = await analyzeStatsByAI({
        totalCompleted: statsData.totalCompleted,
        totalPending: projects.flatMap(p => p.tasks).filter(t => !t.completed).length,
        productivity: statsData.productivity.replace('%', ''),
        streak: statsData.streak,
        bestDay: statsData.bestDay,
      });
      if (res.analysis) setAiAnalysis(res.analysis);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) setAiError('AI kotasi doldu. Lutfen 1 dakika bekleyin.');
      else setAiError('Analiz alinamadi. Sunucu baglantisinizi kontrol edin.');
    } finally {
      setAiLoading(false);
    }
  };

  // Grafik için maksimum değeri bul
  const maxCount = Math.max(...statsData.last7Days.map(d => d.count), 5);

  return (
    <div className="auth-layout">
      <Sidebar resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} toggleSettings={toggleSettings} />

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
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Verimlilik</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{statsData.productivity}</h3>
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

        {/* Kategori Bazli Istatistik */}
        {categoryStats.length > 0 && (
          <div className="card animate-slide-up" style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" /> Kategori Bazli Basari
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categoryStats.map(cat => (
                <div key={cat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{cat.label}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {cat.completed}/{cat.total} gorev &nbsp;
                      <strong style={{ color: cat.color }}>%{cat.pct}</strong>
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: cat.pct + '%', background: cat.color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Haftalik Plan Karti */}
        <div className="card animate-slide-up" style={{ marginTop: '2rem', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ListTodo size={22} color="var(--accent)" />
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Bu Hafta Ne Yapayim?</h3>
            </div>
            <button
              onClick={handleWeeklyPlan}
              disabled={weeklyPlanLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: weeklyPlanLoading ? 'not-allowed' : 'pointer', background: 'rgba(16,185,129,0.12)', color: 'var(--accent)', fontWeight: 600, fontSize: '0.88rem', opacity: weeklyPlanLoading ? 0.7 : 1 }}
            >
              <ListTodo size={16} />
              {weeklyPlanLoading ? 'Hazirlaniyor...' : 'Plan Olustur'}
            </button>
          </div>
          {weeklyPlanError && (
            <p style={{ color: 'var(--danger)', fontSize: '0.88rem', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', margin: 0 }}>{weeklyPlanError}</p>
          )}
          {weeklyPlan ? (
            <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              <ReactMarkdown>{weeklyPlan}</ReactMarkdown>
            </div>
          ) : !weeklyPlanError && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              "Plan Olustur" butonuna tikla — AI, tum bekleyen gorevlerini inceleyip bu hafta oncelikli odaklanman gereken 5 gorevi sirayla onersin.
            </p>
          )}
        </div>

        {/* AI Coach Karti */}
        <div className="card animate-slide-up" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={22} color="#a855f7" />
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>AI Verimlilik Kocu</h3>
            </div>
            <button
              onClick={handleAIAnalysis}
              disabled={aiLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer', background: aiLoading ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.15)', color: '#a855f7', fontWeight: 600, fontSize: '0.88rem', opacity: aiLoading ? 0.7 : 1, transition: 'all 0.2s' }}
            >
              <Bot size={16} />
              {aiLoading ? 'Analiz ediliyor...' : 'Analiz Et'}
            </button>
          </div>

          {aiError && (
            <p style={{ color: 'var(--danger)', fontSize: '0.88rem', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', margin: 0 }}>
              {aiError}
            </p>
          )}

          {aiAnalysis ? (
            <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          ) : !aiError && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              "Analiz Et" butonuna tikla — AI, verimlilik verilerini inceleyip sana ozel bir performans ozeti ve tavsiye hazirlasin.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Stats;
