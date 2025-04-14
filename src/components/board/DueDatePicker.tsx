import React from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useButton } from '@react-aria/button';
import { useCalendarState } from '@react-stately/calendar';
import { useCalendar } from '@react-aria/calendar';
import { createCalendar, getLocalTimeZone, parseDate } from '@internationalized/date';
import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface DueDatePickerProps {
  dueDate: string | null;
  onDateChange: (date: string | null) => void;
  isCompleted?: boolean;
  triggerComponent?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function DueDatePicker({ 
  dueDate, 
  onDateChange, 
  isCompleted = false, 
  triggerComponent,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange
}: DueDatePickerProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalIsOpen;

  const [selectedTime, setSelectedTime] = React.useState("23:59");
  const [tempDate, setTempDate] = React.useState<Date | null>(dueDate ? new Date(dueDate) : null);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (dueDate) {
      const date = new Date(dueDate);
      setSelectedTime(format(date, 'HH:mm'));
      setTempDate(date);
      setCurrentMonth(date);
    }
  }, [dueDate]);

  const { buttonProps } = useButton({
    onPress: () => {
      onOpenChange(true);
    },
  }, buttonRef);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonProps?.onClick) {
      buttonProps.onClick(e as React.MouseEvent<HTMLButtonElement, MouseEvent>);
    }
  };

  const { dialogProps } = useDialog({}, dialogRef);

  const calendar = createCalendar('gregory');
  
  const state = useCalendarState({
    value: tempDate ? parseDate(format(tempDate, 'yyyy-MM-dd')) : undefined,
    locale: 'es-ES',
    createCalendar,
  });

  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar(
    {
      value: state.value,
      onChange: (date) => {
        state.setValue(date);
        if (date) {
          const selectedDate = date.toDate(getLocalTimeZone());
          const [hours, minutes] = selectedTime.split(':').map(Number);
          selectedDate.setHours(hours, minutes, 0, 0);
          setTempDate(selectedDate);
          console.log('Calendar date selected:', selectedDate.toISOString());
        }
      },
    },
    state
  );

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(nextMonth => addMonths(nextMonth, 1));
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onOpenChange(false);
        setTempDate(dueDate ? new Date(dueDate) : null);
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
  }, [isOpen, dueDate, onOpenChange]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tempDate) {
      console.log('Confirming date:', tempDate.toISOString());
      onDateChange(tempDate.toISOString());
    }
    onOpenChange(false);
  };

  const handleQuickAction = (e: React.MouseEvent, days: number) => {
    e.preventDefault();
    e.stopPropagation();
    const date = new Date();
    date.setDate(date.getDate() + days);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    console.log('Quick action date:', date.toISOString());
    onDateChange(date.toISOString());
    onOpenChange(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = e.target.value;
    setSelectedTime(newTime);
    
    if (tempDate) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(tempDate);
      newDate.setHours(hours, minutes, 0, 0);
      setTempDate(newDate);
      console.log('Time changed:', newDate.toISOString());
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
    setTempDate(dueDate ? new Date(dueDate) : null);
  };

  const handleRemoveDate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Removing date');
    onDateChange(null);
  };

  const getDueDateStatus = () => {
    if (!dueDate) return null;
    if (isCompleted) return 'completed';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'soon';
    return 'normal';
  };

  const getStatusStyles = () => {
    switch (getDueDateStatus()) {
      case 'completed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'overdue':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 animate-pulse';
      case 'soon':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return format(d, "d MMM yyyy 'a las' HH:mm", { locale: es });
  };

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - (startDate.getDay() || 7) + 1);
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let date = new Date(startDate); date <= monthEnd; date.setDate(date.getDate() + 1)) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(new Date(date));
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const nextDate = new Date(currentWeek[currentWeek.length - 1]);
      nextDate.setDate(nextDate.getDate() + 1);
      currentWeek.push(nextDate);
    }
    weeks.push(currentWeek);
  }

  return (
    <>
      {triggerComponent ? (
        <div ref={buttonRef} onClick={handleButtonClick}>
          {triggerComponent}
        </div>
      ) : dueDate ? (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            {...buttonProps}
            ref={buttonRef}
            onClick={handleButtonClick}
            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg 
                     text-sm font-medium transition-all duration-200
                     hover:ring-2 hover:ring-primary-400/30 ${getStatusStyles()}`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatDate(dueDate)}</span>
          </button>
          <button
            onClick={handleRemoveDate}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                     transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 
                       dark:text-gray-500 dark:hover:text-gray-300" />
          </button>
        </div>
      ) : (
        <button
          {...buttonProps}
          ref={buttonRef}
          onClick={handleButtonClick}
          className="inline-flex items-center space-x-2 px-3 py-1.5 
                   bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 
                   dark:hover:bg-gray-700 rounded-lg text-sm font-medium 
                   text-gray-600 dark:text-gray-400 transition-all duration-200
                   hover:ring-2 hover:ring-primary-400/30"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Añadir fecha</span>
        </button>
      )}

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          
          <FocusScope contain restoreFocus autoFocus>
            <div
              {...dialogProps}
              ref={dialogRef}
              className="relative w-80 transform rounded-xl bg-white dark:bg-gray-800 
                       shadow-2xl ring-1 ring-black/5 dark:ring-white/5 transition-all duration-200
                       border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Seleccionar fecha y hora
                </h3>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Quick actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={(e) => handleQuickAction(e, 0)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-500 
                             rounded-lg hover:bg-primary-600 transition-colors duration-200"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(e, 1)}
                    className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700
                             dark:bg-gray-700 dark:text-gray-300 rounded-lg 
                             hover:bg-gray-200 dark:hover:bg-gray-600 
                             transition-colors duration-200"
                  >
                    Mañana
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(e, 7)}
                    className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700
                             dark:bg-gray-700 dark:text-gray-300 rounded-lg 
                             hover:bg-gray-200 dark:hover:bg-gray-600 
                             transition-colors duration-200"
                  >
                    Próxima semana
                  </button>
                </div>

                {/* Calendar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                               transition-colors duration-200"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h4>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                               transition-colors duration-200"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="h-8 flex items-center justify-center text-xs font-medium
                                 text-gray-500 dark:text-gray-400"
                      >
                        {day}
                      </div>
                    ))}
                    {weeks.map((week, weekIndex) => (
                      <React.Fragment key={weekIndex}>
                        {week.map((date, dateIndex) => {
                          const isSelected = tempDate && 
                            format(date, 'yyyy-MM-dd') === format(tempDate, 'yyyy-MM-dd');
                          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                          
                          return (
                            <button
                              key={dateIndex}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const selectedDate = new Date(date);
                                const [hours, minutes] = selectedTime.split(':').map(Number);
                                selectedDate.setHours(hours, minutes, 0, 0);
                                setTempDate(selectedDate);
                                console.log('Date selected:', selectedDate.toISOString());
                              }}
                              className={`h-8 flex items-center justify-center text-sm rounded-lg
                                       transition-all duration-200 ${
                                isSelected
                                  ? 'bg-primary-500 text-white'
                                  : isToday
                                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              } ${
                                !isCurrentMonth
                                  ? 'text-gray-400 dark:text-gray-600'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Time picker */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border 
                             border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 
                             dark:text-white focus:ring-2 focus:ring-primary-400 
                             focus:border-transparent transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Confirmation buttons */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                             transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!tempDate}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium
                             bg-primary-500 text-white rounded-lg hover:bg-primary-600
                             transition-colors duration-200 disabled:opacity-50
                             disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar</span>
                  </button>
                </div>
              </div>
            </div>
          </FocusScope>
        </div>,
        document.body
      )}
    </>
  );
}