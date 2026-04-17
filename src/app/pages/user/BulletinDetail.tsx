import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    MessageCircle,
    User,
    Send,
    ThumbsUp,
    Edit,
} from 'lucide-react';
import { CreateBulletinModal } from '@components/user/CreateBulletinModal';
import { Button } from '@components/ui/button';
import { NotFound } from '@pages/NotFound';
import { bulletins, comments } from '@assets/mockData';
import { LazyImage } from '@components/user/LazyImage';
import { useAuth } from '@utils/auth';

export function BulletinDetail() {
    const { id } = useParams();
    const { isLoggedIn } = useAuth();
    const [comment, setComment] = useState('');
    const [localComments, setLocalComments] = useState(comments);
    const [likedComments, setLikedComments] = useState<string[]>([]);
    const isAdmin = !!localStorage.getItem('adminToken');

    const bulletin = bulletins.find((b) => b.id === id);

    if (!bulletin || bulletin.status === "Rejected") {
        // return <Navigate to="/404" replace />;
        return <NotFound />;
    }

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        const newDoc = {
            id: Date.now().toString(),
            bulletinId: bulletin.id,
            author: {
                name: "You",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=64&h=64"
            },
            content: comment,
            date: "Just now",
            likes: 0
        };
        setLocalComments([newDoc, ...localComments]);
        setComment('');
    };

    const handleToggleLike = (commentId: string) => {
        if (!isLoggedIn) return;
        setLikedComments(prev =>
            prev.includes(commentId)
                ? prev.filter(vid => vid !== commentId)
                : [...prev, commentId]
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {bulletin.status === "Pending" && (
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
                        initialData={bulletin}
                        isAdmin={isAdmin}
                    />
                )}
            </div>

            {/* Article */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Hero Image */}
                    {bulletin.heroImage && (
                        <div className="w-full h-96 overflow-hidden">
                            <LazyImage
                                src={bulletin.heroImage}
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
                                to="/profile"
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src={bulletin.author.image}
                                    alt={bulletin.author.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {bulletin.author.name}
                                    </p>
                                    <p className="text-sm text-gray-600">{bulletin.author.role}</p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-4 ml-auto text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(bulletin.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <span>•</span>
                                <span>{bulletin.readTime}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            {bulletin.content.split('\n\n').map((paragraph, index) => (
                                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-brand-primary" />
                        Comments ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    {isLoggedIn ? (
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                                        required
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
                                        >
                                            <Send className="w-4 h-4" />
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
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
                        {localComments.map((commentItem) => {
                            const isLiked = likedComments.includes(commentItem.id);
                            return (
                                <div key={commentItem.id} className="flex gap-3">
                                    <Link
                                        to="/profile"
                                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                    >
                                        <img
                                            src={commentItem.author.image}
                                            alt={commentItem.author.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </Link>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Link
                                                    to="/profile"
                                                    className="font-semibold text-gray-900 hover:text-brand-primary transition-colors"
                                                >
                                                    {commentItem.author.name}
                                                </Link>
                                                <span className="text-sm text-gray-500">
                                                    {commentItem.date}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{commentItem.content}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleLike(commentItem.id)}
                                            className={`flex items-center gap-1 mt-2 text-sm transition-colors ${isLiked ? 'text-brand-primary font-semibold' : 'text-gray-600 hover:text-brand-primary'
                                                } ${!isLoggedIn ? 'cursor-default opacity-80' : ''}`}
                                        >
                                            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-brand-primary' : ''}`} />
                                            <span>{commentItem.likes + (isLiked ? 1 : 0)}</span>
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
