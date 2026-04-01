import React, { useState } from 'react';
import { Rocket, Layout, Calendar, BarChart2, CheckCircle, ArrowRight, X } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    {
      title: "VeloPath'e Hoş Geldin! 🚀",
      description: "Hayallerini ve projelerini haftalık planlara bölerek gerçeğe dönüştürmek için tasarlanmış en akıllı asistanınla tanış.",
      icon: <Rocket size={48} color="var(--primary)" />,
      color: "var(--primary)"
    },
    {
      title: "Projelerini Özelleştir 🏗️",
      description: "Yeni bir proje oluştururken kendine özel renkler seçebilir, öncelik belirleyebilir ve hedeflerini tanımlayabilirsin.",
      icon: <Layout size={48} color="var(--accent)" />,
      color: "var(--accent)"
    },
    {
      title: "Haftalık İlerleme 📅",
      description: "Her projeyi haftalara ayır, görevlerini sürükle-bırak yöntemiyle yönet ve ilerlemeni dairesel grafiklerle takip et.",
      icon: <Calendar size={48} color="var(--status-low)" />,
      color: "var(--status-low)"
    },
    {
      title: "Analiz ve Verimlilik 📈",
      description: "İstatistik sekmesinden performansını analiz et, en verimli günlerini keşfet ve seri (streak) yaparak istikrarını koru.",
      icon: <BarChart2 size={48} color="var(--status-done)" />,
      color: "var(--status-done)"
    }
  ];

  const currentStep = steps[step - 1];

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

  return (
    <div className="onboarding-overlay active">
      <div className="onboarding-modal animate-slide-up">
        <button className="onboarding-close" onClick={handleSkip}>
          <X size={20} />
        </button>

        <div className="onboarding-content">
          <div className="onboarding-icon-wrapper" style={{ background: `rgba(99, 102, 241, 0.1)` }}>
             <div className="onboarding-icon animate-pop">
                {currentStep.icon}
             </div>
          </div>

          <h2 className="onboarding-title">{currentStep.title}</h2>
          <p className="onboarding-description">{currentStep.description}</p>

          <div className="onboarding-steps-indicator">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`step-dot ${idx + 1 === step ? 'active' : (idx + 1 < step ? 'done' : '')}`}
              ></div>
            ))}
          </div>

          <div className="onboarding-footer">
            <button className="button-secondary" onClick={handleSkip}>Atla</button>
            <button className="button" onClick={handleNext}>
              {step === totalSteps ? "Hadi Başlayalım!" : "Sıradaki"}
              {step !== totalSteps && <ArrowRight size={18} />}
              {step === totalSteps && <CheckCircle size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
