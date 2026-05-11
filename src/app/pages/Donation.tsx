import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, GraduationCap, Users, Mail, Phone, ArrowLeft, User } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';
import { toast } from 'sonner';
import { useAuth } from '@/app/views/auth';
import { formatCurrency } from '@/app/views/formatters';
import { api, useSystemLookup } from '@/app/views/api';
import { customAlphabet, nanoid } from 'nanoid';

export function Donation() {
    const { isLoggedIn, setIsLoggedIn, session } = useAuth();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const { reverseLookup } = useSystemLookup();

    const amounts = [500, 1000, 2000, 5000, 10000, 20000];

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAmount(e.target.value);
        setSelectedAmount(null);
    };

    const handleDonate = async () => {
        const amount = selectedAmount || Number(customAmount);
        if (!amount || amount <= 0) {
            toast.error("Please select or enter a valid donation amount.");
            return;
        }

        const nanoidRef = customAlphabet("23456789BCDFGHJKLMNPQRSTVWXYZ", 3);
        const refId = `DON-${nanoidRef()}-${nanoidRef()}`;
        const donationId = nanoid(10);

        const newDonation = {
            id: donationId,
            donationId: donationId,
            donationReference: refId,
            userId: isLoggedIn ? session?.userId : null,
            donationStatusId: reverseLookup('Completed'),
            donationDate: new Date().toISOString(),
            donationAmount: amount,
            donationAmountPhp: formatCurrency(amount),
            donationAnonymous: !isLoggedIn || isAnonymous,
            donationEmail: isLoggedIn ? session?.email : donorEmail
        };

        try {
            await api.post('/donations', newDonation);

            if (isLoggedIn && !isAnonymous) {
                const statsRes = await api.get('/userStatistics', { params: { userId: session?.userId } });
                const stats = statsRes.data;
                if (stats && stats.length > 0) {
                    const currentStats = stats[0];
                    await api.patch(`/userStatistics/${currentStats.id}`, {
                        donatedAmount: currentStats.donatedAmount + amount
                    });
                }
            }

            if (isLoggedIn) {
                const achRes = await api.get('/achievements', { params: { 'achievementTitle': 'Philanthropist' } });
                const id_donate = achRes.data[0].id;
                const user_ach_donated = await api.get('/userAchievements', { params: { userId: session?.userId, achievementId: id_donate } });
                const ach = user_ach_donated.data;

                if (!ach || ach.length === 0) {
                    await api.post('/userAchievements', {
                        id: nanoid(10),
                        userId: session?.userId,
                        achievementId: id_donate,
                        achievementTier: 1,
                        achievedDate: new Date().toISOString()
                    });
                }
            }

            toast.success("Thank You for Your Generosity!", {
                description: `Your donation of ${formatCurrency(amount)} was successful.\nReference ID: ${refId}`,
                duration: 8000,
            });

            setSelectedAmount(1000);
            setCustomAmount('');
            setDonorEmail('');
            setIsAnonymous(false);

        } catch (error) {
            toast.error("Failed to process donation. Please try again.");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Hero Section - Special for Donation Page */}
            <div className="relative h-[450px] md:h-[500px] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url(http://localhost:3000/donate-hero.avif)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/90 to-brand-primary/40"></div>
                </div>

                <div className="absolute top-6 left-8 z-10 hidden md:block">
                    <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium p-2 rounded-lg hover:bg-white/10">
                        <ArrowLeft className="w-4 h-4" />
                        Back to site
                    </Link>
                </div>

                <div className="relative max-w-6xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center text-white">
                    <div className="md:hidden mb-6">
                        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium w-fit">
                            <ArrowLeft className="w-4 h-4" />
                            Back to site
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <Link to="/" className="flex items-center gap-3 ">
                            <img src="http://localhost:3000/alumni-logo.jpg" alt="USJ-R Logo" className="w-12 h-12 rounded-full border-2 border-white/30" />
                            <span className="font-bold text-xl tracking-wide">USJ-R SEA Alumni</span>
                        </Link>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight">
                        Empower the Next Generation of Josenians
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 max-w-2xl leading-relaxed">
                        Your generosity fuels scholarships, alumni programs, and community initiatives that keep the Josenian spirit alive.
                    </p>
                </div>
            </div>

            <main className="flex-grow bg-gray-50 py-12 md:py-20">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Column: Impact & Information */}
                        <div className="lg:col-span-7 space-y-12 pt-2 order-last lg:order-first">
                            <div className="text-lg text-gray-600">
                                <h2 className="text-3xl font-bold text-brand-primary mb-6 mt-0">Why Donate?</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: GraduationCap, title: "Scholarships", desc: "Support tuition for talented students in need." },
                                    { icon: Users, title: "Alumni Network", desc: "Fund events that connect Josenians worldwide." },
                                    { icon: Globe, title: "Community Outreach", desc: "Extend our Adelante spirit to local communities." },
                                    { icon: Heart, title: "Student Welfare", desc: "Provide resources for student holistic development." }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                                            <item.icon className="w-6 h-6 text-brand-primary" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Donation Form */}
                        {/* Should be vertically centered instead of flush */}
                        <div className="lg:col-span-5 self-center">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                                {!isLoggedIn ? (
                                    <div className="bg-brand-primary p-6 flex items-center justify-between text-white gap-4">
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold leading-tight mb-1">Anonymous Donation</h3>
                                            <p className="text-white/80 text-xs">Log in to link this to your alumni profile</p>
                                        </div>
                                        <Link to="/login" state={{ from: '/donate' }} className="whitespace-nowrap bg-white text-brand-primary px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm shadow-sm ring-1 ring-black/5">
                                            Log In
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-brand-primary p-6 text-white flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-lg leading-tight mb-1">Logged in as Alumni</h3>
                                                <p className="text-white/80 text-xs">Donation linked to your account</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                localStorage.setItem('userIsLoggedIn', 'false');
                                                setIsLoggedIn(false);
                                                toast.success("You are now making an anonymous donation.");
                                                window.dispatchEvent(new Event('storage'));
                                            }}
                                            className="whitespace-nowrap bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition-colors border border-white/20"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}

                                <div className="p-6 md:p-8">

                                    {/* Amount Grid */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {amounts.map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => handleAmountSelect(amount)}
                                                className={`py-3 px-2 rounded-lg border-2 text-sm font-semibold transition-all ${selectedAmount === amount
                                                    ? 'border-brand-accent bg-brand-accent/5 text-brand-primary'
                                                    : 'border-gray-200 hover:border-brand-primary/30 text-gray-600'
                                                    }`}
                                            >
                                                {formatCurrency(amount)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Amount */}
                                    <div className="mb-6">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            Custom Amount
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                                            <input
                                                type="number"
                                                placeholder="Enter amount"
                                                value={customAmount}
                                                onChange={handleCustomAmountChange}
                                                className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-primary focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Fields based on login state */}
                                    <div className="mb-8">
                                        {!isLoggedIn ? (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                    Email Address (Optional for Receipt)
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        value={donorEmail}
                                                        onChange={(e) => setDonorEmail(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-primary focus:outline-none transition-colors text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={isAnonymous}
                                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-800">Make my donation anonymous</span>
                                                    <span className="text-xs text-gray-500">Your donation will not update your public profile statistics.</span>
                                                </div>
                                            </label>
                                        )}
                                    </div>

                                    {/* Donate Button */}
                                    <button
                                        onClick={handleDonate}
                                        className="w-full bg-brand-accent text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-accent-hover transition-all transform hover:scale-[1.01] shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                        Donate {selectedAmount ? formatCurrency(selectedAmount) : customAmount ? formatCurrency(Number(customAmount)) : ''}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Simplified Footer */}
            <footer className="bg-[#1e1e1e] text-white py-12 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex items-center gap-2 text-white/90">
                                <Link to="/" className="flex items-center gap-2">
                                    <img src="http://localhost:3000/alumni-logo.jpg" alt="Logo" className="w-8 h-8 rounded opacity-80" />
                                    <span className="font-semibold tracking-wide">USJ-R SEA Alumni Association</span>
                                </Link>
                            </div>
                            <p className="text-gray-400 text-sm text-center md:text-left">
                                © 2026 University of San Jose-Recoletos School of Engineering and Architecture.<br />All rights reserved.
                            </p>
                        </div>

                        <div className="flex gap-6">
                            <a href="https://www.facebook.com/usjr.official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                                <SiFacebook className="w-4 h-4 text-white" />
                            </a>
                            <a href="https://x.com/USJR_official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                                <SiX className="w-4 h-4 text-white" />
                            </a>
                            <a href="https://www.instagram.com/usjr_official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                                <SiInstagram className="w-4 h-4 text-white" />
                            </a>
                            <a href="https://www.linkedin.com/school/usjrofficial/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                                <SiLinkedin className="w-4 h-4 text-white" />
                            </a>
                        </div>

                        <div className="text-right hidden md:block">
                            <div className="flex items-center gap-2 text-gray-400 text-sm justify-end mb-1">
                                <Mail className="w-3 h-3" />
                                <span>alumni@usjr.edu.ph</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm justify-end">
                                <Phone className="w-3 h-3" />
                                <span>+63 (32) 253-7900</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
