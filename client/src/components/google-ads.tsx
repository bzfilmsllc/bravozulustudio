import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Zap } from "lucide-react";

interface UserBilling {
  subscription: {
    status: string;
    planName: string;
    expiresAt: string;
    isSuperUser?: boolean;
  } | null;
}

interface GoogleAdsProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  style?: React.CSSProperties;
  className?: string;
}

export function GoogleAds({ slot, format = "auto", style, className }: GoogleAdsProps) {
  const adRef = useRef<HTMLDivElement>(null);
  
  // Check user subscription status
  const { data: billingInfo } = useQuery<UserBilling>({
    queryKey: ['/api/billing/subscription-status'],
  });

  const hasActiveSubscription = billingInfo?.subscription?.status === 'active';
  const isSuperUser = billingInfo?.subscription?.isSuperUser === true;

  useEffect(() => {
    // Only load ads if user doesn't have active subscription and is not a super user
    if (!hasActiveSubscription && !isSuperUser && adRef.current) {
      try {
        // Load Google AdSense script if not already loaded
        if (!window.adsbygoogle) {
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID';
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Initialize ad
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('Error loading Google Ads:', error);
      }
    }
  }, [hasActiveSubscription, isSuperUser, slot]);

  // Don't render ads for premium subscribers or super users
  if (hasActiveSubscription || isSuperUser) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="bg-slate-900/50 border-slate-600/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            Advertisement
          </Badge>
          <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-600/50">
            <Zap className="w-3 h-3 mr-1" />
            Remove with Premium
          </Badge>
        </div>
        
        <div ref={adRef} style={style}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-YOUR_ADSENSE_ID"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      </Card>
    </div>
  );
}

// Banner ad component for top of pages
export function BannerAd({ className }: { className?: string }) {
  return (
    <GoogleAds
      slot="1234567890"
      format="horizontal"
      className={className}
      style={{ minHeight: '90px' }}
    />
  );
}

// Sidebar ad component
export function SidebarAd({ className }: { className?: string }) {
  return (
    <GoogleAds
      slot="0987654321"
      format="vertical"
      className={className}
      style={{ minHeight: '250px', maxWidth: '300px' }}
    />
  );
}

// Inline content ad
export function InlineAd({ className }: { className?: string }) {
  return (
    <GoogleAds
      slot="1122334455"
      format="rectangle"
      className={className}
      style={{ minHeight: '250px' }}
    />
  );
}

// Video ad placeholder (for future integration)
export function VideoAd({ className }: { className?: string }) {
  const { data: billingInfo } = useQuery<UserBilling>({
    queryKey: ['/api/billing/subscription-status'],
  });

  const hasActiveSubscription = billingInfo?.subscription?.status === 'active';

  if (hasActiveSubscription) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="bg-slate-900/50 border-slate-600/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            Video Advertisement
          </Badge>
          <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-600/50">
            <Zap className="w-3 h-3 mr-1" />
            Skip with Premium
          </Badge>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
          <div className="text-slate-400">
            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-slate-400 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
            </div>
            <p className="text-sm">Video Ad</p>
            <p className="text-xs mt-1">Upgrade to Premium to remove ads</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Bottom Ad Component - Elegant and Unobtrusive
export function BottomAd({ className }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  
  const { data: billingInfo } = useQuery<UserBilling>({
    queryKey: ['/api/billing/subscription-status'],
  });

  const hasActiveSubscription = billingInfo?.subscription?.status === 'active';
  const isSuperUser = billingInfo?.subscription?.isSuperUser === true;

  useEffect(() => {
    // Only load ads if user doesn't have active subscription and is not a super user
    if (!hasActiveSubscription && !isSuperUser && adRef.current) {
      try {
        // Load Google AdSense script if not already loaded
        if (!window.adsbygoogle) {
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID';
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Initialize ad
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('Error loading Google Ads:', error);
      }
    }
  }, [hasActiveSubscription, isSuperUser]);

  // Don't render ads for premium subscribers or super users
  if (hasActiveSubscription || isSuperUser) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Elegant separator line */}
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
        <div className="px-4">
          <Badge variant="outline" className="text-xs text-slate-400 border-slate-600/50 bg-tactical-black/50">
            <Zap className="w-3 h-3 mr-1" />
            Advertisement
          </Badge>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
      </div>

      {/* Ad container with sophisticated styling */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-tactical-black/60 to-slate-900/40 border-honor-gold/20 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-honor-gold rounded-full animate-pulse"></div>
                <span className="font-tactical text-xs text-slate-300 tracking-wider">SPONSORED CONTENT</span>
              </div>
              <Badge variant="outline" className="text-xs text-honor-gold/70 hover:text-honor-gold border-honor-gold/30">
                Remove with Premium
              </Badge>
            </div>
            
            <div ref={adRef} style={{ minHeight: '120px', width: '100%' }}>
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-YOUR_ADSENSE_ID"
                data-ad-slot="9876543210"
                data-ad-format="horizontal"
                data-full-width-responsive="true"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom fade effect */}
      <div className="mt-6 h-8 bg-gradient-to-b from-transparent to-tactical-black/30 pointer-events-none"></div>
    </div>
  );
}

declare global {
  interface Window {
    adsbygoogle: any;
  }
}