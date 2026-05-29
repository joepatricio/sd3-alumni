import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    MessageCircle,
    User,
    Send,
    ThumbsUp,
    Edit,
    Loader2
} from 'lucide-react';
import { CreateBulletinModal } from '@components/user/CreateBulletinModal';
import { Button } from '@components/ui/button';
import { NotFound } from '@pages/NotFound';
import { LazyImage } from '@components/user/LazyImage';
import { useAuth } from '@/app/views/auth';
import { api, useSystemLookup, type BulletinData, type BulletinCommentData } from '@/app/views/api';

export function BulletinDetail() {
    const { id } = useParams();
    const { isLoggedIn, session } = useAuth();
    const { lookup, reverseLookup } = useSystemLookup();
    const [comment, setComment] = useState('');
    const [likedComments, setLikedComments] = useState<string[]>([]);
    const isAdmin = !!localStorage.getItem('adminToken');

    const [bulletin, setBulletin] = useState<BulletinData | null>(null);
    const [commentsList, setCommentsList] = useState<BulletinCommentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);

    useEffect(() => {
        const fetchBulletinAndProfiles = async () => {
            try {
                const [bRes, cRes, usersRes] = await Promise.all([
                    api.get(`/bulletins`, { params: { id: id, } }),
                    api.get(`/comments`, { params: { bulletinId: id, } }),
                    api.get('/users')
                ]);

                const bulletinData = bRes.data[0];
                const commentsData = cRes.data;
                const allUsers = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);

                if (bulletinData && bulletinData.profile) {
                    const authorUser = allUsers.find((u: any) => String(u.id) === String(bulletinData.profile.userId));
                    if (authorUser && authorUser.userStatusId === lookup('Banned') || authorUser?.userStatusId === reverseLookup('Banned')) {
                        setBulletin(null);
                        setLoading(false);
                        return;
                    }
                }

                if (session?.userId) {
                    const currentU = allUsers.find((u: any) => String(u.userId) === String(session.userId));
                    if (currentU && currentU.userStatusId === reverseLookup('Suspended')) {
                        setIsSuspended(true);
                    }
                }

                setBulletin(bulletinData || null);
                setCommentsList(commentsData || []);
            } catch (err) {
                console.error("Failed to fetch bulletin details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBulletinAndProfiles();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading bulletin details...</p>
            </div>
        );
    }

    const currentStatusName = bulletin ? lookup(bulletin.contentStatusId) : null;

    if (!bulletin || currentStatusName === "Rejected") {
        return <NotFound />;
    }

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !session?.userId || !bulletin) return;
        setSubmitting(true);
        try {
            const res = await api.post('/comments', {
                profileId: session.userId.toString(),
                bulletinId: bulletin.id,
                commentDate: new Date().toISOString(),
                comment,
                likes: 0
            });

            // Re-fetch the newly created comment with embedded profile
            const newCommentRes = await api.get('/comments', { params: { id: res.data.id, } });
            if (newCommentRes.data && newCommentRes.data.length > 0) {
                setCommentsList(prev => [newCommentRes.data[0], ...prev]);
            } else {
                setCommentsList(prev => [res.data, ...prev]);
            }

            setComment('');
        } catch (err) {
            console.error("Failed to post comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleLike = async (commentItem: BulletinCommentData) => {
        if (!isLoggedIn) return;
        const isLiked = likedComments.includes(commentItem.id);
        const newLikes = isLiked ? Math.max(0, commentItem.likes - 1) : commentItem.likes + 1;

        try {
            await api.patch(`/comments/${commentItem.id}`, { likes: newLikes });

            setLikedComments(prev =>
                isLiked
                    ? prev.filter(vid => vid !== commentItem.id)
                    : [...prev, commentItem.id]
            );

            setCommentsList(prev =>
                prev.map(c => c.id === commentItem.id ? { ...c, likes: newLikes } : c)
            );
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const authorProfile = bulletin.profile;
    const sortedComments = [...commentsList].sort((a, b) => new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime());

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {currentStatusName === "Pending" && (
                <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200 text-center">
                    <p className="text-yellow-800 font-medium text-sm">
                        ⚠️ This bulletin is currently under review by an administrator and is not visible to the public.
                    </p>
                </div>
            )}
            {/* Back Button and Edit Button */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 flex justify-between items-center">
                <Link
                    to="/bulletin"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className='font-medium'>Back to Bulletin</span>
                </Link>

                {isLoggedIn && (
                    <CreateBulletinModal
                        trigger={
                            <Button variant="outline" className="gap-2 text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
                                <Edit className="w-4 h-4" />
                                Edit Bulletin
                            </Button>
                        }
                        initialData={bulletin as any}
                        isAdmin={isAdmin}
                    />
                )}
            </div>

            {/* Article */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Hero Image */}
                    {bulletin.bulletinImage && (
                        <div className="w-full h-96 overflow-hidden">
                            <LazyImage
                                src={bulletin.bulletinImage}
                                alt={bulletin.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8 md:p-12">
                        {/* Title */}
                        <h1 className="text-4xl font-bold mb-6">{bulletin.title}</h1>

                        {/* Author Info */}
                        <div className="flex items-center gap-4 pb-6 mb-8 border-b border-gray-200">
                            <Link
                                to={`/profile/${bulletin.profileId}`}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src={authorProfile?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=64&h=64"}
                                    alt={authorProfile?.userName || "Author"}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900 hover:text-brand-primary transition-colors">
                                        {authorProfile?.userName || "Unknown Author"}
                                    </p>
                                    <p className="text-sm text-gray-600">{authorProfile?.currentJob ? `${authorProfile.currentJob} at ${authorProfile.company}` : "Alumni"}</p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-4 ml-auto text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(bulletin.bulletinDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <span>•</span>
                                <span>{bulletin.readTimeMinutes} min read</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg max-w-none text-gray-700">
                            {bulletin.content.split('\n\n').map((paragraph, index) => (
                                <p key={index} className="mb-4 leading-relaxed">
                                    {paragraph.trim()}
                                </p>
                            ))}
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-brand-primary" />
                        Comments ({sortedComments.length})
                    </h2>

                    {/* Comment Form */}
                    {isLoggedIn && !isSuspended ? (
                        <form onSubmit={handleSubmitComment} className="mb-8">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={3}
                                        disabled={submitting}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none disabled:opacity-50"
                                        required
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : isSuspended ? (
                        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-100 mb-8">
                            <MessageCircle className="w-10 h-10 text-brand-primary/50 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Commenting Restricted</h3>
                            <p className="text-gray-500 text-sm mb-4">Your account has been suspended. You cannot add comments at this time.</p>
                        </div>
                    ) : (
                        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-100 mb-8">
                            <MessageCircle className="w-10 h-10 text-brand-primary/50 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Join the Discussion</h3>
                            <p className="text-gray-500 text-sm mb-4">Log in to share your thoughts, ask questions, and interact with other alumni.</p>
                            <Link to="/login" state={{ from: `/bulletin/${bulletin.id}` }} className="inline-block">
                                <Button className="bg-brand-primary hover:bg-brand-primary-hover">
                                    Log In to Comment
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-6">
                        {sortedComments.map((commentItem) => {
                            const isLiked = likedComments.includes(commentItem.id);
                            const commenterProfile = commentItem.profile;
                            return (
                                <div key={commentItem.id} className="flex gap-3">
                                    <Link
                                        to={`/profile/${commentItem.profileId}`}
                                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                    >
                                        <img
                                            src={commenterProfile?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=64&h=64"}
                                            alt={commenterProfile?.userName || "User"}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </Link>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Link
                                                    to={`/profile/${commentItem.profileId}`}
                                                    className="font-semibold text-gray-900 hover:text-brand-primary transition-colors"
                                                >
                                                    {commenterProfile?.userName || "Unknown User"}
                                                </Link>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(commentItem.commentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{commentItem.comment}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleLike(commentItem)}
                                            className={`flex items-center gap-1 mt-2 text-sm transition-colors ${isLiked ? 'text-brand-primary font-semibold' : 'text-gray-600 hover:text-brand-primary'
                                                } ${!isLoggedIn ? 'cursor-default opacity-80' : ''}`}
                                        >
                                            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-brand-primary' : ''}`} />
                                            <span>{commentItem.likes}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
