import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import api from '@/api/axios'
import { toast } from 'sonner'
import { 
  Bug, 
  Lightbulb, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  Send, 
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type FeedbackCategory = 'bug' | 'suggestion' | 'feature_request' | 'general' | 'other'

interface CategoryOption {
  id: FeedbackCategory
  label: string
  icon: React.ElementType
  description: string
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: Bug,
    description: 'Something broken or behaving unexpectedly',
  },
  {
    id: 'suggestion',
    label: 'Suggestion',
    icon: Lightbulb,
    description: 'An improvement or tweak to existing features',
  },
  {
    id: 'feature_request',
    label: 'Feature Request',
    icon: Sparkles,
    description: 'A new idea or capability you would like to see',
  },
  {
    id: 'general',
    label: 'General',
    icon: MessageSquare,
    description: 'General thoughts on your experience',
  },
  {
    id: 'other',
    label: 'Other',
    icon: HelpCircle,
    description: 'Anything else you would like to share',
  },
]

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth()
  const [category, setCategory] = useState<FeedbackCategory>('suggestion')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [name, setName] = useState(
    user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Sync state if user loads later
  React.useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email)
    }
    if (user && !name) {
      setName(`${user.first_name || ''} ${user.last_name || ''}`.trim())
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalEmail = (email || user?.email || '').trim()
    if (!finalEmail) {
      toast.error('Please provide your email address.')
      return
    }

    if (!subject.trim()) {
      toast.error('Please enter a brief subject.')
      return
    }

    if (!message.trim()) {
      toast.error('Please provide your feedback message.')
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/feedback/', {
        category,
        subject: subject.trim(),
        message: message.trim(),
        email: finalEmail,
        name: name.trim() || undefined,
      })

      setIsSuccess(true)
      toast.success('Thank you! Your feedback has been sent to our team.')

      setTimeout(() => {
        setIsSuccess(false)
        setSubject('')
        setMessage('')
        onOpenChange(false)
      }, 1500)
    } catch (error: any) {
      console.error('Failed to submit feedback:', error)
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Could not submit feedback at this time. Please try again.'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setIsSuccess(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] p-6 sm:p-7 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Share Your Feedback
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Help us improve NutriLens. We read and appreciate every note!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-in zoom-in-50">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Feedback Received!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Thank you for helping make NutriLens better. Our team has received your message.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Category selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Feedback Type
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer text-xs sm:text-sm font-medium',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400')} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="feedback-subject" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Subject
              </Label>
              <Input
                id="feedback-subject"
                placeholder="e.g., Calorie summary suggestion or camera upload bug"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={150}
                required
                className="h-10 text-sm focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-500"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label htmlFor="feedback-message" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Details & Description
              </Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what happened, what you expected, or what you'd like us to build..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                className="text-sm resize-none focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="cursor-pointer text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-sm min-w-[110px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
