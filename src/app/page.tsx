/**
 * Home page — "Next Up" dashboard.
 * Shows next prayer countdown, next event, latest announcement, activities carousel.
 */
import { getTodayPrayerTimes, getIqamahSettings } from '@/actions/prayer';
import { getEvents } from '@/actions/events';
import { getAnnouncements } from '@/actions/announcements';
import { NextPrayerCard } from '@/components/home/next-prayer-card';
import { NextEventCard } from '@/components/home/next-event-card';
import { AnnouncementBanner } from '@/components/home/announcement-banner';
import { ActivitiesCarousel } from '@/components/home/activities-carousel';
import { QuickActions } from '@/components/home/quick-actions';
import { PageViewTracker } from '@/components/page-view-tracker';
import { QrScanTracker } from '@/components/qr-scan-tracker';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [prayerResult, iqamahResult, eventsResult, announcementsResult] = await Promise.all([
    getTodayPrayerTimes(),
    getIqamahSettings(),
    getEvents(),
    getAnnouncements(),
  ]);

  const allEvents = eventsResult.data || [];
  const nextEvent = allEvents[0] || null;
  const latestAnnouncement = announcementsResult.data?.[0] || null;

  return (
    <div className="space-y-4">
      <PageViewTracker />
      <Suspense><QrScanTracker /></Suspense>

      {/* Next Prayer Countdown */}
      <NextPrayerCard
        prayerTimes={prayerResult.data}
        iqamahSettings={iqamahResult.data}
      />

      {/* Latest Announcement */}
      {latestAnnouncement && (
        <AnnouncementBanner announcement={latestAnnouncement} />
      )}

      {/* Activities Carousel */}
      <ActivitiesCarousel events={allEvents} />

      {/* Quick Actions Grid */}
      <QuickActions />
    </div>
  );
}

