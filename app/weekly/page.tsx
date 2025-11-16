'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, startOfWeek } from 'date-fns';

interface WeeklyInsight {
  id: string;
  week: string;
  summary: string;
  insights: {
    themes: string[];
    emotionalTrends: string;
    highlights: string[];
    reflection: string;
  };
  created_at: string;
}

export default function WeeklyPage() {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyInsight();
  }, []);

  const fetchWeeklyInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weekly');
      if (!response.ok) throw new Error('Failed to fetch weekly insight');

      const data = await response.json();
      setInsight(data.insight);
    } catch (err) {
      console.error('Error fetching weekly insight:', err);
      setError('Failed to load weekly review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const weekStart = insight 
    ? format(new Date(insight.week), 'MMMM d, yyyy')
    : format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMMM d, yyyy');

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent-DEFAULT rounded-full animate-spin"></div>
        <p className="mt-4 text-wood-600">Generating your weekly review...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchWeeklyInsight}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-wood-600 text-lg">No weekly insight available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-wood-800 mb-2">
          Weekly Review
        </h1>
        <p className="text-wood-600">
          Week of {weekStart}
        </p>
      </div>

      {/* Summary */}
      <div className="card mb-6">
        <h2 className="text-2xl font-serif font-semibold text-wood-800 mb-4">
          Overview
        </h2>
        <p className="text-wood-700 leading-relaxed">
          {insight.summary}
        </p>
      </div>

      {/* Themes */}
      {insight.insights?.themes && insight.insights.themes.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-serif font-semibold text-wood-800 mb-4">
            Top Themes
          </h2>
          <ul className="space-y-2">
            {insight.insights.themes.map((theme, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-accent-DEFAULT mr-3 text-xl">•</span>
                <span className="text-wood-700">{theme}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emotional Trends */}
      {insight.insights?.emotionalTrends && (
        <div className="card mb-6">
          <h2 className="text-2xl font-serif font-semibold text-wood-800 mb-4">
            Emotional Trends
          </h2>
          <p className="text-wood-700 leading-relaxed">
            {insight.insights.emotionalTrends}
          </p>
        </div>
      )}

      {/* Highlights */}
      {insight.insights?.highlights && insight.insights.highlights.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-serif font-semibold text-wood-800 mb-4">
            Highlight Cards
          </h2>
          <ul className="space-y-3">
            {insight.insights.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-accent-DEFAULT mr-3 font-bold text-lg">
                  {idx + 1}
                </span>
                <span className="text-wood-700">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reflection */}
      {insight.insights?.reflection && (
        <div className="card bg-wood-50 border-wood-300">
          <h2 className="text-2xl font-serif font-semibold text-wood-800 mb-4">
            Weekly Reflection
          </h2>
          <p className="text-wood-700 leading-relaxed text-lg italic">
            {insight.insights.reflection}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-center">
        <Link href="/cards" className="btn-secondary">
          View All Cards
        </Link>
      </div>
    </div>
  );
}

