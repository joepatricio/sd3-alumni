// adminStats now generated dynamically via getAdminStats function below

export const adminRecentActivity = [
    { id: '1', action: 'Registered', user: 'Juan De Cruz', time: '2 hours ago', type: 'user' },
    { id: '2', action: 'Submitted Bulletin', user: 'Maria Santos', time: '4 hours ago', type: 'content' },
    { id: '3', action: 'Donated $500.00', user: 'Anonymous', time: '5 hours ago', type: 'donation' },
    { id: '4', action: 'Event Pending Review', user: 'Batch 2010', time: '1 day ago', type: 'event' },
    { id: '5', action: 'Registered', user: 'Jose Rizal', time: '1 day ago', type: 'user' },
];

// Helper to generate a large amount of mock data for pagination
const generateUsers = (count: number) => {
    const statuses = ['Pending', 'Official', 'Regular', 'Suspended', 'Banned'];
    const firstNames = ['Mark', 'Lisa', 'Maria', 'John', 'Pedro', 'Anna', 'Michael', 'Sarah', 'David', 'Jane', 'Kevin', 'Michelle', 'Chris', 'Amanda'];
    const lastNames = ['Spencer', 'Wong', 'Santos', 'Doe', 'Penduko', 'Cruz', 'Torres', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];

    return Array.from({ length: count }, (_, i) => {
        const id = (i + 1).toString();
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
        const batch = (2000 + (i % 25)).toString();
        const status = statuses[i % statuses.length];

        let grantedDateObj = new Date(2025, i % 12, (i % 28) + 1);
        const grantedDate = grantedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let reason = undefined;
        let expiryDate = undefined;
        let rawExpiryDate = undefined;

        if (status === 'Suspended') {
            reason = 'Violated community guidelines regarding spam.';
            grantedDateObj.setDate(grantedDateObj.getDate() + 365);
            const expiryDateObj = new Date(grantedDateObj);
            expiryDateObj.setDate(expiryDateObj.getDate() + 30);
            expiryDate = expiryDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            rawExpiryDate = expiryDateObj.getTime();
        } else if (status === 'Banned') {
            reason = 'Severe harassment of other alumni members.';
        }

        const rawGrantedDate = grantedDateObj.getTime();

        return { id, name, email, batch, status, grantedDate, rawGrantedDate, expiryDate, rawExpiryDate, reason };
    });
};

const generateContent = (count: number) => {
    const statuses = ['pending', 'approved', 'rejected'];
    const types = ['Event', 'Bulletin'];
    const authors = ['Anna Cruz', 'Michael Torres', 'Maria Santos', 'John Doe'];
    const titles = ['Reunion Pre-party', 'Looking for developers', 'Annual Meeting', 'Charity Run', 'Tech Talk', 'Startup Pitch', 'Mentoring Session', 'Job Fair'];

    return Array.from({ length: count }, (_, i) => {
        const id = (i + 1).toString();
        const type = types[i % types.length];
        const title = `${titles[i % titles.length]} ${i + 1}`;
        const description = `This is a randomly generated description for ${title} to showcase the content management features. More details available upon review.`;
        const author = authors[i % authors.length];
        const dateObj = new Date(2026, 1, 15 - (i % 30));
        const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const rawDate = dateObj.getTime();
        const status = statuses[i % statuses.length];

        return { id, type, title, description, author, date, rawDate, status };
    });
};

const generateDonations = (count: number) => {
    const statuses = ['Processing', 'Completed', 'Failed'];
    const donors = ['Anonymous', 'Juan De Cruz', 'Maria Santos', 'Mark Spencer', 'Lisa Wong', 'Company XYZ'];

    return Array.from({ length: count }, (_, i) => {
        const id = (i + 1).toString();
        // Generate a random date in previous months
        const dateObj = new Date(2026, 1, 15 - (i % 30));
        const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const donor = donors[i % donors.length];
        const amountNum = ((i % 20) + 1) * 50;
        const amount = `$${amountNum.toFixed(2)}`;
        const status = statuses[i % statuses.length];
        const rawAmount = amountNum;
        const rawDate = dateObj.getTime();

        return { id, date, donor, amount, status, rawAmount, rawDate };
    });
};

export const adminContentMock = generateContent(95);
export const adminDonationsMock = generateDonations(95);
export const adminUsersMock = generateUsers(95);

export const getAdminStats = () => {
    const totalAlumni = adminUsersMock.length;

    // Total donations
    const donationsYTD = adminDonationsMock
        .filter(d => d.status === 'Completed')
        .reduce((sum, d) => sum + d.rawAmount, 0);

    return [
        { title: 'Total Alumni', value: totalAlumni.toString(), iconName: 'Users', change: '+12% this month', positive: true },
        { title: 'Donations YTD', value: `$${donationsYTD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, iconName: 'CreditCard', change: '+5% vs last year', positive: true },
    ];
};

export const getDonationStats = () => {
    let totalRaised = 0;
    let pendingClearances = 0;
    let pendingCount = 0;
    const activeDonorsSet = new Set<string>();

    adminDonationsMock.forEach(d => {
        if (d.status === 'Completed') {
            totalRaised += d.rawAmount;
            activeDonorsSet.add(d.donor);
        } else if (d.status === 'Processing') {
            pendingClearances += d.rawAmount;
            pendingCount++;
            activeDonorsSet.add(d.donor);
        }
    });

    return {
        totalRaised: `$${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pendingClearances: `$${pendingClearances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pendingCount,
        activeDonors: activeDonorsSet.size
    };
};
