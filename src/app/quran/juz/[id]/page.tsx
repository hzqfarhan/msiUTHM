import { JuzReader } from '@/components/quran/juz-reader';

export function generateStaticParams() {
    return Array.from({ length: 30 }, (_, i) => ({
        id: (i + 1).toString(),
    }));
}

export default async function JuzPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const juzId = parseInt(id, 10);

    return (
        <div className="container max-w-3xl py-6 pb-24 space-y-6">
            <JuzReader juzNumber={juzId} />
        </div>
    );
}

export const dynamicParams = false;
