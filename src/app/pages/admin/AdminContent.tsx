import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { adminContentMock } from '@assets/mockData';

export function AdminContent() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Content Approval</h1>
                <p className="text-gray-500">Review, approve, or reject user-submitted bulletins and events.</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                {[
                    { id: 'pending', title: 'Needs Attention', description: 'Content awaiting moderator approval before publishing' },
                    { id: 'approved', title: 'Published Content', description: 'Previously approved and currently visible to the public' },
                    { id: 'rejected', title: 'Rejected Content', description: 'Submissions that did not meet community guidelines' }
                ].map((tabConfig) => {
                    const items = adminContentMock.filter(c => c.status === tabConfig.id);

                    return (
                        <TabsContent key={tabConfig.id} value={tabConfig.id} className="space-y-4">
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>{tabConfig.title}</CardTitle>
                                    <CardDescription>{tabConfig.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {items.length === 0 ? (
                                        <p className="text-sm text-gray-500 py-8 text-center border rounded-md border-dashed">
                                            {tabConfig.id === 'pending' ? 'No pending content requires attention.' :
                                                tabConfig.id === 'approved' ? 'Approved items will appear here.' :
                                                    'Rejected items will appear here.'}
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((content) => (
                                                <div key={content.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-white gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className={content.type === 'Event' ? "text-amber-600 border-amber-200 bg-amber-50" : "text-blue-600 border-blue-200 bg-blue-50"}>
                                                                {content.type}
                                                            </Badge>
                                                            <h3 className="font-semibold text-lg">{content.title}</h3>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                            {content.description}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Submitted by <strong>{content.author}</strong> • {content.timeAgo}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <Button size="sm" variant="outline" className="text-gray-600 hover:text-gray-900">View Details</Button>
                                                        {content.status === 'pending' && (
                                                            <>
                                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                                                <Button size="sm" className="bg-[#1a5f3f] hover:bg-[#154d33]">Approve</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
