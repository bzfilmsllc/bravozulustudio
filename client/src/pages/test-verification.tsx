import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";

export default function TestVerification() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data directly
    fetch('/api/auth/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('User data:', data);
        setUserData(data);
        setUserRole(data.role);
        setLoading(false);
      })
      .catch(err => {
        console.log('Fetch failed:', err);
        setUserRole('error');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h1 className="text-3xl font-bold mb-6">Verification Status Test</h1>
            
            <div className="space-y-4">
              <div>
                <strong>User Role:</strong> {userRole || 'None'}
              </div>
              
              <div>
                <strong>Is Verified:</strong> {userRole === 'verified' ? '✅ YES' : '❌ NO'}
              </div>
              
              <div>
                <strong>User Data:</strong>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
              
              {userRole === 'verified' && (
                <div className="mt-8 p-6 bg-green-100 dark:bg-green-900 rounded-lg">
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                    🎉 Verification Complete!
                  </h2>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    You are successfully verified as a military veteran. You should have access to all AI script generation features.
                  </p>
                  <a 
                    href="/tools" 
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    Access AI Tools
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}