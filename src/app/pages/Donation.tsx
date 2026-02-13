import { useState } from 'react';
import { Heart, Globe, GraduationCap, Users, Lock, Mail, Phone, ArrowLeft } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';
import { toast } from 'sonner';
import alumniLogo from "@/assets/alumni-logo.jpg";

export function Donation() {
    const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
    const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
    const [customAmount, setCustomAmount] = useState('');

    const amounts = {
        'one-time': [500, 1000, 2000, 5000, 10000, 20000],
        'monthly': [200, 500, 1000, 2000, 5000, 10000]
    };

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAmount(e.target.value);
        setSelectedAmount(null);
    };

    const handleDonate = () => {
        const amount = selectedAmount || Number(customAmount);
        if (!amount || amount <= 0) {
            toast.error("Please select or enter a valid donation amount.");
            return;
        }

        toast.success("Thank You for Your Generosity!", {
            description: `Your donation of ₱${amount.toLocaleString()} will make a difference.`,
            duration: 5000,
        });
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Hero Section - Special for Donation Page */}
            <div className="relative h-[450px] md:h-[500px] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a5f3f]/90 to-[#1a5f3f]/40"></div>
                </div>

                <div className="absolute top-6 left-8 z-10 hidden md:block">
                    <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium p-2 rounded-lg hover:bg-white/10">
                        <ArrowLeft className="w-4 h-4" />
                        Back to site
                    </a>
                </div>

                <div className="relative max-w-6xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center text-white">
                    <div className="md:hidden mb-6">
                        <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium w-fit">
                            <ArrowLeft className="w-4 h-4" />
                            Back to site
                        </a>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <a href="/" className="flex items-center gap-3 ">
                            <img src={alumniLogo} alt="USJR Logo" className="w-12 h-12 rounded-full border-2 border-white/30" />
                            <span className="font-bold text-xl tracking-wide">USJR Alumni</span>
                        </a>
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
                        <div className="lg:col-span-7 space-y-12">
                            <div className="prose prose-lg text-gray-600">
                                <h2 className="text-3xl font-bold text-[#1a5f3f] mb-6">Why Donate?</h2>
                                <p className="mb-6">
                                    Every contribution creates a ripple effect. Whether it's funding a scholarship for a deserving student,
                                    supporting alumni networking events, or maintaining our beloved campus, your gift makes a tangible difference.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: GraduationCap, title: "Scholarships", desc: "Support tuition for talented students in need." },
                                    { icon: Users, title: "Alumni Network", desc: "Fund events that connect Josenians worldwide." },
                                    { icon: Globe, title: "Community Outreach", desc: "Extend our Adelante spirit to local communities." },
                                    { icon: Heart, title: "Student Welfare", desc: "Provide resources for student holistic development." }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-[#1a5f3f]/10 rounded-full flex items-center justify-center mb-4">
                                            <item.icon className="w-6 h-6 text-[#1a5f3f]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Donation Form */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8 border border-gray-100">
                                <div className="bg-[#1a5f3f] p-6 text-center">
                                    <h3 className="text-2xl font-bold text-white">Make a Gift</h3>
                                    <p className="text-white text-sm opacity-90">Secure donation via Credit Card or PayPal</p>
                                </div>

                                <div className="p-6 md:p-8">
                                    {/* Donation Type Toggle */}
                                    <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                                        <button
                                            onClick={() => setDonationType('one-time')}
                                            className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${donationType === 'one-time'
                                                ? 'bg-white text-[#1a5f3f] shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            One-time
                                        </button>
                                        <button
                                            onClick={() => setDonationType('monthly')}
                                            className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${donationType === 'monthly'
                                                ? 'bg-white text-[#1a5f3f] shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Monthly
                                        </button>
                                    </div>

                                    {/* Amount Grid */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {amounts[donationType].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => handleAmountSelect(amount)}
                                                className={`py-3 px-2 rounded-lg border-2 text-sm font-semibold transition-all ${selectedAmount === amount
                                                    ? 'border-[#d4af37] bg-[#d4af37]/5 text-[#1a5f3f]'
                                                    : 'border-gray-200 hover:border-[#1a5f3f]/30 text-gray-600'
                                                    }`}
                                            >
                                                ₱{amount.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Amount */}
                                    <div className="mb-8">
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
                                                className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1a5f3f] focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Donate Button */}
                                    <button
                                        onClick={handleDonate}
                                        className="w-full bg-[#d4af37] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#c19b2a] transition-all transform hover:scale-[1.01] shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                        Donate {selectedAmount ? `₱${selectedAmount.toLocaleString()}` : customAmount ? `₱${Number(customAmount).toLocaleString()}` : ''}
                                    </button>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <Lock className="w-3 h-3" />
                                        <span>Secure 256-bit SSL Encrypted Payment</span>
                                    </div>
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
                                <a href="/" className="flex items-center gap-2">
                                    <img src={alumniLogo} alt="Logo" className="w-8 h-8 rounded opacity-80" />
                                    <span className="font-semibold tracking-wide">USJR Alumni Association</span>
                                </a>
                            </div>
                            <p className="text-gray-400 text-sm text-center md:text-left">
                                © 2026 University of San Jose-Recoletos Alumni Association.<br />All rights reserved.
                            </p>
                        </div>

                        <div className="flex gap-6">
                            <a href="https://www.facebook.com/usjr.official" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1a5f3f] transition-colors">
                                <SiFacebook className="w-4 h-4 text-white" />
                            </a>
                            <a href="https://x.com/USJR_official" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1a5f3f] transition-colors">
                                <SiX className="w-4 h-4 text-white" />
                            </a>
                            <a href="https://www.instagram.com/usjr_official" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1a5f3f] transition-colors">
                                <SiInstagram className="w-4 h-4 text-white" />
                            </a>
                            <a href="https://www.linkedin.com/school/usjrofficial/" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1a5f3f] transition-colors">
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
