import { useEffect } from 'react';

export function EmergencyFix() {
  useEffect(() => {
    // Emergency fix to remove any verification modals
    const removeVerificationModals = () => {
      // Remove any elements containing verification text
      const modals = document.querySelectorAll('[role="dialog"], .modal, .popup');
      modals.forEach(modal => {
        const text = modal.textContent?.toLowerCase() || '';
        if (text.includes('verification') || text.includes('verified') || text.includes('military')) {
          modal.remove();
          console.log('🚫 REMOVED VERIFICATION MODAL!');
        }
      });

      // Remove any overlay elements
      const overlays = document.querySelectorAll('.overlay, .backdrop, [data-radix-portal]');
      overlays.forEach(overlay => {
        const text = overlay.textContent?.toLowerCase() || '';
        if (text.includes('verification') || text.includes('verified')) {
          overlay.remove();
          console.log('🚫 REMOVED VERIFICATION OVERLAY!');
        }
      });
    };

    // Run immediately
    removeVerificationModals();

    // Run every 100ms to catch dynamic content
    const interval = setInterval(removeVerificationModals, 100);

    return () => clearInterval(interval);
  }, []);

  return null;
}