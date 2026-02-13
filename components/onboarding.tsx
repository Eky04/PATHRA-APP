'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check, Lock, ChevronUp, ChevronDown } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [weight, setWeight] = useState(64.5);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['none']);
  const [healthConditions, setHealthConditions] = useState<string[]>(['none']);

  // Save onboarding data to localStorage whenever user advances
  const saveOnboardingData = () => {
    const profileData = {
      gender,
      height,
      age,
      activityLevel,
      weight,
      weightUnit,
      dietaryRestrictions,
      healthConditions,
      bmi: (weight / ((height / 100) ** 2)).toFixed(1),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('onboardingProfile', JSON.stringify(profileData));
  };

  const toggleHealth = (value: string) => {
    if (value === 'none') {
      setHealthConditions(['none']);
    } else {
      let newConditions = healthConditions.filter(c => c !== 'none');
      if (newConditions.includes(value)) {
        newConditions = newConditions.filter(c => c !== value);
      } else {
        newConditions.push(value);
      }
      if (newConditions.length === 0) newConditions = ['none'];
      setHealthConditions(newConditions);
    }
  };

  const toggleDietary = (value: string) => {
    if (value === 'none') {
      setDietaryRestrictions(['none']);
    } else {
      let newRestrictions = dietaryRestrictions.filter(r => r !== 'none');
      if (newRestrictions.includes(value)) {
        newRestrictions = newRestrictions.filter(r => r !== value);
      } else {
        newRestrictions.push(value);
      }
      if (newRestrictions.length === 0) newRestrictions = ['none'];
      setDietaryRestrictions(newRestrictions);
    }
  };

  const calculateBMI = (w: number, h: number) => {
    const heightInM = h / 100;
    const bmi = w / (heightInM * heightInM);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = 'kurus';
      color = 'text-blue-500';
    } else if (bmi < 25) {
      category = 'normal';
      color = 'text-green-500';
    } else if (bmi < 30) {
      category = 'kelebihan berat badan';
      color = 'text-yellow-500';
    } else {
      category = 'obesitas';
      color = 'text-red-500';
    }
    return { value: bmi.toFixed(1), category, color };
  };

  const steps = [
    {
      title: (
        <>
          Selamat Datang di PATHRA
          <br />
          <span className="text-lg font-normal block mt-2">
            🎉 Tahun Baru, Diri Baru! Jadi lebih sehat di tahun 2026 🎄
          </span>
        </>
      ),
      description:
        'Hai 👋 Saya adalah Ahli Gizi Pribadi Anda yang didukung oleh AI. Saya akan mengajukan beberapa pertanyaan untuk mempersonalisasi rencana diet cerdas untuk Anda',
      icon: '',
      image: '👋',
    },
    {
      title: 'Apa jenis kelamin Anda?',
      description: 'Kami menggunakan jenis kelamin Anda untuk merancang rencana diet terbaik untuk Anda. Silakan pilih jenis kelamin yang paling sesuai dengan profil hormonal Anda.',
      icon: '⚧️',
      options: [
        {
          label: 'Laki-laki',
          value: 'male',
          image: '/images/gender-male.png',
        },
        {
          label: 'Perempuan',
          value: 'female',
          image: '/images/gender-female.png',
        },
      ],
      type: 'selection',
    },
    {
      title: 'Berapa tinggi Anda?',
      description: 'Kami menggunakan tinggi badan untuk menghitung kebutuhan kalori harian Anda.',
      icon: '📏',
      type: 'height',
      defaultValue: 170,
    },
    {
      title: 'Berapa usia Anda?',
      description: 'Usia Anda membantu kami menentukan kebutuhan kalori yang tepat.',
      icon: '📅',
      type: 'age',
      defaultValue: 25,
    },
    {
      title: 'Seberapa aktif Anda dalam aktivitas sehari-hari?',
      description: 'Pilih tingkat aktivitas Anda.',
      icon: '🏃‍♂️',
      type: 'activity',
      options: [
        {
          label: 'Sedentari',
          value: 'sedentary',
          description: 'Banyak duduk, sedikit olahraga',
          image: 'https://placehold.co/200x200/e2e8f0/1e293b?text=Sedentary'
        },
        {
          label: 'Sedikit aktif',
          value: 'light',
          description: 'Olahraga ringan 1-3 hari/minggu',
          image: 'https://placehold.co/200x200/e2e8f0/1e293b?text=Light'
        },
        {
          label: 'Cukup aktif',
          value: 'moderate',
          description: 'Olahraga sedang 3-5 hari/minggu',
          image: 'https://placehold.co/200x200/e2e8f0/1e293b?text=Moderate'
        },
        {
          label: 'Sangat aktif',
          value: 'active',
          description: 'Olahraga berat 6-7 hari/minggu',
          image: 'https://placehold.co/200x200/e2e8f0/1e293b?text=Active'
        }
      ]
    },
    {
      title: 'Berapa berat Anda?',
      description: 'Kami menggunakan berat badan untuk menghitung BMI Anda.',
      icon: '⚖️',
      type: 'weight',
      defaultValue: 60,
    },
    {
      title: 'Apakah Anda memiliki pembatasan diet?',
      description: 'Pilih alergi atau makanan yang tidak Anda sukai.',
      icon: '🚫',
      type: 'dietary',
      options: [
        { label: 'Tidak ada', value: 'none', icon: '✅' },
        { label: 'Vegetarian', value: 'vegetarian', icon: '🌱' },
        { label: 'Vegan', value: 'vegan', icon: '🌿' },
        { label: 'Bebas Gluten', value: 'gluten_free', icon: '🌾' },
        { label: 'Bebas Susu', value: 'dairy_free', icon: '🥛' },
        { label: 'Tidak suka daging merah', value: 'no_red_meat', icon: '🥩' },
        { label: 'Alergi kacang', value: 'nut_allergy', icon: '🥜' },
      ]
    },
    {
      title: 'Apakah Anda memiliki kondisi kesehatan tertentu?',
      description: 'Pilih kondisi yang sesuai agar kami dapat menyesuaikan program.',
      icon: '🏥',
      type: 'health',
      options: [
        { label: 'Tidak ada', value: 'none', icon: '✅' },
        { label: 'Tekanan darah tinggi', value: 'high_blood_pressure', icon: '💓' },
        { label: 'Diabetes', value: 'diabetes', icon: '🍭' },
        { label: 'Kolesterol tinggi', value: 'high_cholesterol', icon: '🍟' },
        { label: 'Lainnya', value: 'other', icon: '❓' },
      ]
    },
    {
      title: 'Terima kasih atas kepercayaan Anda!',
      description: 'Sekarang mari kita personalisasi DietAI hanya untuk Anda...',
      icon: '🤝',
      type: 'privacy',
    },
    {
      title: 'Semua selesai! Bersiaplah untuk mencatat makanan pertama Anda!',
      description: '',
      icon: '🎉',
      type: 'completion',
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const submitToDatabase = async () => {
    const profileData = {
      gender,
      height,
      age,
      weight,
      activityLevel, // Maps to favorite_sports or health_motivation in DB? NO, need to check schema.
      // Schema has: age, gender, height, weight, daily_*_target, favorite_sports, health_motivation.
      // We need to map frontend state to DB fields.
      dietaryPreferences: dietaryRestrictions, // Not in DB profile? Store in health_motivation as JSON?
      healthConditions: healthConditions, // Not in DB profile?
    };

    // Calculate BMR/TDEE for targets
    const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
    const activityMultipliers: Record<string, number> = { 'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'active': 1.725 };
    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));

    const apiPayload = {
      age,
      gender,
      height,
      weight,
      daily_calorie_target: tdee,
      daily_steps_target: 10000, // Default
      health_motivation: JSON.stringify({
        dietary: dietaryRestrictions,
        health: healthConditions,
        activity: activityLevel
      }),
      favorite_sports: '', // Not collected in this onboarding
    };

    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
    } catch (e) {
      console.error('Failed to save profile to DB:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all ${idx <= step ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Langkah {step + 1} dari {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          {(currentStep as any).type !== 'privacy' && (currentStep as any).type !== 'completion' && (
            <>
              <div className="text-5xl mb-4">{currentStep.icon}</div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                {currentStep.title}
              </h2>
              <p className="text-muted-foreground">{currentStep.description}</p>
            </>
          )}

          {/* Input Field */}
          {(currentStep as any).input && (
            <div className="mt-6">
              <input
                type="number"
                defaultValue={(currentStep as any).defaultValue}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-center text-lg font-semibold"
                placeholder="Masukkan angka"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {(currentStep as any).unit}
              </p>
            </div>
          )}

          {/* Options (Standard) */}
          {(currentStep as any).options && !(currentStep as any).type && (
            <div className="mt-6 space-y-2">
              {(currentStep as any).options.map((option: string) => (
                <button
                  key={option}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-foreground font-medium"
                >
                  <Check size={16} className="inline mr-2 text-primary" />
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Selection Cards (Gender) */}
          {(currentStep as any).type === 'selection' && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {(currentStep as any).options.map((option: any) => (
                <button
                  key={option.value}
                  className={`group relative flex flex-col items-center p-4 border-2 rounded-2xl transition-all ${gender === option.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                  onClick={() => {
                    setGender(option.value);
                    saveOnboardingData();
                    if (!isLastStep) setStep(step + 1);
                  }}
                >
                  <div className="w-full aspect-[3/5] relative rounded-xl overflow-hidden mb-3 bg-gray-100">
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="font-semibold text-lg">{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Height Ruler UI */}
          {/* Height Ruler UI */}
          {(currentStep as any).type === 'height' && (
            <div className="mt-6 flex gap-8 items-center justify-center">
              {/* Dynamic Body Image based on Gender */}
              <div className="w-1/3 aspect-[3/5] relative">
                <img
                  src={gender === 'male' ? '/images/gender-male.png' : '/images/gender-female.png'}
                  alt="Body Representation"
                  className="w-full h-full object-contain"
                />
                {/* Height line indicator */}
                <div
                  className="absolute w-full border-t-2 border-primary border-dashed"
                  style={{ top: '30%' }}
                >
                  <span className="absolute -top-7 right-0 bg-primary text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {height} cm
                  </span>
                </div>
              </div>

              {/* Slider with Controls */}
              <div className="h-80 flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-2">
                  <button className="px-4 py-1 bg-white shadow-sm rounded-md text-sm font-semibold text-primary">cm</button>
                  <button className="px-4 py-1 text-sm font-semibold text-muted-foreground">ft</button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0"
                  onClick={() => setHeight((h) => Math.min(220, h + 1))}
                  type="button"
                >
                  <ChevronUp className="w-6 h-6" />
                </Button>

                <div className="relative h-full w-20 bg-gray-50 rounded-2xl border-2 border-border overflow-hidden flex flex-col items-center py-4 shrink">
                  <input
                    type="range"
                    min="100"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="h-full w-full opacity-0 absolute z-20 cursor-ns-resize appearance-none"
                    style={{ transform: 'rotate(180deg)', cursor: 'row-resize' }}
                    // @ts-ignore
                    orient="vertical"
                  />
                  {/* Custom Ruler Visuals */}
                  <div className="absolute inset-0 flex flex-col items-center justify-between py-2 pointer-events-none opacity-30">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className={`w-10 h-0.5 ${i % 5 === 0 ? 'bg-primary w-14' : 'bg-gray-400'}`}></div>
                    ))}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-4xl font-bold text-primary">
                    {height}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0"
                  onClick={() => setHeight((h) => Math.max(100, h - 1))}
                  type="button"
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
              </div>
            </div>
          )}

          {/* Age Selection UI */}
          {(currentStep as any).type === 'age' && (
            <div className="mt-8 flex flex-col items-center justify-center">
              <div className="h-48 w-full overflow-y-auto snap-y snap-mandatory flex flex-col items-center gap-2 py-16 scrollbar-hide relative">
                {/* Selection Highlight Box */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-14 border-2 border-primary rounded-xl pointer-events-none z-10"></div>

                {[...Array(80)].map((_, i) => {
                  const val = i + 12; // Start from age 12
                  const isSelected = val === age;
                  return (
                    <button
                      key={val}
                      onClick={() => setAge(val)}
                      className={`snap-center shrink-0 w-full text-center transition-all duration-300 py-2 ${isSelected
                        ? 'text-4xl font-bold text-primary scale-110'
                        : 'text-xl text-gray-300 hover:text-gray-400'
                        }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-muted-foreground font-medium">Tahun</p>
            </div>
          )}

          {/* Activity Level UI */}
          {(currentStep as any).type === 'activity' && (
            <div className="mt-6 flex flex-col gap-4">
              {(currentStep as any).options.map((option: any) => {
                const isSelected = activityLevel === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setActivityLevel(option.value)}
                    className={`relative w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 border-2 overflow-hidden group ${isSelected
                      ? 'bg-green-500 border-green-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <div className="flex flex-col items-start gap-1 z-10">
                      <div className="flex items-center gap-2">
                        {/* Icon based on level could go here, for now just a generic dot or emoji if needed */}
                        {isSelected && <Check size={18} className="text-white" />}
                        <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                          {option.label}
                        </span>
                        {/* Info icon (visual only) */}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${isSelected ? 'border-white text-white' : 'border-gray-400 text-gray-400'}`}>i</div>
                      </div>
                    </div>

                    {/* Character Image */}
                    <div className="w-16 h-16 ml-4 relative">
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-full h-full object-cover rounded-lg mix-blend-multiply" // simplified styling
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Weight Selection UI (BMI & Ruler) */}
          {(currentStep as any).type === 'weight' && (
            <div className="mt-4 flex flex-col items-center w-full">
              {/* Unit Toggle */}
              <div className="flex bg-gray-200 rounded-full p-1 mb-8">
                <button
                  onClick={() => setWeightUnit('kg')}
                  className={`px-6 py-1 rounded-full text-sm font-semibold transition-all ${weightUnit === 'kg' ? 'bg-green-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  kg
                </button>
                <button
                  onClick={() => setWeightUnit('lbs')}
                  className={`px-6 py-1 rounded-full text-sm font-semibold transition-all ${weightUnit === 'lbs' ? 'bg-green-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  lbs
                </button>
              </div>

              {/* BMI Display */}
              <div className="text-center mb-8 w-full">
                <p className="text-sm text-gray-500 mb-1">Indeks Massa Tubuh (BMI) Anda adalah</p>
                <div className="text-5xl font-bold text-blue-500 mb-2">
                  {calculateBMI(weight, height).value.replace('.', ',')}
                </div>
                <p className="text-sm text-gray-600">
                  BMI Anda menunjukkan bahwa Anda <span className={`font-bold ${calculateBMI(weight, height).color}`}>{calculateBMI(weight, height).category}!</span>
                </p>

                {/* BMI Gauge Bar */}
                <div className="mt-4 relative w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  <div className="flex-1 h-full bg-blue-400"></div> {/* Underweight */}
                  <div className="flex-1 h-full bg-green-500"></div> {/* Normal */}
                  <div className="flex-1 h-full bg-yellow-400"></div> {/* Overweight */}
                  <div className="flex-1 h-full bg-red-500"></div> {/* Obese */}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>18.5</span>
                  <span>25.0</span>
                  <span>30.0</span>
                  <span>35.0</span>
                </div>
              </div>

              {/* Weight Input & Ruler */}
              <div className="w-full relative py-4">
                <div className="text-center mb-2">
                  <span className="text-5xl font-bold text-green-500">{weight.toFixed(1).replace('.', ',')}</span>
                  <span className="text-xl font-medium text-gray-400 ml-1">{weightUnit}</span>
                </div>

                <div className="relative w-full h-16 bg-gray-50 border-t border-b border-gray-200 overflow-hidden">
                  <input
                    type="range"
                    min="30"
                    max="150"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="absolute w-[110%] -left-[5%] top-1/2 -translate-y-1/2 cursor-pointer opacity-0 z-20 h-full"
                  />
                  {/* Ruler Ticks Visual */}
                  <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
                    {[...Array(41)].map((_, i) => (
                      <div key={i} className={`w-0.5 rounded-full bg-gray-300 ${i % 5 === 0 ? 'h-8 bg-gray-400' : 'h-4'}`}></div>
                    ))}
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-blue-500 z-10"></div>
                </div>
              </div>
            </div>
          )}

          {/* Dietary Restrictions UI */}
          {(currentStep as any).type === 'dietary' && (
            <div className="mt-6 flex flex-col gap-3">
              {(currentStep as any).options.map((option: any) => {
                const isSelected = dietaryRestrictions.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleDietary(option.value)}
                    className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-200 border text-left ${isSelected
                      ? 'bg-green-500 border-green-500 text-white shadow-md'
                      : 'bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    {/* Checkmark or Info Icon */}
                    {isSelected ? (
                      <div className="bg-white/20 p-1 rounded-full"><Check size={16} /></div>
                    ) : (
                      <div className="text-gray-400 border border-gray-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">i</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Health Conditions UI */}
          {(currentStep as any).type === 'health' && (
            <div className="mt-6 flex flex-col gap-3">
              {(currentStep as any).options.map((option: any) => {
                const isSelected = healthConditions.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleHealth(option.value)}
                    className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-200 border text-left ${isSelected
                      ? 'bg-green-500 border-green-500 text-white shadow-md'
                      : 'bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    {isSelected && (
                      <div className="bg-white/20 p-1 rounded-full"><Check size={16} /></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Privacy / Trust UI */}
          {(currentStep as any).type === 'privacy' && (
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="w-48 h-48 mb-6 relative">
                <img
                  src="/trust-icon.webp"
                  alt="Trust Handshake"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">Terima kasih atas kepercayaan Anda!</h2>
              <p className="text-gray-600 mb-8">
                Sekarang mari kita personalisasi DietAI hanya untuk Anda...
              </p>
              <div className="flex flex-col items-center gap-2 mb-8">
                <Lock size={48} className="text-yellow-500 mb-2" />
                <p className="text-sm font-semibold text-gray-800">Privasi dan keamanan Anda adalah prioritas utama kami.</p>
                <p className="text-xs text-gray-500 max-w-xs">
                  Informasi pribadi Anda akan disimpan dengan aman dan dilindungi.
                </p>
              </div>
            </div>
          )}

          {/* Completion UI */}
          {(currentStep as any).type === 'completion' && (
            <div className="mt-2 flex flex-col items-center text-center">
              {/* Success Checkmark */}
              <div className="mb-8 relative">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Check size={48} className="text-white" strokeWidth={4} />
                </div>
                {/* Confetti decorations (css only simplistic) */}
                <div className="absolute -top-4 -left-4 text-2xl">🎉</div>
                <div className="absolute top-0 -right-8 text-xl">✨</div>
                <div className="absolute -bottom-2 -left-6 text-xl">🎊</div>
                <div className="absolute -bottom-4 -right-4 text-2xl">🥳</div>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-8 px-4">
                Semua selesai! Bersiaplah untuk mencatat makanan pertama Anda!
              </h2>

              {/* Character Illustration */}
              <div className="w-64 h-80 relative">
                <img
                  src="https://placehold.co/300x400/transparent/png?text=Woman+Eating+Salad"
                  alt="Woman Eating Salad"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/5 bg-transparent"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft size={18} className="mr-2" />
              Kembali
            </Button>
          )}
          <Button
            className={`flex-1 ${isLastStep
              ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
              : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
              }`}
            onClick={async () => {
              saveOnboardingData();
              if (isLastStep) {
                await submitToDatabase();
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
          >
            {isLastStep ? (
              <>
                <Check size={18} className="mr-2" />
                Mulai Sekarang
              </>
            ) : (
              <>
                Lanjut
                <ChevronRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Button */}
        {step < steps.length - 1 && (
          <button
            onClick={() => setStep(steps.length - 1)}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Lewati Setup
          </button>
        )}
      </div>
    </div>
  );
}
