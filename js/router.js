

    case "#/roadmaps":
      mountPoint.innerHTML = renderRoadmapsView(params);
      attachRoadmapsEvents();
      break;
    case "#/tools":
      mountPoint.innerHTML = renderToolsDirectoryView();
      attachToolsDirectoryEvents();
      break;
    case "#/gallery":
      mountPoint.innerHTML = renderGalleryView();
      attachGalleryEvents();
      break;
    case "#/announcements":
      mountPoint.innerHTML = renderAnnouncementsView();
      attachAnnouncementsEvents();
      break;
    case "#/membership-card":
      mountPoint.innerHTML = renderMembershipCardView();
      attachMembershipCardEvents();
      break;
    case "#/student-profile":
      mountPoint.innerHTML = renderStudentProfileView();
      attachStudentProfileEvents();
      break;
    case "#/analytics":
      mountPoint.innerHTML = renderAnalyticsView();
      attachAnalyticsEvents();
      break;
    case "#/admin":
      mountPoint.innerHTML = renderAdminView();
      attachAdminEvents();
      break;
    case "#/reports":
      mountPoint.innerHTML = renderReportsView();
      attachReportsEvents();
      break;
    case "#/verify":
      mountPoint.innerHTML = renderVerificationView(params);
      attachVerificationEvents();
      break;
    default:
      mountPoint.innerHTML = renderHomeView();
      break;
  }
}
