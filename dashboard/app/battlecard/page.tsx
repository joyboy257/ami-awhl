import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BattlecardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Battlecards</h1>
                <p className="text-muted-foreground">
                    Select a clinic from the Market Map to view its detailed battlecard
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Clinic Selection</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Click on a clinic in the Market Map to view its full competitive profile.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
