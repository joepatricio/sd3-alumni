import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, CheckCircle2, XCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DegreeProgramItem {
    name: string;
    fullName?: string;
    value: number;
}

export interface DemographicItem {
    name: string;
    value: number;
}

export interface ProfileStatusItem {
    name: string;
    value: number;
}

export interface GuestListItem {
    isAttending?: boolean;
    user?: {
        id?: string;
        profile?: {
            birthday?: string | null;
            degree?: { degreeAbbr?: string; degreeName?: string } | null;
        } | null;
        profileStatus?: { statusName?: string } | null;
        userStatus?: { statusName?: string } | null;
    } | null;
    [key: string]: unknown;
}

export interface AnalyticsProps {
    // Direct pre-aggregated chart data (used by Admin Dashboard)
    degreeProgramData?: DegreeProgramItem[];
    demographicsData?: DemographicItem[];
    profileStatusData?: ProfileStatusItem[];

    // Raw guest list / RSVP responses (used by EventDetail for RSVP analytics)
    guestList?: GuestListItem[];

    title?: string;
    description?: string;
    showManageLink?: boolean;
    className?: string;
    headerExtra?: React.ReactNode;
}

export const DEGREE_PROGRAM_COLORS: Record<string, string> = {
    'BSCpE': '#2563eb',
    'BSME': '#dc2626',
    'BSCE': '#059669',
    'BSIE': '#7c3aed',
    'BSEE': '#d97706',
    'BSECE': '#0891b2',
    'Other': '#64748b'
};

export const DEMOGRAPHIC_COLORS: Record<string, string> = {
    'Baby Boomers (Pre-1964)': '#b45309',
    'Gen X (1965-1980)': '#0369a1',
    'Millennials (1981-1996)': '#7c3aed',
    'Gen Z (1997 Beyond)': '#059669'
};

export const CHART_PALETTE = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#ec4899', '#06b6d4', '#8b5cf6'];

export const getDegreeColor = (name: string, fullName?: string, index: number = 0): string => {
    return DEGREE_PROGRAM_COLORS[name] || (fullName ? DEGREE_PROGRAM_COLORS[fullName] : undefined) || CHART_PALETTE[index % CHART_PALETTE.length];
};

export function Analytics({
    degreeProgramData: propDegreeData,
    demographicsData: propDemographicsData,
    profileStatusData: propProfileStatusData,
    guestList,
    title = 'Degree Program, Demographics & Profile Status Analytics',
    description = 'Visual distribution of active alumni degree programs, generational cohort proportions, and profile privacy preferences.',
    showManageLink = false,
    className = '',
    headerExtra
}: AnalyticsProps) {
    const [activeDegreeProgram, setActiveDegreeProgram] = useState<string | null>(null);
    const [activeDemographic, setActiveDemographic] = useState<string | null>(null);
    const [activeProfileStatus, setActiveProfileStatus] = useState<string | null>(null);
    const [rsvpFilter, setRsvpFilter] = useState<'all' | 'going' | 'not_going'>('all');

    // Counts for RSVP responses if guestList is supplied
    const rsvpStats = useMemo(() => {
        if (!guestList) return null;
        const total = guestList.length;
        const going = guestList.filter(g => Boolean(g.isAttending)).length;
        const notGoing = guestList.filter(g => !g.isAttending).length;
        const goingPct = total > 0 ? Math.round((going / total) * 100) : 0;
        return { total, going, notGoing, goingPct };
    }, [guestList]);

    // Filter guest list based on selected RSVP filter
    const filteredGuestItems = useMemo(() => {
        if (!guestList) return [];
        if (rsvpFilter === 'going') return guestList.filter(g => Boolean(g.isAttending));
        if (rsvpFilter === 'not_going') return guestList.filter(g => !g.isAttending);
        return guestList;
    }, [guestList, rsvpFilter]);

    // Compute chart data if guestList is supplied, or use pre-aggregated props
    const { degreeProgramChartData, totalDegreeUsers } = useMemo(() => {
        if (guestList) {
            const degMap: Record<string, { fullName: string; count: number }> = {};
            filteredGuestItems.forEach(item => {
                const deg = item.user?.profile?.degree;
                if (deg) {
                    const abbr = deg.degreeAbbr || deg.degreeName || 'Other';
                    const fullName = deg.degreeName || abbr;
                    if (!degMap[abbr]) {
                        degMap[abbr] = { fullName, count: 0 };
                    }
                    degMap[abbr].count++;
                }
            });
            const list = Object.entries(degMap)
                .map(([name, d]) => ({ name, fullName: d.fullName, value: d.count }))
                .filter(d => d.value > 0);
            const total = list.reduce((acc, c) => acc + c.value, 0);
            return { degreeProgramChartData: list, totalDegreeUsers: total };
        }

        const valid = (propDegreeData || []).filter(d => d.value > 0);
        const total = valid.reduce((acc, c) => acc + c.value, 0);
        return { degreeProgramChartData: valid, totalDegreeUsers: total };
    }, [guestList, filteredGuestItems, propDegreeData]);

    const { demographicsChartData, totalDemographics } = useMemo(() => {
        if (guestList) {
            let babyBoomers = 0;
            let genX = 0;
            let millennials = 0;
            let genZ = 0;

            filteredGuestItems.forEach(item => {
                const bday = item.user?.profile?.birthday;
                if (bday) {
                    const d = new Date(bday);
                    if (!isNaN(d.getTime())) {
                        const yr = d.getFullYear();
                        if (yr <= 1964) babyBoomers++;
                        else if (yr >= 1965 && yr <= 1980) genX++;
                        else if (yr >= 1981 && yr <= 1996) millennials++;
                        else if (yr >= 1997) genZ++;
                    }
                }
            });

            const list = [
                { name: 'Baby Boomers (Pre-1964)', value: babyBoomers },
                { name: 'Gen X (1965-1980)', value: genX },
                { name: 'Millennials (1981-1996)', value: millennials },
                { name: 'Gen Z (1997 Beyond)', value: genZ },
            ].filter(d => d.value > 0);
            const total = list.reduce((acc, c) => acc + c.value, 0);
            return { demographicsChartData: list, totalDemographics: total };
        }

        const valid = (propDemographicsData || []).filter(d => d.value > 0);
        const total = valid.reduce((acc, c) => acc + c.value, 0);
        return { demographicsChartData: valid, totalDemographics: total };
    }, [guestList, filteredGuestItems, propDemographicsData]);

    const { profileStatusChartData, totalProfileStatus } = useMemo(() => {
        if (guestList) {
            let pub = 0;
            let conn = 0;
            let priv = 0;

            filteredGuestItems.forEach(item => {
                const statusName = item.user?.profileStatus?.statusName;
                if (statusName === 'Public') pub++;
                else if (statusName === 'Connections Only') conn++;
                else if (statusName === 'Private') priv++;
            });

            const list = [
                { name: 'Public', value: pub },
                { name: 'Connections Only', value: conn },
                { name: 'Private', value: priv },
            ].filter(d => d.value > 0);
            const total = list.reduce((acc, c) => acc + c.value, 0);
            return { profileStatusChartData: list, totalProfileStatus: total };
        }

        const valid = (propProfileStatusData || []).filter(d => d.value > 0);
        const total = valid.reduce((acc, c) => acc + c.value, 0);
        return { profileStatusChartData: valid, totalProfileStatus: total };
    }, [guestList, filteredGuestItems, propProfileStatusData]);

    return (
        <div className={`bg-white rounded-xl border border-gray-200 w-full shadow-md flex flex-col justify-between ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-6 pb-4 border-b border-gray-100 gap-4">
                <div className="space-y-1">
                    <h4 className="font-semibold leading-none tracking-tight flex items-center gap-2 text-gray-900 text-lg">
                        <PieChartIcon className="w-5 h-5 text-brand-primary shrink-0" />
                        {title}
                    </h4>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                {headerExtra && (
                    <div className="flex items-center gap-2 shrink-0">
                        {headerExtra}
                    </div>
                )}
            </div>

            {/* RSVP Response Filter & Summary Bar (when guestList is provided) */}
            {rsvpStats && (
                <div className="px-6 py-3.5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Responses:</span>
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setRsvpFilter('all')}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${rsvpFilter === 'all'
                                    ? 'bg-brand-primary text-white shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                All ({rsvpStats.total})
                            </button>
                            <button
                                type="button"
                                onClick={() => setRsvpFilter('going')}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${rsvpFilter === 'going'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/50'
                                    }`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Going ({rsvpStats.going})
                            </button>
                            <button
                                type="button"
                                onClick={() => setRsvpFilter('not_going')}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${rsvpFilter === 'not_going'
                                    ? 'bg-gray-700 text-white shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Not Going ({rsvpStats.notGoing})
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {rsvpStats.goingPct}% Attending
                        </span>
                        <span className="text-gray-400">&bull;</span>
                        <span>{filteredGuestItems.length} respondent{filteredGuestItems.length === 1 ? '' : 's'} displayed</span>
                    </div>
                </div>
            )}

            {/* Charts Body */}
            <div className="px-6 pb-6 pt-4 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {/* Degree Program Pie Chart */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Degree Program ({totalDegreeUsers})
                            </h4>
                        </div>
                        {degreeProgramChartData.length > 0 ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="h-56 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={degreeProgramChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={48}
                                                outerRadius={80}
                                                startAngle={90}
                                                endAngle={-270}
                                                paddingAngle={4}
                                                dataKey="value"
                                                nameKey="name"
                                                isAnimationActive={false}
                                                onClick={(entry) => setActiveDegreeProgram(prev => prev === entry.name ? null : entry.name || null)}
                                            >
                                                {degreeProgramChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`deg-cell-${index}`}
                                                        fill={getDegreeColor(entry.name, entry.fullName, index)}
                                                        opacity={activeDegreeProgram && activeDegreeProgram !== entry.name ? 0.3 : 1}
                                                        stroke="#ffffff"
                                                        strokeWidth={2}
                                                        className="cursor-pointer transition-all duration-300"
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                formatter={(val: unknown, name: unknown, item: { payload?: { fullName?: string; name?: string } }) => [
                                                    `${val} alumni`,
                                                    item?.payload?.fullName ? `${item.payload.fullName} (${item.payload.name})` : String(name)
                                                ]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
                                    {degreeProgramChartData.map((entry, index) => (
                                        <button
                                            key={`deg-leg-${entry.name}`}
                                            title={entry.fullName ? `${entry.fullName} (${entry.name})` : entry.name}
                                            onClick={() => setActiveDegreeProgram(prev => prev === entry.name ? null : entry.name)}
                                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                            ${activeDegreeProgram === entry.name ? 'bg-brand-primary text-white border-brand-primary shadow-2xs scale-105' :
                                                    activeDegreeProgram && activeDegreeProgram !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                        'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getDegreeColor(entry.name, entry.fullName, index) }} />
                                            <span>{entry.name}</span>
                                            <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                        </button>
                                    ))}
                                </div>
                                {showManageLink && activeDegreeProgram && (
                                    <div className="mt-2 text-center">
                                        <Link
                                            to="/admin/users"
                                            className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary hover:underline"
                                        >
                                            <span>Manage {activeDegreeProgram} alumni in Users &rarr;</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-56 text-gray-400 text-xs text-center px-4">
                                No degree program records logged.
                            </div>
                        )}
                    </div>

                    {/* Generational Demographics Pie Chart */}
                    <div className="flex flex-col items-center pt-4 md:pt-0 md:pl-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Generational Demographics ({totalDemographics})
                            </h4>
                        </div>
                        {demographicsChartData.length > 0 ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="h-56 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographicsChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={48}
                                                outerRadius={80}
                                                startAngle={90}
                                                endAngle={-270}
                                                paddingAngle={4}
                                                dataKey="value"
                                                nameKey="name"
                                                isAnimationActive={false}
                                                onClick={(entry) => setActiveDemographic(prev => prev === entry.name ? null : entry.name || null)}
                                            >
                                                {demographicsChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`demo-cell-${index}`}
                                                        fill={DEMOGRAPHIC_COLORS[entry.name] || CHART_PALETTE[(index + 2) % CHART_PALETTE.length]}
                                                        opacity={activeDemographic && activeDemographic !== entry.name ? 0.3 : 1}
                                                        stroke="#ffffff"
                                                        strokeWidth={2}
                                                        className="cursor-pointer transition-all duration-300"
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(val: unknown) => [`${val} alumni`, 'Count']}
                                                contentStyle={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
                                    {demographicsChartData.map((entry, index) => {
                                        const match = entry.name.match(/^(.*?)\s*(\(.*?\))$/);
                                        const mainLabel = match ? match[1] : entry.name;

                                        return (
                                            <button
                                                key={`demo-leg-${entry.name}`}
                                                title={entry.name}
                                                onClick={() => setActiveDemographic(prev => prev === entry.name ? null : entry.name)}
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                                ${activeDemographic === entry.name ? 'bg-brand-primary text-white border-brand-primary shadow-2xs scale-105' :
                                                        activeDemographic && activeDemographic !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                            'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DEMOGRAPHIC_COLORS[entry.name] || CHART_PALETTE[(index + 2) % CHART_PALETTE.length] }} />
                                                <span>
                                                    {mainLabel}
                                                </span>
                                                <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-56 text-gray-400 text-xs text-center px-4">
                                No demographic records logged.
                            </div>
                        )}
                    </div>

                    {/* Profile Status Pie Chart */}
                    <div className="flex flex-col items-center pt-4 md:pt-0 md:pl-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Profile Privacy ({totalProfileStatus})
                            </h4>
                        </div>
                        {profileStatusChartData.length > 0 ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="h-56 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={profileStatusChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={48}
                                                outerRadius={80}
                                                startAngle={90}
                                                endAngle={-270}
                                                paddingAngle={4}
                                                dataKey="value"
                                                nameKey="name"
                                                isAnimationActive={false}
                                                onClick={(entry) => setActiveProfileStatus(prev => prev === entry.name ? null : entry.name || null)}
                                            >
                                                {profileStatusChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`ps-cell-${index}`}
                                                        fill={CHART_PALETTE[(index + 4) % CHART_PALETTE.length]}
                                                        opacity={activeProfileStatus && activeProfileStatus !== entry.name ? 0.3 : 1}
                                                        stroke="#ffffff"
                                                        strokeWidth={2}
                                                        className="cursor-pointer transition-all duration-300"
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(val: unknown) => [`${val} profiles`, 'Count']}
                                                contentStyle={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
                                    {profileStatusChartData.map((entry, index) => (
                                        <button
                                            key={`ps-leg-${entry.name}`}
                                            onClick={() => setActiveProfileStatus(prev => prev === entry.name ? null : entry.name)}
                                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                            ${activeProfileStatus === entry.name ? 'bg-brand-primary text-white border-brand-primary shadow-2xs scale-105' :
                                                    activeProfileStatus && activeProfileStatus !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                        'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_PALETTE[(index + 4) % CHART_PALETTE.length] }} />
                                            <span>{entry.name}</span>
                                            <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-56 text-gray-400 text-xs text-center px-4">
                                No profile status records logged.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

