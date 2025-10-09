import React, { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import { 
  // User, 
  // Mail, 
  // Phone, 
  MapPin, 
  Calendar, 
  // Settings, 
  // Shield, 
  // Bell, 
  Edit2, 
  Camera,
  Save,
  // X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Profile = () => {
  const { user, } = useAuth();
  const { uploadFile } = useFiles();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  // const [editForm, setEditForm] = useState({
  //   first_name: user?.first_name || '',
  //   last_name: user?.last_name || '',
  //   phone_number: user?.phone_number || '',
  //   city: user?.city || '',
  //   state: user?.state || '',
  //   country: user?.country || ''
  // });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      await uploadFile(file, 'avatar');
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveEdit = () => {
    // Here you would typically make an API call to update user info
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  // const handleCancelEdit = () => {
  //   setEditForm({
  //     first_name: user?.first_name || '',
  //     last_name: user?.last_name || '',
  //     phone_number: user?.phone_number || '',
  //     city: user?.city || '',
  //     state: user?.state || '',
  //     country: user?.country || ''
  //   });
  //   setIsEditing(false);
  // };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                <AvatarImage src="/abstract-profile.png" alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-green-500 to-blue-600 text-white">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg">
                <Camera size={16} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
              
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  {user.city && user.country ? `${user.city}, ${user.country}` : user.country || 'Location not set'}
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Calendar size={16} />
                  Joined {new Date(user.dob).toLocaleDateString()}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                {user.is_email_verified && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    Email Verified
                  </span>
                )}
                {user.is_phone_number_verified && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    Phone Verified
                  </span>
                )}
                {user.account_type && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium capitalize">
                    {user.account_type}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </Button>
                  {/* <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button> */}
                </div>
              )}
            </div>
          </div>
        </div>

        
  
      </div>
    </div>
  );
};

export default Profile;
