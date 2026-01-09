'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cake,
  Edit3,
  Trash2,
  Loader2,
  Clock,
  User,
  Sparkles,
  Gift,
  PartyPopper,
  X,
  AlertTriangle,
  FileText,
  Bell,
  Star,
  Image as ImageIcon,
  Upload,
  Link2,
} from 'lucide-react';
import {
  Announcement,
  AnnouncementInput,
  subscribeToAnnouncements,
  subscribeToUpcomingBirthdays,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPin,
  announcementCategories,
  uploadAnnouncementImage,
} from '@/lib/firebase/announcements';
import { getDepartments } from '@/lib/firebase/departments';
import { Department } from '@/types';
import { useConfirm } from '@/hooks/use-confirm';
import { AnnouncementSeeder } from '@/components/AnnouncementSeeder';
import toast from 'react-hot-toast';

// Birthday Carousel Component
function BirthdayCarousel({ 
  birthdays,
  departments 
}: { 
  birthdays: { uid: string; displayName: string; birthday: Date; daysUntil: number; department?: string; profilePhotoUrl?: string }[];
  departments: Department[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return '';
    return departments.find(d => d.id === deptId)?.name || '';
  };

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && birthdays.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % birthdays.length);
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, birthdays.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + birthdays.length) % birthdays.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % birthdays.length);
  };

  if (birthdays.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-8 text-center">
        <Cake className="h-12 w-12 text-pink-300 mx-auto mb-3" />
        <p className="text-slate-500">No upcoming birthdays in the next 30 days</p>
      </div>
    );
  }

  const currentBirthday = birthdays[currentIndex];

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-1 shadow-xl shadow-purple-500/20">
      <div className="rounded-xl bg-white p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-pink-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg">
              <Cake className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Upcoming Birthdays</h3>
              <p className="text-xs text-slate-500">{birthdays.length} celebration{birthdays.length > 1 ? 's' : ''} coming up</p>
            </div>
          </div>
          
          {birthdays.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        {/* Birthday Card */}
        <div className="relative z-10 flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
          {/* Avatar */}
          <div className="relative">
            {currentBirthday.profilePhotoUrl ? (
              <img
                src={currentBirthday.profilePhotoUrl}
                alt={currentBirthday.displayName}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 text-xl font-bold text-white ring-4 ring-white shadow-lg">
                {currentBirthday.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-sm shadow-lg">
              🎂
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 text-lg">{currentBirthday.displayName}</h4>
            {getDepartmentName(currentBirthday.department) && (
              <p className="text-sm text-slate-500">{getDepartmentName(currentBirthday.department)}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                currentBirthday.daysUntil === 0 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-pulse' 
                  : currentBirthday.daysUntil <= 7 
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-slate-100 text-slate-700'
              }`}>
                {currentBirthday.daysUntil === 0 ? (
                  <>
                    <PartyPopper className="h-4 w-4" />
                    Today! 🎉
                  </>
                ) : currentBirthday.daysUntil === 1 ? (
                  <>
                    <Gift className="h-4 w-4" />
                    Tomorrow
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    In {currentBirthday.daysUntil} days
                  </>
                )}
              </span>
              <span className="text-sm text-slate-400">
                {currentBirthday.birthday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        {birthdays.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {birthdays.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-gradient-to-r from-pink-500 to-purple-500' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Announcement Card Component
function AnnouncementCard({
  announcement,
  isAdmin,
  isHighlighted,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  announcement: Announcement;
  isAdmin: boolean;
  isHighlighted: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const category = announcementCategories[announcement.category];
  const timeAgo = getTimeAgo(announcement.createdAt);

  return (
    <div 
      id={`announcement-${announcement.id}`}
      className={`group rounded-2xl border bg-white p-5 transition-all duration-300 hover:shadow-lg ${
        isHighlighted 
          ? 'ring-2 ring-blue-500 ring-offset-2 animate-pulse-once' 
          : 'border-slate-200 hover:border-slate-300'
      } ${announcement.isPinned ? 'border-amber-200 bg-amber-50/30' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900">{announcement.title}</h3>
              {announcement.isPinned && (
                <Pin className="h-4 w-4 text-amber-500 fill-amber-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`px-2 py-0.5 rounded-full ${category.color}`}>
                {category.label}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onTogglePin}
              className={`p-2 rounded-lg transition-colors ${
                announcement.isPinned 
                  ? 'text-amber-500 hover:bg-amber-50' 
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
              title={announcement.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-500 transition-colors"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Image */}
      {announcement.imageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img
            src={announcement.imageUrl}
            alt={announcement.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <p className="text-slate-600 whitespace-pre-wrap">{announcement.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <User className="h-3 w-3" />
          <span>Posted by {announcement.authorName}</span>
        </div>
        {announcement.expiresAt && (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expires {announcement.expiresAt.toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

// Announcement Form Modal
function AnnouncementFormModal({
  isOpen,
  onClose,
  announcement,
  userId,
  userName,
}: {
  isOpen: boolean;
  onClose: () => void;
  announcement?: Announcement | null;
  userId: string;
  userName: string;
}) {
  const [formData, setFormData] = useState<AnnouncementInput>({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    imageUrl: '',
    isPinned: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        priority: announcement.priority,
        imageUrl: announcement.imageUrl || '',
        isPinned: announcement.isPinned,
        expiresAt: announcement.expiresAt,
      });
      if (announcement.imageUrl) {
        setImagePreview(announcement.imageUrl);
        setImageInputMode('url');
      }
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        imageUrl: '',
        isPinned: false,
      });
      setImageFile(null);
      setImagePreview('');
      setImageInputMode('upload');
    }
  }, [announcement, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      let imageUrl = formData.imageUrl;
      
      // Upload image if file is selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadAnnouncementImage(imageFile);
        } catch (error) {
          toast.error('Failed to upload image');
          setUploadingImage(false);
          setSubmitting(false);
          return;
        }
        setUploadingImage(false);
      }
      
      const dataToSave = { ...formData, imageUrl };
      
      if (announcement) {
        await updateAnnouncement(announcement.id, dataToSave);
        toast.success('Announcement updated successfully');
      } else {
        await createAnnouncement(userId, userName, dataToSave);
        toast.success('Announcement posted! All employees have been notified.');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-500" />
            {announcement ? 'Edit Announcement' : 'New Announcement'}
          </DialogTitle>
          <DialogDescription>
            {announcement ? 'Update this announcement' : 'Create a new announcement for all employees'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Announcement title..."
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {Object.entries(announcementCategories).map(([key, { label, icon }]) => (
                  <option key={key} value={key}>{icon} {label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={5}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
              placeholder="Write your announcement here..."
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Image (optional)
              </span>
            </label>
            
            {/* Toggle between upload and URL */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setImageInputMode('upload');
                  setFormData(prev => ({ ...prev, imageUrl: '' }));
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  imageInputMode === 'upload'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageInputMode('url');
                  clearImage();
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  imageInputMode === 'url'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Link2 className="h-4 w-4" />
                Image URL
              </button>
            </div>
            
            {imageInputMode === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                {imagePreview && !formData.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                  >
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Click to upload image</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  </label>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                    setImagePreview(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <Pin className="h-4 w-4" />
                Pin to top
              </span>
            </label>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Expiration Date (optional)
            </label>
            <input
              type="date"
              value={formData.expiresAt ? formData.expiresAt.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                expiresAt: e.target.value ? new Date(e.target.value) : undefined 
              }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadingImage ? 'Uploading image...' : announcement ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Megaphone className="h-4 w-4 mr-2" />
                  {announcement ? 'Update' : 'Post Announcement'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Main Page Component
function BulletinBoardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const isAdmin = user?.role === 'admin';

  const [DeleteConfirmDialog, confirmDelete] = useConfirm(
    'Delete Announcement',
    'Are you sure you want to delete this announcement? This action cannot be undone.'
  );

  // Load data
  useEffect(() => {
    getDepartments().then(setDepartments);

    const unsubAnnouncements = subscribeToAnnouncements(data => {
      setAnnouncements(data);
      setLoading(false);
    });

    const unsubBirthdays = subscribeToUpcomingBirthdays(data => {
      setBirthdays(data);
    });

    return () => {
      unsubAnnouncements();
      unsubBirthdays();
    };
  }, []);

  // Scroll to highlighted announcement
  useEffect(() => {
    if (highlightId && !loading) {
      const element = document.getElementById(`announcement-${highlightId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [highlightId, loading]);

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = async (announcement: Announcement) => {
    const confirmed = await confirmDelete();
    if (confirmed) {
      try {
        await deleteAnnouncement(announcement.id);
        toast.success('Announcement deleted');
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      await toggleAnnouncementPin(announcement.id, !announcement.isPinned);
      toast.success(announcement.isPinned ? 'Unpinned' : 'Pinned to top');
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.category === filter);

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

  return (
    <DashboardLayout>
      <DeleteConfirmDialog />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              Bulletin Board
            </h1>
            <p className="mt-1 text-slate-500">Company announcements, events, and celebrations</p>
          </div>

          {isAdmin && (
            <Button
              onClick={() => {
                setEditingAnnouncement(null);
                setIsFormOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Announcement Seeder - Admin Only (Remove this component in production) */}
      {isAdmin && (
        <div className="mb-6">
          <AnnouncementSeeder 
            userId={user?.uid || ''} 
            userName={user?.displayName || user?.email || 'Admin'} 
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Announcements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              All
            </button>
            {Object.entries(announcementCategories).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                  filter === key
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Announcements List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900 mb-1">No announcements yet</h3>
              <p className="text-slate-500 text-sm">
                {isAdmin ? 'Create your first announcement to get started' : 'Check back later for updates'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pinned Section */}
              {pinnedAnnouncements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                    <Pin className="h-4 w-4" />
                    Pinned
                  </div>
                  {pinnedAnnouncements.map(announcement => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      isAdmin={isAdmin}
                      isHighlighted={announcement.id === highlightId}
                      onEdit={() => handleEdit(announcement)}
                      onDelete={() => handleDelete(announcement)}
                      onTogglePin={() => handleTogglePin(announcement)}
                    />
                  ))}
                </div>
              )}

              {/* Regular Announcements */}
              {regularAnnouncements.length > 0 && (
                <div className="space-y-4">
                  {pinnedAnnouncements.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <FileText className="h-4 w-4" />
                      Recent
                    </div>
                  )}
                  {regularAnnouncements.map(announcement => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      isAdmin={isAdmin}
                      isHighlighted={announcement.id === highlightId}
                      onEdit={() => handleEdit(announcement)}
                      onDelete={() => handleDelete(announcement)}
                      onTogglePin={() => handleTogglePin(announcement)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Birthday Carousel */}
          <BirthdayCarousel birthdays={birthdays} departments={departments} />

          {/* Quick Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">Total Announcements</span>
                <span className="font-bold text-slate-900">{announcements.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
                <span className="text-sm text-slate-600">Pinned</span>
                <span className="font-bold text-amber-600">{pinnedAnnouncements.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-50">
                <span className="text-sm text-slate-600">Upcoming Birthdays</span>
                <span className="font-bold text-pink-600">{birthdays.length}</span>
              </div>
            </div>
          </div>

          {/* Today's Birthdays */}
          {birthdays.filter(b => b.daysUntil === 0).length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <PartyPopper className="h-5 w-5" />
                <h3 className="font-bold">Today's Celebrations!</h3>
              </div>
              <div className="space-y-2">
                {birthdays.filter(b => b.daysUntil === 0).map(b => (
                  <div key={b.uid} className="flex items-center gap-2 p-2 rounded-lg bg-white/20">
                    <span className="text-lg">🎂</span>
                    <span className="font-medium">{b.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Announcement Form Modal */}
      <AnnouncementFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAnnouncement(null);
        }}
        announcement={editingAnnouncement}
        userId={user?.uid || ''}
        userName={user?.displayName || user?.email || 'Unknown'}
      />
    </DashboardLayout>
  );
}

export default function BulletinBoardPage() {
  return (
    <AuthGuard allowedRoles={['admin', 'hr', 'payroll', 'manager', 'employee']}>
      <BulletinBoardContent />
    </AuthGuard>
  );
}
