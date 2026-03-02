import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Download } from 'lucide-react';
import { adminDonationsMock } from '../../../assets/mockData';

export function AdminDonations() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Donations Tracking</h1>
                <p className="text-gray-500">View recent contributions, generate financial reports, and manage campaigns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Raised (YTD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">$12,500.00</div>
                        <p className="text-xs text-green-700 mt-1">+5% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Clearances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">$1,850.00</div>
                        <p className="text-xs text-gray-500 mt-1">3 transactions processing</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Donors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">142</div>
                        <p className="text-xs text-gray-500 mt-1">This year</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest monetary contributions from alumni</CardDescription>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download size={16} /> Export Report
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Donor</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* FIXME: Adjust empty state design to be consistent with non-empty state */}
                                {adminDonationsMock.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No recent transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    adminDonationsMock.map((donation) => (
                                        <tr key={donation.id} className="border-t">
                                            <td className="px-6 py-4">{donation.date}</td>
                                            <td className="px-6 py-4 font-medium">{donation.donor}</td>
                                            <td className="px-6 py-4">{donation.amount}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    donation.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        donation.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                }>
                                                    {donation.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" disabled={donation.status === 'Processing'}>
                                                    {donation.status === 'Completed' ? 'View' : 'Wait'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
