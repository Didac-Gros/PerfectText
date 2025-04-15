import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon, LayoutGrid, ListMinus, Baseline as Timeline, Check, ChevronLeft, ChevronRight, Clock, Filter, Sun, Grid2X2, CalendarDays, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useCalendarStore } from '../../hooks/useCalendarStore';
import { EventModal } from '../shared/EventModal';
import type { EventInput, ViewApi } from '@fullcalendar/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const VIEW_OPTIONS = [
  { id: 'dayGridMonth', label: 'Month', icon: Grid2X2 },
  { id: 'timeGridWeek', label: 'Week', icon: CalendarDays },
  { id: 'timeGridDay', label: 'Day', icon: Timeline },
  { id: 'listWeek', label: 'List', icon: ListMinus },
];

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

const BASE_SLOT_HEIGHT = 48; // Base height in pixels for time slots

export function CalendarTab() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<EventInput | null>(null);
  const [currentView, setCurrentView] = React.useState<CalendarView>('timeGridWeek');
  const [viewTitle, setViewTitle] = React.useState('');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [eventPopup, setEventPopup] = React.useState<{
    events: EventInput[];
    position: { x: number; y: number };
  } | null>(null);
  const calendarRef = React.useRef<any>(null);
  
  const { events, addEvent, updateEvent, deleteEvent, toggleEventCompletion, syncWithGoogle } = useCalendarStore();

  // Update slot height when zoom changes
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--fc-timegrid-slot-height', `${BASE_SLOT_HEIGHT * zoom}px`);
  }, [zoom]);

  const handleViewDidMount = (arg: { view: ViewApi }) => {
    const date = arg.view.currentStart;
    const view = arg.view.type as CalendarView;
    updateViewTitle(date, view);
  };

  const updateViewTitle = (date: Date, view: CalendarView) => {
    let title = '';
    switch (view) {
      case 'dayGridMonth':
        title = format(date, 'MMMM yyyy', { locale: es });
        break;
      case 'timeGridWeek':
        const weekStart = date;
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          title = `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} de ${format(weekStart, 'MMMM yyyy', { locale: es })}`;
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
          title = `${format(weekStart, 'd MMM')} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;
        } else {
          title = `${format(weekStart, 'd MMM yyyy')} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;
        }
        break;
      case 'timeGridDay':
        title = format(date, "EEEE, d 'de' MMMM yyyy", { locale: es });
        break;
      case 'listWeek':
        title = `Semana del ${format(date, "d 'de' MMMM yyyy", { locale: es })}`;
        break;
    }
    setViewTitle(title);
    setCurrentDate(date);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    if ((clickInfo.jsEvent.target as HTMLElement).closest('.task-complete-button')) {
      return;
    }
    setSelectedEvent(clickInfo.event);
    setIsModalOpen(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    try {
      await updateEvent({
        id: dropInfo.event.id,
        start: dropInfo.event.start,
        end: dropInfo.event.end || dropInfo.event.start,
      });
    } catch (error) {
      console.error('Error updating event:', error);
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo: any) => {
    try {
      await updateEvent({
        id: resizeInfo.event.id,
        start: resizeInfo.event.start,
        end: resizeInfo.event.end,
      });
    } catch (error) {
      console.error('Error resizing event:', error);
      resizeInfo.revert();
    }
  };

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(view);
    updateViewTitle(calendarApi?.getDate(), view);
  };

  const handlePrevNext = (direction: 'prev' | 'next') => {
    const calendarApi = calendarRef.current?.getApi();
    if (direction === 'prev') {
      calendarApi?.prev();
    } else {
      calendarApi?.next();
    }
    updateViewTitle(calendarApi?.getDate(), currentView);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  // Handle wheel zoom with Ctrl/Cmd key
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoom(prev => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
    }
  };

  const handleDayClick = (info: any) => {
    // Check if we clicked on the event counter
    if ((info.jsEvent.target as Element).closest('.event-counter')) {
      const date = info.date;
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start as Date);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      });

      if (dayEvents.length > 0) {
        const rect = info.dayEl.getBoundingClientRect();
        setEventPopup({
          events: dayEvents,
          position: {
            x: rect.right,
            y: rect.top + window.scrollY,
          },
        });
      }
    } else {
      // Only open create event modal if we didn't click the event counter
      setSelectedDate(info.date);
      setIsModalOpen(true);
    }
  };

  // Close event popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!e.target || !(e.target as Element).closest('.event-popup')) {
        setEventPopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleSync = async () => {
    try {
      setIsSyncing(true);
      await syncWithGoogle('YOUR_ACCESS_TOKEN'); // Replace with actual token
      const calendarApi = calendarRef.current?.getApi();
      calendarApi?.refetchEvents();
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      alert('Could not sync with Google Calendar. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const renderDayCellContent = (arg: any) => {
    const date = arg.date;
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start as Date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });

    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-center mb-2">
          <span className="text-sm font-medium">{arg.dayNumberText}</span>
        </div>
        {dayEvents.length > 0 && (
          <div className="event-counter">
            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
          </div>
        )}
      </div>
    );
  };

  const renderEventContent = (eventInfo: any) => {
    const isCompleted = eventInfo.event.extendedProps?.completed;
    const isListView = eventInfo.view.type === 'listWeek';
    
    return (
      <motion.div 
        className={`w-full group relative ${isListView ? 'p-2' : 'p-1'}`}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className={`flex items-center space-x-2 ${isCompleted ? 'line-through opacity-75' : ''}`}>
          <button
            className={`task-complete-button flex-shrink-0 w-5 h-5 rounded-md flex items-center 
                     justify-center transition-all duration-200 ${
                       isCompleted 
                         ? 'bg-green-500 text-white' 
                         : 'bg-white/90 dark:bg-gray-700/90 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400'
                     }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleEventCompletion(eventInfo.event.id);
            }}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex-1 min-w-0">
            {eventInfo.timeText && (
              <div className="text-xs font-medium">{eventInfo.timeText}</div>
            )}
            <div className={`text-sm ${isListView ? 'font-medium' : ''}`}>
              {eventInfo.event.title}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold">Event Calendar</h1>
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
            <button 
              onClick={() => handlePrevNext('prev')}
              className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-gray-900 dark:text-white font-medium px-2">
              {viewTitle}
            </span>
            <button 
              onClick={() => handlePrevNext('next')}
              className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGoogleSync}
            disabled={isSyncing}
            className={`flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 
                     text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 
                     dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 
                     transition-all duration-200 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Google Calendar'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 
                       rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                       dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3ch] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                       dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {VIEW_OPTIONS.map((view) => (
              <button
                key={view.id}
                onClick={() => handleViewChange(view.id as CalendarView)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                  currentView === view.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <view.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{view.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white dark:bg-white 
                     dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 
                     transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      <div 
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        onWheel={handleWheel}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          dayMaxEvents={false}
          firstDay={1} // Set Monday as first day
          views={{
            timeGridWeek: {
              type: 'timeGrid',
              duration: { weeks: 1 },
              buttonText: 'Week',
              slotDuration: '00:30:00',
              slotLabelInterval: '01:00',
              slotMinTime: '00:00:00',
              slotMaxTime: '24:00:00',
              dayHeaderFormat: {
                weekday: 'short',
                day: 'numeric',
              },
              allDaySlot: false, // Remove all-day section
              dayHeaderContent: (args) => {
                return (
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {format(args.date, 'EEE', { locale: es })}
                    </span>
                    <span className="text-2xl font-bold">
                      {format(args.date, 'd')}
                    </span>
                  </div>
                );
              },
            },
            dayGridMonth: {
              dayMaxEventRows: false,
              dayCellContent: renderDayCellContent,
              fixedWeekCount: false,
              firstDay: 1, // Set Monday as first day
            },
            timeGridDay: {
              type: 'timeGrid',
              duration: { days: 1 },
              buttonText: 'Day',
              allDaySlot: false, // Remove all-day section
              dayHeaderFormat: {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              },
            },
            listWeek: {
              type: 'list',
              duration: { weeks: 1 },
              buttonText: 'List',
              eventContent: renderEventContent,
              firstDay: 1, // Set Monday as first day
            },
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          dateClick={handleDayClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={renderEventContent}
          viewDidMount={handleViewDidMount}
          datesSet={(arg) => {
            updateViewTitle(arg.view.currentStart, arg.view.type as CalendarView);
          }}
          locale="es"
          allDayText="All Day"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          expandRows={true}
          stickyHeaderDates={true}
          nowIndicator={true}
          scrollTime="06:00:00"
          className="fc-theme-custom"
          dragRevertDuration={0}
          eventDragMinDistance={5}
          dragScroll={true}
          dropAccept="*"
          eventDragStart={(info) => {
            info.el.style.transition = 'none';
            info.el.style.opacity = '0.8';
            info.el.style.transform = 'scale(1.05)';
            info.el.style.zIndex = '1000';
          }}
          eventDragStop={(info) => {
            info.el.style.transition = 'all 0.2s ease';
            info.el.style.opacity = '1';
            info.el.style.transform = 'scale(1)';
            info.el.style.zIndex = 'auto';
          }}
        />
      </div>

      {/* Event Popup */}
      <AnimatePresence>
        {eventPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="event-popup"
            style={{
              top: eventPopup.position.y,
              left: eventPopup.position.x,
            }}
          >
            <div className="event-popup-list">
              {eventPopup.events.map((event) => (
                <div
                  key={event.id}
                  className="event-popup-item"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsModalOpen(true);
                    setEventPopup(null);
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.backgroundColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(event.start as Date), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <EventModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            event={selectedEvent}
            defaultDate={selectedDate}
            onSave={async (eventData) => {
              if (selectedEvent) {
                await updateEvent({
                  ...eventData,
                  id: selectedEvent.id,
                });
              } else {
                await addEvent(eventData);
              }
              setIsModalOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            onDelete={async () => {
              if (selectedEvent) {
                await deleteEvent(selectedEvent.id as string);
              }
              setIsModalOpen(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}