/**
 * Server wrapper that fetches ticker data and renders the client ticker.
 * Placed in the layout so data is fetched once at render time.
 */
import { getTickerItems } from '@/lib/ticker';
import { LiveNewsTicker } from './live-news-ticker';

export async function TickerWrapper() {
    const items = await getTickerItems();
    return <LiveNewsTicker items={items} speed={35} />;
}
