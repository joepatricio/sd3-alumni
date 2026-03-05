import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { adminUsersMock } from '@assets/mockData';

export function AdminUsers() {
    const statuses = ['Pending', 'Official', 'Regular', 'Suspended', 'Banned'];

    const renderTable = (status: string) => {
        const users = adminUsersMock.filter(u => u.status === status);

        if (users.length === 0) {
            return (
                <div className="py-8 text-center border rounded-md border-dashed text-gray-500">
                    No users found for this category.
                </div>
            );
        }

        return (
            <div className="border rounded-md bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Batch</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.batch}</td>
                                <td className="px-6 py-4">
                                    <Badge className={
                                        user.status === 'Official' ? 'bg-blue-100 text-blue-800' :
                                            user.status === 'Regular' ? 'bg-green-100 text-green-800' :
                                                user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    user.status === 'Suspended' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-red-100 text-red-800'
                                    }>
                                        {user.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.status === 'Pending' ? (
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                            <Button size="sm" className="bg-[#1a5f3f] hover:bg-[#154d33]">Approve</Button>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
                <p className="text-gray-500">Review new registrations, manage roles, and monitor user statuses.</p>
            </div>

            <Tabs defaultValue="Pending" className="w-full">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="mb-4 inline-flex min-w-full sm:min-w-0">
                        <TabsTrigger value="Pending">Pending Registrations</TabsTrigger>
                        <TabsTrigger value="Official">Official Accounts</TabsTrigger>
                        <TabsTrigger value="Regular">Regular Users</TabsTrigger>
                        <TabsTrigger value="Suspended">Suspended Users</TabsTrigger>
                        <TabsTrigger value="Banned">Banned Users</TabsTrigger>
                    </TabsList>
                </div>

                {statuses.map(status => (
                    <TabsContent key={status} value={status}>
                        <Card className="border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{status} Users</CardTitle>
                                    <CardDescription>
                                        {status === 'Pending' ? 'Alumni awaiting account approval' : `Manage ${status.toLowerCase()} accounts`}
                                    </CardDescription>
                                </div>
                                <Button variant="outline">Export CSV</Button>
                            </CardHeader>
                            <CardContent>
                                {renderTable(status)}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
