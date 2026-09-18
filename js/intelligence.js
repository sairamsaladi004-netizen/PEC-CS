// AI-assisted Club Engagement & Event Intelligence

import { getDB } from './db.js';

/**
 * Calculates a club engagement score (0-100) based on various factors.
 * @param {string} clubId 
 * @returns {object} { score: number, factors: object }
 */
export function calculateClubEngagementScore(clubId) {
  const db = getDB();
  const club = db.clubs.find(c => c.id === clubId);
  if (!club) return { score: 0, factors: {} };

  // 1. Membership Activity (20%)
  const memberships = (db.club_memberships || []).filter(m => m.club_id === clubId);
  const memberCount = memberships.length;
  // Normalize against a baseline of 50 members for a "healthy" club
  const membershipScore = Math.min(100, (memberCount / 50) * 100);

  // 2. Events Conducted (30%)
  const events = (db.events || []).filter(e => e.club_id === clubId || e.clubId === clubId);
  const now = new Date();
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const recentEvents = events.filter(e => new Date(e.date) <= now && new Date(e.date) >= sixMonthsAgo);
  // Normalize against a baseline of 4 events per semester (6 months)
  const eventsScore = Math.min(100, (recentEvents.length / 4) * 100);

  // 3. Attendance Rate (30%)
  const eventIds = events.map(e => e.id);
  const attendanceLogs = (db.attendance_logs || db.attendance || []).filter(a => eventIds.includes(a.event_id));
  
  let totalExpectedAttendance = 0;
  let totalActualAttendance = 0;

  events.forEach(e => {
    const registrations = (db.event_registrations || []).filter(r => r.event_id === e.id).length;
    const attended = attendanceLogs.filter(a => a.event_id === e.id).length;
    totalExpectedAttendance += registrations || 0;
    totalActualAttendance += attended;
  });

  const attendanceScore = totalExpectedAttendance > 0 
    ? (totalActualAttendance / totalExpectedAttendance) * 100 
    : 0;

  // 4. Project Outputs (20%)
  const projects = (db.projects || []).filter(p => p.club_id === clubId || p.clubId === clubId);
  // Normalize against a baseline of 3 active projects
  const projectsScore = Math.min(100, (projects.length / 3) * 100);

  // Weighted Average
  const finalScore = (
    (membershipScore * 0.20) + 
    (eventsScore * 0.30) + 
    (attendanceScore * 0.30) + 
    (projectsScore * 0.20)
  );

  return {
    score: Math.round(finalScore),
    factors: {
      membership: Math.round(membershipScore),
      events: Math.round(eventsScore),
      attendance: Math.round(attendanceScore),
      projects: Math.round(projectsScore)
    },
    raw: {
      memberCount,
      recentEventsCount: recentEvents.length,
      attendanceRate: totalExpectedAttendance > 0 ? Math.round((totalActualAttendance / totalExpectedAttendance) * 100) : 0,
      projectCount: projects.length
    }
  };
}

/**
 * Recommends clubs to a specific student based on their interests and skills.
 * @param {string} studentId 
 * @returns {Array} Array of recommended clubs with compatibility scores
 */
export function recommendClubsForStudent(studentId) {
  const db = getDB();
  const student = (db.users || []).find(u => u.id === studentId);
  if (!student) return [];

  const studentInterests = (student.interests || []).map(i => i.toLowerCase());
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const studentKeywords = [...new Set([...studentInterests, ...studentSkills])];

  const currentMemberships = (db.club_memberships || []).filter(m => m.student_id === studentId).map(m => m.club_id);

  const recommendations = db.clubs.map(club => {
    if (currentMemberships.includes(club.id)) return null; // Skip already joined

    const clubKeywords = [
      ...(club.category || '').toLowerCase().split(' '),
      ...(club.tags || []),
      ...(club.description || '').toLowerCase().split(' ')
    ];

    let matchCount = 0;
    studentKeywords.forEach(keyword => {
      if (clubKeywords.some(ck => ck.includes(keyword) || keyword.includes(ck))) {
        matchCount++;
      }
    });

    // Base score on keyword overlap. Max baseline ~ 5 matches.
    let baseScore = Math.min(100, (matchCount / 5) * 100);
    
    // Department affinity boost (+15 if same department)
    if (club.department === student.department) {
      baseScore = Math.min(100, baseScore + 15);
    }

    // Engagement penalty/bonus
    const engagement = calculateClubEngagementScore(club.id);
    if (engagement.score > 80) baseScore = Math.min(100, baseScore + 10);
    if (engagement.score < 40) baseScore = Math.max(0, baseScore - 10);

    return {
      club,
      score: Math.round(baseScore),
      reasons: [
        matchCount > 0 ? `Matches ${matchCount} of your skills/interests` : null,
        club.department === student.department ? `In your department (${student.department})` : null,
        engagement.score > 80 ? 'Highly active club' : null
      ].filter(Boolean)
    };
  }).filter(Boolean);

  // Sort by highest score
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Predicts which students are likely to participate in an upcoming event.
 * @param {string} eventId 
 * @returns {Array} Array of students and their probability score (0-100%)
 */
export function predictEventAttendance(eventId) {
  const db = getDB();
  const targetEvent = (db.events || []).find(e => e.id === eventId);
  if (!targetEvent) return [];

  const clubId = targetEvent.club_id || targetEvent.clubId;
  const clubMembers = (db.club_memberships || []).filter(m => m.club_id === clubId && m.status === 'Approved').map(m => m.student_id);
  
  // Base population to predict for: Club members + students in same department
  const population = (db.users || []).filter(u => u.role === 'Student' && (clubMembers.includes(u.id) || u.department === targetEvent.department));

  const predictions = population.map(student => {
    let probability = 30; // Baseline 30% for general population
    
    if (clubMembers.includes(student.id)) probability += 30; // +30% if member of the hosting club
    if (student.department === targetEvent.department) probability += 10; // +10% if same department

    // Check past attendance for this club's events
    const allClubEvents = (db.events || []).filter(e => (e.club_id === clubId || e.clubId === clubId) && e.id !== eventId).map(e => e.id);
    const pastAttendanceLogs = (db.attendance_logs || db.attendance || []).filter(a => a.student_id === student.id && allClubEvents.includes(a.event_id));
    
    if (pastAttendanceLogs.length > 0) {
      // High participation bonus
      probability += Math.min(25, pastAttendanceLogs.length * 5); 
    }

    // Check skill alignment with event category/title
    const studentSkills = (student.skills || []).map(s => s.toLowerCase());
    const eventText = ((targetEvent.title || '') + ' ' + (targetEvent.category || '')).toLowerCase();
    
    const skillMatch = studentSkills.some(skill => eventText.includes(skill));
    if (skillMatch) probability += 15;

    return {
      student,
      probability: Math.min(99, probability), // Cap at 99%
      factors: [
        clubMembers.includes(student.id) ? 'Club Member' : null,
        skillMatch ? 'Skill Match' : null,
        pastAttendanceLogs.length > 0 ? 'Past Attendee' : null
      ].filter(Boolean)
    };
  });

  return predictions.sort((a, b) => b.probability - a.probability);
}

/**
 * Identifies inactive members in a club and suggests re-engagement strategies.
 * @param {string} clubId 
 * @returns {Array} Array of inactive members with risk level and suggestions
 */
export function detectInactiveMembers(clubId) {
  const db = getDB();
  const members = (db.club_memberships || []).filter(m => m.club_id === clubId && m.status === 'Approved');
  
  const clubEvents = (db.events || []).filter(e => e.club_id === clubId || e.clubId === clubId).map(e => e.id);
  const attendanceLogs = (db.attendance_logs || db.attendance || []);

  const inactiveList = [];

  members.forEach(member => {
    const student = (db.users || []).find(u => u.id === member.student_id);
    if (!student) return;

    // Count how many events they attended for this club
    const attendedCount = attendanceLogs.filter(a => a.student_id === student.id && clubEvents.includes(a.event_id)).length;
    
    // Inactivity Rule: If attended 0 events when club has had > 1 event, they are at risk.
    if (attendedCount === 0 && clubEvents.length > 0) {
      let riskLevel = 'Medium';
      if (clubEvents.length >= 3) riskLevel = 'High';

      const suggestions = [];
      if (student.interests && student.interests.length > 0) {
        suggestions.push(`Invite to upcoming event related to ${student.interests[0]}`);
      } else {
        suggestions.push('Send a personalized check-in email');
      }

      inactiveList.push({
        student,
        riskLevel,
        missedEvents: clubEvents.length,
        suggestions
      });
    }
  });

  return inactiveList.sort((a, b) => b.missedEvents - a.missedEvents);
}
