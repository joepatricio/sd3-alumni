import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    MessageCircle,
    User,
    Send,
    ThumbsUp,
} from 'lucide-react';

export function BulletinDetail() {
    const { id } = useParams();
    const [comment, setComment] = useState('');

    // Mock data - in production, fetch based on id
    const bulletin = {
        id: id || '1',
        title: 'USJR Alumni Association Announces New Scholarship Program',
        author: {
            name: 'Maria Santos',
            image:
                'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            role: 'Alumni Relations Director',
        },
        date: 'February 8, 2026',
        readTime: '5 min read',
        content: `We are thrilled to announce the launch of our new scholarship program aimed at supporting deserving students from underserved communities. This initiative reflects our commitment to giving back and ensuring that quality education remains accessible to all.

The scholarship will cover full tuition for qualified applicants and includes a mentorship component where recipients will be paired with successful alumni in their field of interest. This mentorship aspect is designed to provide not just financial support, but also guidance and networking opportunities that can help shape successful careers.

Our goal is to support 50 students in the first year, with plans to expand the program based on available funding and alumni contributions. We believe that investing in education is one of the most impactful ways we can contribute to society and honor the legacy of USJR.

Applications will open on March 1, 2026, and will be evaluated based on academic merit, financial need, and demonstrated commitment to community service. We encourage all eligible students to apply and take advantage of this opportunity.

We are grateful to the many alumni who have already pledged their support for this program. If you're interested in contributing or learning more about how you can help, please visit our donations page or contact the Alumni Relations Office directly.`,
        heroImage:
            'https://images.unsplash.com/photo-1725738704638-361eac814fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjYW1wdXMlMjBsaWZlfGVufDF8fHx8MTc3MDcwNTY0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    };

    const comments = [
        {
            id: 1,
            author: {
                name: 'John Reyes',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 8, 2026, 3:45 PM',
            content:
                'This is wonderful news! So proud to be part of an alumni community that gives back. Count me in as a contributor!',
            likes: 12,
        },
        {
            id: 2,
            author: {
                name: 'Anna Cruz',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 8, 2026, 5:20 PM',
            content:
                'Love the mentorship component! I\'d be happy to volunteer as a mentor. How do I sign up?',
            likes: 8,
        },
        {
            id: 3,
            author: {
                name: 'Robert Tan',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 9, 2026, 9:10 AM',
            content:
                'Excellent initiative! Will there be any information sessions for prospective applicants?',
            likes: 5,
        },
    ];

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Comment submitted:', comment);
        setComment('');
        // In production, submit to backend
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
                    <Link
                        to="/bulletin"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a5f3f] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Bulletin</span>
                    </Link>
                </div>
            </div>

            {/* Article */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Hero Image */}
                    {bulletin.heroImage && (
                        <div className="w-full h-96 overflow-hidden">
                            <img
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
                                    <span>{bulletin.date}</span>
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
                        <MessageCircle className="w-6 h-6 text-[#1a5f3f]" />
                        Comments ({comments.length})
                    </h2>

                    {/* Comment Form */}
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] resize-none"
                                    required
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-[#1a5f3f] text-white px-6 py-2 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                                    >
                                        <Send className="w-4 h-4" />
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.map((commentItem) => (
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
                                                className="font-semibold text-gray-900 hover:text-[#1a5f3f] transition-colors"
                                            >
                                                {commentItem.author.name}
                                            </Link>
                                            <span className="text-sm text-gray-500">
                                                {commentItem.date}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{commentItem.content}</p>
                                    </div>
                                    <button className="flex items-center gap-1 mt-2 text-sm text-gray-600 hover:text-[#1a5f3f] transition-colors">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{commentItem.likes}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
