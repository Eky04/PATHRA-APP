'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import {
    X,
    Zap,
    Image as ImageIcon,
    HelpCircle,
    CheckCircle,
    RefreshCw,
    Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/types/food';

interface FoodScannerProps {
    onCheck: (food: FoodItem) => void;
    onClose: () => void;
}

export function FoodScanner({ onCheck, onClose }: FoodScannerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [scanningState, setScanningState] = useState<'idle' | 'scanning' | 'analyzing' | 'detected' | 'error'>('idle');
    const [detectedFood, setDetectedFood] = useState<FoodItem | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        setScanningState('analyzing');
        setErrorMessage(null);

        try {
            const response = await fetch('/api/ai/analyze-food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageSrc }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze image');
            }

            const data = await response.json();

            // Transform API response to FoodItem
            const foodItem: FoodItem = {
                id: Date.now().toString(),
                name: data.name || 'Unknown Food',
                calories: data.calories || 0,
                protein: data.protein || 0,
                carbs: data.carbs || 0,
                fat: data.fat || 0,
                portion: data.portion || '1 porsi',
                image: '📸', // We could use the captured image here if we uploaded it
            };

            setDetectedFood(foodItem);
            setScanningState('detected');

        } catch (error) {
            console.error('Analysis failed', error);
            setScanningState('error');
            setErrorMessage(error instanceof Error ? error.message : 'Gagal menganalisa makanan');
        }
    }, [webcamRef]);

    const handleConfirm = () => {
        if (detectedFood) {
            onCheck(detectedFood);
        }
    };

    const handleRetake = () => {
        setScanningState('idle');
        setDetectedFood(null);
        setErrorMessage(null);
    };

    const videoConstraints = {
        width: 720,
        height: 1280,
        facingMode: "environment"
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Container simulating mobile frame or full screen */}
            <div className="relative w-full h-full max-w-md bg-slate-900 overflow-hidden md:rounded-3xl shadow-2xl md:h-[800px] md:border-[12px] md:border-slate-800 flex flex-col">

                {/* Camera Feed */}
                <div className="relative flex-1 bg-black">
                    {scanningState !== 'detected' && scanningState !== 'analyzing' ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover"
                            mirrored={false}
                        />
                    ) : (
                        // Show a freeze frame simulation or placeholder while analyzing/result
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            {scanningState === 'analyzing' && (
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-white font-medium">Menganalisa Makanan...</p>
                                </div>
                            )}
                            {scanningState === 'detected' && (
                                <div className="text-center text-white">
                                    <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                                    <p className="text-xl font-bold">Analisa Selesai!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scanning Overlay Animation */}
                    {scanningState === 'scanning' && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                    )}
                </div>

                {/* Header Overlay */}
                <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${scanningState === 'analyzing' ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className="text-white text-xs font-medium uppercase tracking-wider">
                            {scanningState === 'analyzing' ? 'AI Processing' : 'AI Ready'}
                        </span>
                    </div>

                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors">
                        <HelpCircle size={20} />
                    </button>
                </div>

                {/* Result Card Overlay */}
                {scanningState === 'detected' && detectedFood && (
                    <div className="absolute bottom-32 left-0 right-0 px-6 z-20 animate-in slide-in-from-bottom-10 duration-500">
                        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">🥗</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Terdeteksi:</p>
                                    <h3 className="text-white text-lg font-semibold">{detectedFood.name}</h3>
                                    <p className="text-white/80 text-sm">{detectedFood.portion}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-4">
                                <div className="bg-white/10 p-2 rounded-lg text-center">
                                    <p className="text-[10px] text-white/60">Kalori</p>
                                    <p className="text-white font-bold">{detectedFood.calories}</p>
                                </div>
                                <div className="bg-white/10 p-2 rounded-lg text-center">
                                    <p className="text-[10px] text-white/60">Prot</p>
                                    <p className="text-white font-bold">{detectedFood.protein}g</p>
                                </div>
                                <div className="bg-white/10 p-2 rounded-lg text-center">
                                    <p className="text-[10px] text-white/60">Karbo</p>
                                    <p className="text-white font-bold">{detectedFood.carbs}g</p>
                                </div>
                                <div className="bg-white/10 p-2 rounded-lg text-center">
                                    <p className="text-[10px] text-white/60">Lemak</p>
                                    <p className="text-white font-bold">{detectedFood.fat}g</p>
                                </div>
                            </div>

                            <Button onClick={handleConfirm} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl">
                                Tambahkan ke Log
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Overlay */}
                {scanningState === 'error' && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/80">
                        <div className="bg-white rounded-2xl p-6 text-center max-w-xs">
                            <div className="text-red-500 mb-2 font-bold text-lg">Error</div>
                            <p className="text-gray-700 mb-4">{errorMessage}</p>
                            <Button onClick={handleRetake} variant="outline">Coba Lagi</Button>
                        </div>
                    </div>
                )}


                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between px-10 pb-8 z-20">
                    {scanningState === 'detected' ? (
                        <button
                            onClick={handleRetake}
                            className="w-full flex items-center justify-center gap-2 text-white/80 hover:text-white pb-4"
                        >
                            <RefreshCw size={20} />
                            <span>Scan Ulang</span>
                        </button>
                    ) : (
                        <>
                            <button className="w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                                <ImageIcon size={28} />
                            </button>

                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all"></div>
                                <button
                                    onClick={capture}
                                    disabled={scanningState !== 'idle'}
                                    className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-[72px] h-[72px] border-4 border-slate-200 rounded-full flex items-center justify-center">
                                        <div className="w-16 h-16 bg-primary rounded-full hover:bg-primary/90 transition-colors"></div>
                                    </div>
                                </button>
                            </div>

                            <button
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Zap size={28} className={scanningState !== 'idle' ? 'fill-yellow-400 text-yellow-400' : ''} />
                            </button>
                        </>
                    )}
                </div>

            </div>

            <p className="hidden md:block text-white/50 text-sm mt-4">
                Arahkan kamera ke makanan Anda untuk analisis nutrisi AI instan
            </p>
        </div>
    );
}
