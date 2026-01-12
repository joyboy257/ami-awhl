'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function Tooltip({ content, children, showIcon = true }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 10, // Position above the element
        left: rect.left + rect.width / 2,
      });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipContent = isVisible && mounted && (
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 99999,
      }}
      className="px-3 py-2 text-sm font-medium leading-relaxed bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg min-w-[200px] max-w-[300px] whitespace-normal text-left"
    >
      {content}
      {/* Arrow pointing down */}
      <div
        style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          width: 10,
          height: 10,
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
        }}
      />
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex items-center gap-1 cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {showIcon && (
          <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </span>
      {mounted && typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}

// Predefined metric tooltips for consistency across the app
export const MetricTooltips = {
  // Keywords & SERP
  tierA: "Tier A: High-intent commercial searches with strong buying signals (e.g., 'singapore facial price', 'best tcm clinic'). These drive conversions.",
  tierB: "Tier B: Location-based or service-specific searches (e.g., 'acupuncture orchard', 'beauty clinic CBD'). Good for local visibility.",
  tierC: "Tier C: Informational or broad searches (e.g., 'what is acupuncture'). Useful for awareness but lower conversion intent.",
  rankPosition: "The average position this domain appears in Google search results for tracked keywords. Lower is better (1 = top result).",

  // Market Map & Scoring
  competitorScore: "Overall competitive strength score (0-100) calculated from: page count (25%), CTA quality (25%), offer diversity (25%), and keyword coverage (25%).",
  pageCount: "Total number of indexed pages discovered from this domain's sitemap. More pages generally indicate more content depth.",

  // Offers & Pricing
  offerType: "Categories of promotional offers: Trial (first-time discounts), Package (bundled services), Seasonal (time-limited), or Membership (recurring benefits).",
  priceRange: "Price tier classification: $ (<$50), $$ ($50-150), $$$ ($150-300), $$$$ (>$300) based on extracted pricing signals.",

  // CTAs
  ctaType: "Call-to-action types: WhatsApp (direct messaging), Phone (call buttons), Form (contact forms), Book (appointment scheduling).",
  ctaScore: "Quality score for calls-to-action based on visibility, placement, and conversion optimization best practices.",

  // Change Radar
  eventType: "Types of detected changes: New Page (content added), Price Change (pricing updated), New Offer (promotion added), CTA Change (contact method updated).",

  // Data Health
  freshness: "Percentage of data updated within the last 7 days. Higher freshness means more reliable competitive intelligence.",
  coverage: "Percentage of tracked domains with complete data (pages, offers, CTAs). Higher coverage means fewer blind spots.",

  // AWHL Brands
  avgScore: "Average competitive score across all AWHL brands. Benchmark against market average to gauge performance.",
  keywordsTracked: "Total unique keywords being monitored for AWHL brands in Google search results.",
};


// Helper component for labeled metrics with tooltips
interface MetricLabelProps {
  label: string;
  tooltip: string;
  children?: React.ReactNode;
}

export function MetricLabel({ label, tooltip, children }: MetricLabelProps) {
  return (
    <div className="flex flex-col gap-1">
      <Tooltip content={tooltip}>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      </Tooltip>
      {children}
    </div>
  );
}
