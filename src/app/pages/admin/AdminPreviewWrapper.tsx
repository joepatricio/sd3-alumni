import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Profile } from '@pages/user/Profile';
import { EventDetail } from '@pages/user/EventDetail';
import { BulletinDetail } from '@pages/user/BulletinDetail';

export function AdminPreviewWrapper() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();

    const normalizedType = (type || '').toLowerCase();

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Top Admin Preview Banner */}
            <div className="p-4 bg-gradient-to-br from-[#1b4332] via-[#0f2e22] to-[#081c15] text-white rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-800/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm uppercase tracking-wider text-emerald-400">Admin Preview Mode</span>
                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30">
                                Approved State Render
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                            Rendering live {normalizedType === 'user' ? 'User Profile' : normalizedType === 'event' ? 'Event' : 'Bulletin'} page (ID: {id}) within Admin Layout.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
                    </Button>
                </div>
            </div>

            {/* Embedded Live Webpage Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
                {normalizedType === 'user' || normalizedType === 'profile' ? (
                    <Profile />
                ) : normalizedType === 'event' ? (
                    <EventDetail />
                ) : normalizedType === 'bulletin' ? (
                    <BulletinDetail />
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        Unknown preview type: {type}
                    </div>
                )}
            </div>
        </div>
    );
}
