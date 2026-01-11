'use client';

import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface EvidenceItem {
    type: string;
    label: string;
    evidence: string;
}

interface EvidenceDrawerProps {
    items: EvidenceItem[];
}

export function EvidenceDrawer({ items }: EvidenceDrawerProps) {
    const [open, setOpen] = useState(false);

    if (items.length === 0) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    View Evidence ({items.length})
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[500px] sm:max-w-[540px]">
                <SheetHeader>
                    <SheetTitle>Evidence Snippets</SheetTitle>
                    <SheetDescription>
                        Raw extraction evidence from crawled pages
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
                    <div className="space-y-4 pr-4">
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-border bg-muted/30 p-4"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <Badge variant="outline">{item.type}</Badge>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {item.evidence}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
