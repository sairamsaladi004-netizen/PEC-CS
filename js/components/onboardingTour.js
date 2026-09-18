// Interactive Onboarding Tour Component
// Provides role-specific guided tours for dashboard navigation.

export function initOnboardingTour(userRole) {
  const tourKey = `hasSeenTour_${userRole}`;
  if (localStorage.getItem(tourKey)) return;

  const tours = {
    "Super Admin": [
      { element: "#admin-nav-dashboard", title: "Dashboard Overview", text: "Welcome! Here you can monitor overall institutional engagement." },
      { element: "#admin-nav-analytics", title: "Analytics & Reports", text: "Explore deep-dive metrics on student participation and club performance." },
      { element: "#admin-nav-audit", title: "System Audit Logs", text: "Track all administrative actions and system events here." }
    ],
    "Student": [
      { element: "#student-nav-dashboard", title: "Your Dashboard", text: "See your personalized engagement stats and attendance trends." },
      { element: "#student-nav-profile", title: "Badge Studio", text: "Manage your digital club member badges and attendance QR passes." },
      { element: "#student-nav-recommendations", title: "Club Recommendations", text: "Discover new clubs tailored to your skills and interests." }
    ]
  };

  const steps = tours[userRole] || [];
  if (steps.length === 0) return;

  let currentStep = 0;

  function showStep() {
    const step = steps[currentStep];
    const target = document.querySelector(step.element);
    
    // Create Tour Modal
    const modal = document.createElement('div');
    modal.id = 'onboarding-tour-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4">
        <h3 class="text-xl font-black text-slate-900">${step.title}</h3>
        <p class="text-sm text-slate-600">${step.text}</p>
        <div class="flex justify-between items-center pt-4">
          <span class="text-xs font-mono text-slate-400">Step ${currentStep + 1} of ${steps.length}</span>
          <button id="next-tour-btn" class="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700">
            ${currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('next-tour-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      currentStep++;
      if (currentStep < steps.length) {
        showStep();
      } else {
        localStorage.setItem(tourKey, 'true');
      }
    });
  }

  showStep();
}
