import React, { useState } from 'react';
import { Brain, CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Sol panelde gösterilecek dinamik görsel önizlemeler
  const renderLeftPanelVisual = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-visual-container step-1-visual">
            <div className="visual-hero-wrapper">
              <img src="/hero_art.png" alt="VeloPath Hero" className="visual-hero-image" />
              <div className="visual-hero-overlay-card">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span>Yolculuk Başlıyor...</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="onboarding-visual-container step-2-visual">
            <div className="visual-ai-card">
              <div className="visual-ai-header">
                <Brain size={20} className="text-accent" />
                <span>VeloPath AI</span>
              </div>
              <div className="visual-ai-prompt">
                <div className="prompt-label">Hedefiniz:</div>
                <div className="prompt-text">"SaaS Mobil Uygulaması Geliştir"</div>
              </div>
              <div className="visual-ai-loading">
                <div className="loading-bar animate-pulse"></div>
                <div className="loading-text">Yol Haritası Oluşturuluyor...</div>
              </div>
              <div className="visual-ai-tasks">
                <div className="visual-task-item done">
                  <CheckCircle size={14} className="text-status-done" />
                  <span>Veritabanı Mimarisini Tasarla</span>
                </div>
                <div className="visual-task-item active">
                  <div className="pulse-dot"></div>
                  <span>API Entegrasyonunu Tamamla</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="onboarding-visual-container step-3-visual">
            <div className="visual-board">
              <div className="board-column">
                <div className="column-header">Yapılacaklar</div>
                <div className="board-card disabled">Veri Tabanı</div>
                <div className="board-card moving-card">
                  <span>Arayüz Tasarımı</span>
                  <div className="moving-arrow">→</div>
                </div>
              </div>
              <div className="board-column">
                <div className="column-header">Yapılıyor</div>
                <div className="board-card">Test Senaryoları</div>
                <div className="board-card empty-slot">Görevi Sürükleyin</div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="onboarding-visual-container step-4-visual">
            <div className="visual-stats-grid">
              <div className="stat-circle-card">
                <svg className="progress-ring" width="100" height="100">
                  <circle className="progress-ring-circle-bg" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" r="38" cx="50" cy="50"/>
                  <circle className="progress-ring-circle" stroke="var(--primary)" strokeWidth="8" strokeDasharray="238.76" strokeDashoffset="52.5" strokeLinecap="round" fill="transparent" r="38" cx="50" cy="50"/>
                </svg>
                <div className="circle-text">
                  <span className="percent">%78</span>
                  <span className="label">Tamamlandı</span>
                </div>
              </div>
              <div className="stat-streak-card">
                <div className="streak-num">12</div>
                <div className="streak-label">Günlük Seri 🔥</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const stepDetails = [
    {
      title: "VeloPath Dünyasına Hoş Geldin! 🚀",
      description: "Hayallerini ve projelerini, yapay zekanın gücüyle haftalık mikro adımlara bölerek gerçeğe dönüştürmek için tasarlanmış en akıllı asistanınla tanışmaya hazır mısın?",
      badge: "GİRİŞ",
      color: "var(--primary)"
    },
    {
      title: "Yapay Zeka Planlama Gücü 🧠",
      description: "Karmaşık hedeflerini gir, gerisini VeloPath AI'a bırak. Projeni yönetilebilir küçük parçalara böler, zaman çizelgeleri ve öncelik sıralamaları oluşturur.",
      badge: "AI ASİSTAN",
      color: "var(--accent)"
    },
    {
      title: "Haftalık Sürükle-Bırak Planı 📅",
      description: "Görevleri haftalık planlara yay. Durumlarını sürükle-bırak ile yönet. Tamamlama oranlarını dairesel grafiklerle takip et, hiçbir detayı gözden kaçırma.",
      badge: "PLANLAYICI",
      color: "var(--status-low)"
    },
    {
      title: "Verimlilik Analizi ve Seriler 📈",
      description: "Performansını analiz et, en aktif olduğunuz günleri keşfet. Günlük görevlerini aksatmadan tamamlayarak 'Streak' serilerini büyüt ve motivasyonunu hep zirvede tut.",
      badge: "İSTATİSTİK",
      color: "var(--status-done)"
    }
  ];

  const current = stepDetails[step - 1];

  return (
    <div className="onboarding-overlay active">
      <div className="onboarding-modal-wrapper animate-scale-in">
        <div className="onboarding-split-container">
          
          {/* Sol Panel - Görsel Önizlemeler */}
          <div className="onboarding-left-panel">
            <div className="onboarding-visual-stage">
              {renderLeftPanelVisual()}
            </div>
            <div className="left-panel-gradient-overlay"></div>
          </div>

          {/* Sağ Panel - Metin ve Kontroller */}
          <div className="onboarding-right-panel">
            <button className="onboarding-close-btn" onClick={handleSkip} aria-label="Kapat">
              <X size={20} />
            </button>

            <div className="onboarding-right-content">
              <div className="onboarding-badge" style={{ backgroundColor: `rgba(99, 102, 241, 0.1)`, color: current.color }}>
                {current.badge}
              </div>

              <h2 className="onboarding-main-title">{current.title}</h2>
              <p className="onboarding-main-desc">{current.description}</p>

              <div className="onboarding-navigation-footer">
                {/* Adım Göstergeleri */}
                <div className="onboarding-dots">
                  {stepDetails.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setStep(idx + 1)}
                      className={`onboarding-dot ${idx + 1 === step ? 'active' : ''}`}
                      aria-label={`Adım ${idx + 1}`}
                      style={{ '--active-color': current.color }}
                    />
                  ))}
                </div>

                {/* Butonlar */}
                <div className="onboarding-buttons">
                  {step < totalSteps ? (
                    <>
                      <button className="btn-text" onClick={handleSkip}>Atla</button>
                      <button className="btn-primary-onboarding" onClick={handleNext} style={{ backgroundColor: current.color }}>
                        <span>İleri</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary-onboarding success-btn" onClick={handleNext} style={{ backgroundColor: 'var(--status-done)' }}>
                      <span>Hadi Başlayalım!</span>
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
