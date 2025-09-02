import { useEffect, useState } from "react";

// Replace these keys with the actual fields in your ErrorPreferences
interface ErrorPreferences {
  logErrors: boolean;
  showStack: boolean;
  sendReports: boolean;
  anonymizeData: boolean;
}

// Full defaults so state always starts as a complete ErrorPreferences object
const DEFAULT_ERROR_PREFERENCES: ErrorPreferences = {
  logErrors: true,
  showStack: false,
  sendReports: true,
  anonymizeData: true,
};

export function ErrorConsentModal({
  currentPreferences,
}: {
  currentPreferences?: Partial<ErrorPreferences>;
}) {
  const [preferences, setPreferences] = useState<ErrorPreferences>(
    DEFAULT_ERROR_PREFERENCES
  );

  useEffect(() => {
    if (currentPreferences) {
      // Merge partial/unknown preferences into the full state shape
      setPreferences((prev) => ({
        ...prev,
        ...currentPreferences,
      }));
    }
  }, [currentPreferences]);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Error Reporting Preferences</h2>

      <label className="block">
        <input
          type="checkbox"
          checked={preferences.logErrors}
          onChange={(e) =>
            setPreferences((p) => ({ ...p, logErrors: e.target.checked }))
          }
        />
        Log errors locally
      </label>

      <label className="block">
        <input
          type="checkbox"
          checked={preferences.showStack}
          onChange={(e) =>
            setPreferences((p) => ({ ...p, showStack: e.target.checked }))
          }
        />
        Show error stack traces
      </label>

      <label className="block">
        <input
          type="checkbox"
          checked={preferences.sendReports}
          onChange={(e) =>
            setPreferences((p) => ({ ...p, sendReports: e.target.checked }))
          }
        />
        Send error reports
      </label>

      <label className="block">
        <input
          type="checkbox"
          checked={preferences.anonymizeData}
          onChange={(e) =>
            setPreferences((p) => ({
              ...p,
              anonymizeData: e.target.checked,
            }))
          }
        />
        Anonymize data
      </label>
    </div>
  );
}
