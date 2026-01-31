import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import api from '@/api/axios';
import { 
  MapPin, 
  Calendar, 
  Edit3, 
  Camera,
  Check,
  X,
  Mail,
  Phone,
  User,
  Globe,
  Shield,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface EditableFieldProps {
  label: string;
  value: string;
  field: string;
  icon: React.ReactNode;
  onSave: (field: string, value: string) => Promise<void>;
  type?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, field, icon, onSave, type = "text" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(field, editValue);
      setIsEditing(false);
    } catch {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {value || <span className="text-gray-400 italic">Not set</span>}
            </p>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all"
          >
            <Edit3 className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, loadCurrentUser } = useAuth();
  const { uploadFile } = useFiles();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleFieldSave = async (field: string, value: string) => {
    try {
      await api.patch(`/accounts/${user?.id}/`, { [field]: value });
      await loadCurrentUser();
      toast.success(`${field.replace('_', ' ')} updated successfully!`);
    } catch {
      toast.error(`Failed to update ${field.replace('_', ' ')}`);
      throw new Error('Update failed');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      await uploadFile(file, 'avatar');
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Hero */}
        <div className="relative mb-6">
          <div className="h-32 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl" />
          <div className="absolute -bottom-12 left-6 flex items-end gap-4">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-white dark:border-gray-900 shadow-xl">
                <AvatarImage src="/abstract-profile.png" alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-1 right-1 w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-gray-100 dark:border-gray-700">
                {isUploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>
          </div>
        </div>

        {/* User Info Header */}
        <div className="mt-16 mb-6 px-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {user.first_name} {user.last_name}
                {user.is_email_verified && (
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.email}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user.is_email_verified && (
                <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Email Verified
                </span>
              )}
              {user.account_type && (
                <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center gap-1 capitalize">
                  <Sparkles className="w-3 h-3" /> {user.account_type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editable Fields Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-green-500" />
              Personal Information
            </h2>
            <div className="space-y-3">
              <EditableField
                label="First Name"
                value={user.first_name}
                field="first_name"
                icon={<User className="w-5 h-5" />}
                onSave={handleFieldSave}
              />
              <EditableField
                label="Last Name"
                value={user.last_name}
                field="last_name"
                icon={<User className="w-5 h-5" />}
                onSave={handleFieldSave}
              />
              <EditableField
                label="Phone Number"
                value={user.phone_number}
                field="phone_number"
                icon={<Phone className="w-5 h-5" />}
                onSave={handleFieldSave}
                type="tel"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Location
            </h2>
            <div className="space-y-3">
              <EditableField
                label="City"
                value={user.city || ''}
                field="city"
                icon={<MapPin className="w-5 h-5" />}
                onSave={handleFieldSave}
              />
              <EditableField
                label="State"
                value={user.state || ''}
                field="state"
                icon={<MapPin className="w-5 h-5" />}
                onSave={handleFieldSave}
              />
              <EditableField
                label="Country"
                value={user.country}
                field="country"
                icon={<Globe className="w-5 h-5" />}
                onSave={handleFieldSave}
              />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            Account Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user.gender || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
