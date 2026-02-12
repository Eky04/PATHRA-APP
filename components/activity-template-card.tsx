import { Route, Timer, Image } from 'lucide-react';

export interface ActivityStats {
    type: string;
    duration: string;
    distance: string;
    calories: number;
    pace: string;
    date: string;
    userName: string;
}

export interface TemplateData {
    imageDataUrl: string;
    templateId: string;
    stats: ActivityStats;
}

export const TEMPLATES = [
    {
        id: 'strava-dark',
        name: 'Dark Runner',
        description: 'Gradient gelap dengan stats',
        gradient: 'from-gray-900/80 via-gray-900/40 to-gray-900/80',
        textColor: 'text-white',
        accentColor: 'text-orange-400',
        statBg: 'bg-black/30 backdrop-blur-md border border-white/10',
        logoColor: 'text-white/90',
    },
    {
        id: 'strava-vibrant',
        name: 'Vibrant Pulse',
        description: 'Gradient warna-warni energik',
        gradient: 'from-purple-600/70 via-transparent to-orange-500/70',
        textColor: 'text-white',
        accentColor: 'text-yellow-300',
        statBg: 'bg-white/10 backdrop-blur-md border border-white/20',
        logoColor: 'text-white',
    },
    {
        id: 'strava-clean',
        name: 'Clean White',
        description: 'Minimalis bersih',
        gradient: 'from-white/90 via-white/20 to-white/90',
        textColor: 'text-gray-900',
        accentColor: 'text-primary',
        statBg: 'bg-white/70 backdrop-blur-md border border-gray-200',
        logoColor: 'text-gray-900',
    },
    {
        id: 'strava-neon',
        name: 'Neon Night',
        description: 'Efek neon cyberpunk',
        gradient: 'from-cyan-600/60 via-transparent to-fuchsia-600/60',
        textColor: 'text-white',
        accentColor: 'text-cyan-300',
        statBg: 'bg-black/50 backdrop-blur-lg border border-cyan-400/30',
        logoColor: 'text-cyan-300',
    },
    {
        id: 'no-template',
        name: 'Tanpa Template',
        description: 'Foto polos tanpa overlay',
        gradient: '',
        textColor: '',
        accentColor: '',
        statBg: '',
        logoColor: '',
    },
];

export function ActivityTemplateCard({
    imageDataUrl,
    template,
    stats,
    size = 'full',
}: {
    imageDataUrl: string;
    template: (typeof TEMPLATES)[0];
    stats: ActivityStats;
    size?: 'full' | 'thumb';
}) {
    if (template.id === 'no-template') {
        return (
            <div className={`relative overflow-hidden ${size === 'thumb' ? 'rounded-lg' : 'rounded-2xl'}`}>
                <img src={imageDataUrl} alt="Post" className={`w-full object-cover ${size === 'thumb' ? 'h-20' : 'h-80'}`} />
            </div>
        );
    }

    const isThumb = size === 'thumb';

    return (
        <div className={`relative overflow-hidden ${isThumb ? 'rounded-lg' : 'rounded-2xl'} group`}>
            {/* Background Image */}
            <img
                src={imageDataUrl}
                alt="Activity"
                className={`w-full object-cover ${isThumb ? 'h-20' : 'h-80'}`}
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-b ${template.gradient}`} />

            {/* Content */}
            {!isThumb && (
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                    {/* Top - Activity Type & Logo */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${template.accentColor} opacity-90`}>
                                {stats.type}
                            </p>
                            <p className={`text-xs ${template.textColor} opacity-60 mt-0.5`}>
                                {stats.date}
                            </p>
                        </div>
                        <div className={`flex items-center gap-1.5 ${template.logoColor}`}>
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <span className="text-white text-[10px] font-black">P</span>
                            </div>
                            <span className="text-xs font-bold tracking-wide">PATHRA</span>
                        </div>
                    </div>

                    {/* Bottom - Stats Grid */}
                    <div>
                        <p className={`text-sm font-medium ${template.textColor} opacity-70 mb-2`}>
                            {stats.userName}
                        </p>
                        <div className={`grid grid-cols-4 gap-2 ${template.statBg} rounded-xl p-3`}>
                            <div className="text-center">
                                <div className={`flex items-center justify-center gap-1 mb-1 ${template.accentColor}`}>
                                    <Route size={12} />
                                </div>
                                <p className={`text-lg font-bold ${template.textColor} leading-none`}>{stats.distance}</p>
                                <p className={`text-[10px] ${template.textColor} opacity-50 uppercase tracking-wider mt-0.5`}>KM</p>
                            </div>
                            <div className="text-center">
                                <div className={`flex items-center justify-center gap-1 mb-1 ${template.accentColor}`}>
                                    <Timer size={12} />
                                </div>
                                <p className={`text-lg font-bold ${template.textColor} leading-none`}>{stats.duration}</p>
                                <p className={`text-[10px] ${template.textColor} opacity-50 uppercase tracking-wider mt-0.5`}>DURASI</p>
                            </div>
                            <div className="text-center">
                                <div className={`flex items-center justify-center gap-1 mb-1 ${template.accentColor}`}>
                                    <Image size={12} />
                                </div>
                                <p className={`text-lg font-bold ${template.textColor} leading-none`}>{stats.pace}</p>
                                <p className={`text-[10px] ${template.textColor} opacity-50 uppercase tracking-wider mt-0.5`}>PACE</p>
                            </div>
                            <div className="text-center">
                                <div className={`flex items-center justify-center gap-1 mb-1 ${template.accentColor}`}>
                                    <span className="text-[10px] font-bold">CAL</span>
                                </div>
                                <p className={`text-lg font-bold ${template.textColor} leading-none`}>{stats.calories}</p>
                                <p className={`text-[10px] ${template.textColor} opacity-50 uppercase tracking-wider mt-0.5`}>KCAL</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
