import { renderEventDashboard, attachEventDashboardEvents } from '../components/eventDashboard.js';

/**
 * Events View - Centralized Technical Society Event Dashboard
 * Displays upcoming events across all 35 official PEC clubs with filtering options
 * by Club Category (Industry 4.0, Co-Curricular, Extra-Curricular).
 */

export function renderEventsView(params = {}) {
  const initialCategory = params.category || "all";
  const initialClubId = params.club || params.clubId || "all";
  const initialFormat = params.format || "all";

  return renderEventDashboard({
    initialCategory,
    initialClubId,
    initialFormat
  });
}

export function attachEventsEvents(params = {}) {
  const initialCategory = params.category || "all";
  const initialClubId = params.club || params.clubId || "all";
  const initialFormat = params.format || "all";

  attachEventDashboardEvents({
    initialCategory,
    initialClubId,
    initialFormat
  });
}

export { renderEventDashboard, attachEventDashboardEvents };
