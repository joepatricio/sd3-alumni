import { useState, useEffect } from 'react';
import { Heart, Search, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, useSystemLookup } from '@/app/views/api';
import { formatCurrency, getStatusColor } from '@/app/views/formatters';
import { nanoid } from 'nanoid';

export function UserDonations({ userId, onStatsUpdate }: { userId: string, onStatsUpdate?: (newAmount: number) => void }) {
    const [loading, setLoading] = useState(true);
    const [donations, setDonations] = useState<any[]>([]);
    const [claimRefId, setClaimRefId] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const { lookup } = useSystemLookup();

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/DONATIONS', {
                params: { user_id: userId, _sort: '-donation_date' }
            });
            setDonations(res.data.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch donations', err);
            toast.error('Failed to load donations history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, [userId]);

    const recalculateStats = async () => {
        try {
            // Fetch all public donations for this user
            const pubRes = await api.get('/DONATIONS', {
                params: { user_id: userId, donation_anonymous: false, donation_status_id: 501 }
            });
            const pubDonations = pubRes.data.data || pubRes.data || [];
            const total = pubDonations.reduce((sum: number, d: any) => sum + Number(d.donation_amount), 0);

            const statsRes = await api.get('/USER_STATISTICS', { params: { user_id: userId } });
            const stats = statsRes.data.data || statsRes.data;
            if (stats && stats.length > 0) {
                await api.patch(`/USER_STATISTICS/${stats[0].id}`, {
                    donated_amount: total
                });
                if (onStatsUpdate) {
                    onStatsUpdate(total);
                }
            }
        } catch (err) {
            console.error("Failed to recalculate stats", err);
        }
    };

    const awardAchievementIfMissing = async () => {
        try {
            const achRes = await api.get('/USER_ACHIEVEMENT', { params: { user_id: userId, achievement_id: 2 } });
            const ach = achRes.data.data || achRes.data;
            if (!ach || ach.length === 0) {
                await api.post('/USER_ACHIEVEMENT', {
                    id: nanoid(10),
                    user_achievement_id: nanoid(10),
                    user_id: Number(userId),
                    achievement_id: 2,
                    achievement_tier: 1,
                    achieved_date: new Date().toISOString()
                });
            }
        } catch (err) {
            console.error("Failed to award achievement", err);
        }
    };

    const handleToggleAnonymity = async (donation: any) => {
        const newAnonymousState = !donation.donation_anonymous;
        try {
            await api.patch(`/DONATIONS/${donation.id}`, {
                donation_anonymous: newAnonymousState
            });

            setDonations(prev => prev.map(d =>
                d.id === donation.id ? { ...d, donation_anonymous: newAnonymousState } : d
            ));

            toast.success(`Donation marked as ${newAnonymousState ? 'private' : 'public'}.`);
            await recalculateStats();

            // Dispatch event to update the main profile header if needed
            window.dispatchEvent(new Event('storage'));

        } catch (err) {
            toast.error("Failed to update donation privacy.");
        }
    };

    const handleClaimDonation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claimRefId.trim()) return;

        try {
            setIsClaiming(true);
            const res = await api.get('/DONATIONS', {
                params: { donation_reference_id: claimRefId.trim() }
            });
            const found = res.data.data || res.data;

            if (!found || found.length === 0) {
                toast.error("No donation found with that reference ID.");
                return;
            }

            const targetDonation = found[0];

            if (targetDonation.user_id) {
                if (String(targetDonation.user_id) === String(userId)) {
                    toast.info("This donation is already linked to your account.");
                } else {
                    toast.error("This donation has already been claimed by another account.");
                }
                return;
            }

            // Claim it!
            await api.patch(`/DONATIONS/${targetDonation.id}`, {
                user_id: Number(userId)
            });

            toast.success("Successfully claimed donation!");
            setClaimRefId('');
            await fetchDonations();
            await recalculateStats();
            await awardAchievementIfMissing();

            window.dispatchEvent(new Event('storage'));

        } catch (err) {
            console.error("Claim error:", err);
            toast.error("Failed to claim donation.");
        } finally {
            setIsClaiming(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Claim Anonymous Donation</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Did you make a donation while logged out? Enter your Reference ID below to link it to your account and receive the Philanthropist achievement!
                </p>
                <form onSubmit={handleClaimDonation} className="flex gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="e.g. DON-ABC-123"
                            value={claimRefId}
                            onChange={(e) => setClaimRefId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-brand-primary focus:outline-none transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isClaiming || !claimRefId.trim()}
                        className="bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center justify-center min-w-[100px]"
                    >
                        {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">Donation History</h3>
                </div>

                {donations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Heart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p>You haven't made any donations yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {donations.map((donation) => (
                            <div key={donation.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-lg text-brand-primary">
                                            {formatCurrency(donation.donation_amount)}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(lookup(donation.donation_status_id))}`}>
                                            {lookup(donation.donation_status_id)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>Date: {new Date(donation.donation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="font-mono text-xs">Ref: {donation.donation_reference_id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center sm:justify-end">
                                    <button
                                        onClick={() => handleToggleAnonymity(donation)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${donation.donation_anonymous
                                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                            : 'border-brand-primary/20 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10'
                                            }`}
                                    >
                                        {donation.donation_anonymous ? (
                                            <>
                                                <EyeOff className="w-4 h-4" />
                                                Private
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4" />
                                                Public
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
