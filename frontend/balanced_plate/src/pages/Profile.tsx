import React, { useState, useEffect } from 'react';
import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import { useHealthReport, buildTextSummary } from '@/hooks/useHealthReport';
import api from '@/api/axios';
import type { PaginatedResponse, WeeklyRecommendation } from '@/api/types';
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
  Sparkles,
  Leaf,
  Target,
  Utensils,
  HeartPulse,
  ChevronDown,
  Loader2,
  FileText,
  Download,
  Eye,
  History
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

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

// ─── Dropdown Select Field ───────────────────────────────────────────────────

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  field: string;
  icon: React.ReactNode;
  options: SelectOption[];
  onSave: (field: string, value: string) => Promise<void>;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, field, icon, options, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (newValue === value) return;
    setIsSaving(true);
    try {
      await onSave(field, newValue);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <div className="relative">
            <select
              value={value || ''}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 pr-9 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-60"
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>
      {isSaving && (
        <div className="absolute inset-0 rounded-xl bg-emerald-500/5 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

// ─── Chip Multi-Select ───────────────────────────────────────────────────────

interface ChipOption {
  label: string;
  value: string;
}

interface ChipSelectorProps {
  label: string;
  icon: React.ReactNode;
  options: ChipOption[];
  selected: string[];
  noneValue: string;
  onSave: (field: string, value: string[]) => Promise<void>;
  field: string;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({ label, icon, options, selected, noneValue, onSave, field }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (chipValue: string) => {
    let newSelected: string[];
    if (chipValue === noneValue) {
      newSelected = [noneValue];
    } else {
      const without = selected.filter(s => s !== noneValue);
      if (without.includes(chipValue)) {
        newSelected = without.filter(s => s !== chipValue);
        if (newSelected.length === 0) newSelected = [noneValue];
      } else {
        newSelected = [...without, chipValue];
      }
    }

    setIsSaving(true);
    try {
      await onSave(field, newSelected);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
            {options.map(opt => {
              const isActive = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleToggle(opt.value)}
                  disabled={isSaving}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 disabled:opacity-60 ${
                    isActive
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {isSaving && (
        <div className="absolute top-3 right-3">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        </div>
      )}
    </div>
  );
};

// ─── Option Maps ─────────────────────────────────────────────────────────────

const DIETARY_GOAL_OPTIONS: SelectOption[] = [
  { label: 'Weight Loss', value: 'weight_loss' },
  { label: 'Muscle Building', value: 'muscle_gain' },
  { label: 'Stable Energy', value: 'energy_focus' },
  { label: 'General Wellness', value: 'general_health' },
  { label: 'Eat Healthier', value: 'eat_healthier' },
  { label: 'Maintain Weight', value: 'maintain' },
];

const DIET_TYPE_OPTIONS: SelectOption[] = [
  { label: 'No Restrictions', value: 'none' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Keto-Friendly', value: 'keto' },
  { label: 'Gluten-Free', value: 'gluten_free' },
];

const HEALTH_CONDITION_OPTIONS: ChipOption[] = [
  { label: 'Diabetes', value: 'diabetes' },
  { label: 'Hypertension', value: 'hypertension' },
  { label: 'None', value: 'none' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getPersonalizationTags = (preference?: string, conditions?: string[]): string[] => {
  const tags: string[] = [];
  const prefLabel = DIET_TYPE_OPTIONS.find(o => o.value === preference)?.label;
  if (prefLabel && preference !== 'none') tags.push(`${prefLabel} diet`);
  if (conditions) {
    conditions
      .filter(c => c !== 'none')
      .forEach(c => {
        const label = HEALTH_CONDITION_OPTIONS.find(o => o.value === c)?.label;
        if (label) tags.push(`${label} management`);
      });
  }
  return tags;
};

const formatWeekRange = (recommendation: WeeklyRecommendation) => {
  const start = new Date(recommendation.week_start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(recommendation.week_end_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} - ${end}`;
};

const buildRecommendationSummary = (recommendation: WeeklyRecommendation) => {
  const lines: string[] = [];
  lines.push('BALANCED PLATE - WEEKLY FOOD SUMMARY');
  lines.push(`Week: ${formatWeekRange(recommendation)}`);
  lines.push('');

  if (recommendation.health_report) {
    lines.push(recommendation.health_report);
    lines.push('');
  }

  if (recommendation.priority_actions?.length) {
    lines.push('Priority Actions');
    recommendation.priority_actions.forEach((action, index) => {
      lines.push(`${index + 1}. ${action}`);
    });
    lines.push('');
  }

  if (recommendation.weekly_goals?.length) {
    lines.push('Weekly Goals');
    recommendation.weekly_goals.forEach((goal, index) => {
      lines.push(`${index + 1}. ${goal}`);
    });
    lines.push('');
  }

  if (!recommendation.health_report && !recommendation.priority_actions?.length && !recommendation.weekly_goals?.length) {
    lines.push('No detailed summary is available for this week yet.');
  }

  return lines.join('\n');
};

const downloadTextReport = (fileName: string, text: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const WeeklyFoodSummaries: React.FC = () => {
  const { user } = useAuth();
  const { data: currentReport, isLoading: isCurrentLoading } = useHealthReport();
  const [selectedId, setSelectedId] = useState<string>('current');

  const { data: historicalReports = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['profileWeeklySummaries', user?.id],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<WeeklyRecommendation>>('/recommendations/', {
        params: { limit: 12 },
      });
      return data.results ?? [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const currentSummaryText = currentReport
    ? buildTextSummary(currentReport, user?.first_name)
    : 'Your current weekly report is still being prepared.';

  const selectedHistorical = historicalReports.find((report) => String(report.id) === selectedId);
  const previewText = selectedId === 'current'
    ? currentSummaryText
    : selectedHistorical
      ? buildRecommendationSummary(selectedHistorical)
      : 'Select a weekly summary to preview it.';

  const handleDownload = () => {
    const suffix = selectedId === 'current'
      ? 'current-week'
      : selectedHistorical?.week_start_date ?? 'weekly-summary';
    downloadTextReport(`balanced-plate-${suffix}.txt`, previewText);
  };

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Weekly Food Summaries
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Preview and download your current or historical weekly food reports.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isCurrentLoading || (selectedId !== 'current' && !selectedHistorical)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="space-y-2">
          <button
            onClick={() => setSelectedId('current')}
            className={`w-full rounded-xl border p-3 text-left transition-all ${
              selectedId === 'current'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">Current Week</span>
            </div>
            <p className="mt-1 text-xs opacity-75">Live summary from your latest activity</p>
          </button>

          <div className="pt-2">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <History className="w-3.5 h-3.5" />
              History
            </p>
            {isHistoryLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/50" />
                ))}
              </div>
            ) : historicalReports.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {historicalReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedId(String(report.id))}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selectedId === String(report.id)
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300'
                    }`}
                  >
                    <p className="text-sm font-semibold">{formatWeekRange(report)}</p>
                    <p className="mt-1 text-xs opacity-75">{report.status}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 p-3 text-sm text-gray-400 dark:border-gray-700">
                No historical summaries yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Eye className="w-4 h-4 text-emerald-500" />
            Preview
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-4 text-xs leading-relaxed text-gray-700 dark:bg-gray-950/70 dark:text-gray-300">
            {isCurrentLoading && selectedId === 'current' ? 'Preparing preview...' : previewText}
          </pre>
        </div>
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

  const handleChipSave = async (field: string, value: string[]) => {
    try {
      await api.patch(`/accounts/${user?.id}/`, { [field]: value });
      await loadCurrentUser();
      toast.success(`${field.replace(/_/g, ' ')} updated successfully!`);
    } catch {
      toast.error(`Failed to update ${field.replace(/_/g, ' ')}`);
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
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background flex flex-col ${BOTTOM_NAV_HEIGHT} md:pb-0`}>
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Hero */}
        <div className="relative mb-6">
          <div className="h-32 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl" />
          <div className="absolute -bottom-12 left-6 flex items-end gap-4">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-white dark:border-gray-900">
                <AvatarImage src="/abstract-profile.png" alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-1 right-1 w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-2 border-gray-100 dark:border-gray-700">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
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

          {/* Health & Diet Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            {/* Subtle decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />

            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-500" />
              Health & Diet Preferences
            </h2>

            {/* AI Personalization Banner */}
            {(() => {
              const tags = getPersonalizationTags(user.dietary_preference, user.health_conditions);
              if (tags.length === 0) return null;
              return (
                <div className="mb-4 flex items-start gap-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/60 dark:border-emerald-700/40 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">AI Personalized</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 leading-relaxed">
                      Your AI is tailored for: <span className="font-medium">{tags.join(', ')}</span>
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-3">
              <SelectField
                label="Dietary Goal"
                value={user.dietary_goal || 'general_health'}
                field="dietary_goal"
                icon={<Target className="w-5 h-5" />}
                options={DIETARY_GOAL_OPTIONS}
                onSave={handleFieldSave}
              />
              <SelectField
                label="Diet Type"
                value={user.dietary_preference || 'none'}
                field="dietary_preference"
                icon={<Utensils className="w-5 h-5" />}
                options={DIET_TYPE_OPTIONS}
                onSave={handleFieldSave}
              />
              <ChipSelector
                label="Health Conditions"
                icon={<HeartPulse className="w-5 h-5" />}
                options={HEALTH_CONDITION_OPTIONS}
                selected={user.health_conditions && user.health_conditions.length > 0 ? user.health_conditions : ['none']}
                noneValue="none"
                field="health_conditions"
                onSave={handleChipSave}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
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

        <WeeklyFoodSummaries />

        {/* Account Info */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
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
