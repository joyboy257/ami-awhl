'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        console.error('Dashboard error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-danger">
                        <AlertTriangle className="h-5 w-5" />
                        Something went wrong
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        {error.message || 'An unexpected error occurred while loading this page.'}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
                    )}
                    <Button onClick={reset} variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
