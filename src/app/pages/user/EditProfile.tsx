import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';
import { EditProfileForm } from '@components/user/EditProfileForm';

export function EditProfile() {
    const navigate = useNavigate();
    const { session } = useAuth();

    if (!session?.userId) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
                <EditProfileForm
                    userId={session.userId}
                    onSuccess={() => navigate('/profile')}
                    onCancel={() => navigate('/profile')}
                />
            </div>
        </div>
    );
}
