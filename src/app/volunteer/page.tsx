/**
 * Volunteer page — list opportunities and sign up.
 */
import { getVolunteerOpportunities } from '@/actions/volunteer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';
import { VolunteerSignupButton } from '@/components/volunteer/signup-button';
import { PageViewTracker } from '@/components/page-view-tracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sukarelawan',
    description: 'Peluang sukarelawan di Masjid Sultan Ibrahim, UTHM',
};

export default async function VolunteerPage() {
    const { data: opportunities, error } = await getVolunteerOpportunities();

    return (
        <div className="space-y-4">
            <PageViewTracker />
            <div>
                <h1 className="text-xl font-bold">Sukarelawan</h1>
                <p className="text-sm text-muted-foreground">Jom sertai aktiviti sukarelawan MSI!</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {!opportunities?.length && !error && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Tiada peluang sukarelawan buat masa ini</p>
                        <p className="text-xs mt-1">Sila semak semula nanti.</p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {opportunities?.map((opp) => (
                    <Card key={opp.id} className="border-border/50">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-sm">{opp.title}</h3>
                                    {opp.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{opp.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        {opp.slots_needed && (
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                {opp.slots_needed} slot
                                            </Badge>
                                        )}
                                        {opp.deadline && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Tarikh akhir: {new Date(opp.deadline).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', timeZone: 'Asia/Kuala_Lumpur' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <VolunteerSignupButton opportunityId={opp.id} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
