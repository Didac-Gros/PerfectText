import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { EventInput } from '@fullcalendar/core';
import { format, isValid, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventInput | null;
  defaultDate: Date | null;
  onSave: (eventData: EventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const EVENT_COLORS = [
  { id: 'blue', color: '#3b82f6', label: 'Blue' },
  { id: 'red', color: '#ef4444', label: 'Red' },
  { id: 'green', color: '#10b981', label: 'Green' },
  { id: 'purple', color: '#8b5cf6', label: 'Purple' },
  { id: 'yellow', color: '#f59e0b', label: 'Yellow' },
];

const TIME_SLOTS = [
  { id: 'all-day', label: 'All Day', start: '00:00', end: '23:59', isAllDay: true },
  { id: 'early-morning', label: 'Early Morning', start: '06:00', end: '09:00' },
  { id: 'morning', label: 'Morning', start: '09:00', end: '12:00' },
  { id: 'afternoon', label: 'Afternoon', start: '12:00', end: '17:00' },
  { id: 'evening', label: 'Evening', start: '17:00', end: '21:00' },
];

export function EventModal({
  isOpen,
  onClose,
  event,
  defaultDate,
  onSave,
  onDelete,
}: EventModalProps) {
  const [title, setTitle] = React.useState(event?.title || '');
  const [description, setDescription] = React.useState(event?.extendedProps?.description || '');
//   const [startDate, setStartDate] = React.useState<Date>(
//     event?.start ? new Date(event.start) : defaultDate || new Date()
//   );
//   const [endDate, setEndDate] = React.useState<Date>(
//     event?.end ? new Date(event.end) : defaultDate || new Date()
//   );
  const [selectedColor, setSelectedColor] = React.useState(EVENT_COLORS[0].id);
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const getValidDate = (input: any): Date => {
    if (Array.isArray(input)) return new Date(); // o manejarlo de otro modo
    return new Date(input);
  };

  const [startDate, setStartDate] = React.useState<Date>(
    event?.start ? getValidDate(event.start) : defaultDate || new Date()
  );

  const [endDate, setEndDate] = React.useState<Date>(
    event?.end ? getValidDate(event.end) : defaultDate || new Date()
  );

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleTimeSlotSelect = (slotId: string) => {
    const slot = TIME_SLOTS.find(s => s.id === slotId);
    if (!slot) return;

    setSelectedTimeSlot(slotId);

    // Update start and end times based on the selected slot
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);

    setStartDate(setMinutes(setHours(newStartDate, startHour), startMinute));
    setEndDate(setMinutes(setHours(newEndDate, endHour), endMinute));

    // If it's an all-day event, set the allDay flag
    if (slot.isAllDay) {
      setStartDate(setHours(setMinutes(newStartDate, 0), 0));
      setEndDate(setHours(setMinutes(newEndDate, 59), 23));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const color = EVENT_COLORS.find(c => c.id === selectedColor);
    
    const eventData: EventInput = {
      title,
      start: startDate,
      end: endDate,
      allDay: selectedTimeSlot === 'all-day',
      backgroundColor: color?.color,
      borderColor: color?.color,
      extendedProps: {
        description,
        color: selectedColor,
        timeSlot: selectedTimeSlot,
      },
    };
    
    await onSave(eventData);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      await onDelete();
    }
  };

  const formatDateValue = (date: Date | null): string => {
    if (!date || !isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const formatTimeValue = (date: Date | null): string => {
    if (!date || !isValid(date)) return '';
    return format(date, 'HH:mm');
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {event ? 'Edit Event' : 'Add Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event Title"
                className="w-full px-4 py-2.5 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800
                         placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800
                         placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                placeholder="Description"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto py-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleTimeSlotSelect(slot.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                           ${selectedTimeSlot === slot.id
                             ? 'bg-primary-500 text-white'
                             : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                           }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formatDateValue(startDate)}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      if (isValid(newDate)) {
                        const updatedDate = new Date(startDate);
                        updatedDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                        setStartDate(updatedDate);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formatTimeValue(startDate)}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(startDate);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setStartDate(newDate);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formatDateValue(endDate)}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      if (isValid(newDate)) {
                        const updatedDate = new Date(endDate);
                        updatedDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                        setEndDate(updatedDate);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formatTimeValue(endDate)}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(endDate);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setEndDate(newDate);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Color
              </label>
              <div className="flex items-center space-x-3">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color.id ? 'ring-2 ring-offset-2 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg 
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg 
                           hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg 
                       hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}