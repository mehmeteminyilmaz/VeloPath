import React, { useState } from 'react';
import { Rocket, Brain, Calendar, BarChart2, CheckCircle, ArrowRight, X } from 'lucide-react';

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

  const stepDetails = [
    {
      title: "VeloPath Dünyasına Hoş Geldin! 🚀",
      description: "Hayallerini ve projelerini, yapay zekanın gücüyle haftalık mikro adımlara bölerek gerçeğe dönüştürmek için tasarlanmış en akıllı asistanınla tanışmaya hazır mısın?",
      badge: "GİRİŞ",
      icon: Rocket,
      color: "var(--primary)"
    },
    {
      title: "Yapay Zeka Planlama Gücü 🧠",
      description: "Karmaşık hedeflerini gir, gerisini VeloPath AI'a bırak. Projeni yönetilebilir küçük parçalara böler, zaman çizelgeleri ve öncelik sıralamaları oluşturur.",
      badge: "AI ASİSTAN",
      icon: Brain,
      color: "var(--accent)"
    },
    {
      title: "Haftalık Sürükle-Bırak Planı 📅",
      description: "Görevleri haftalık planlara yay. Durumlarını sürükle-bırak ile yönet. Tamamlama oranlarını dairesel grafiklerle takip et, hiçbir detayı gözden kaçırma.",
      badge: "PLANLAYICI",
      icon: Calendar,
      color: "var(--status-low)"
    },
    {
      title: "Verimlilik Analizi ve Seriler 📈",
      description: "Performansını analiz et, en aktif olduğunuz günleri keşfet. Günlük görevlerini aksatmadan tamamlayarak 'Streak' serilerini büyüt ve motivasyonunu hep zirvede tut.",
      badge: "İSTATİSTİK",
      icon: BarChart2,
      color: "var(--status-done)"
    }
  ];

  const current = stepDetails[step - 1];
  const IconComponent = current.icon;

  return (
    <div className="onboarding-overlay active">
      <div className="onboarding-modal-wrapper single-panel animate-scale-in">
        <button className="onboarding-close-btn" onClick={handleSkip} aria-label="Kapat">
          <X size={20} />
        </button>

        <div className="onboarding-content-container">
          {/* Adım İkonu */}
          <div className="onboarding-icon-wrapper" style={{ boxShadow: `0 10px 25px rgba(99, 102, 241, 0.15)` }}>
            <IconComponent size={42} style={{ color: current.color }} />
          </div>

          {/* Adım Rozeti */}
          <div className="onboarding-badge" style={{ backgroundColor: `rgba(99, 102, 241, 0.08)`, color: current.color }}>
            {current.badge}
          </div>

          {/* Adım Başlığı ve Açıklaması */}
          <h2 className="onboarding-main-title">{current.title}</h2>
          <p className="onboarding-main-desc">{current.description}</p>

          {/* Navigasyon Alanı */}
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
  );
};

export default Onboarding;
