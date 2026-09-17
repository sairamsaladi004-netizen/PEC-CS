import { renderEventCalendarComponent, attachEventCalendarEvents } from '../components/eventCalendar.js';

/**
 * Event Calendar View Page - Pragati Engineering College
 * Displays the responsive, category-filtered event calendar grid with Supabase integration.
 */
export function renderCalendarView() {
  return `
    <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      ${renderEventCalendarComponent()}
    </div>
  `;
}

export function attachCalendarViewEvents() {
  attachEventCalendarEvents();
}
