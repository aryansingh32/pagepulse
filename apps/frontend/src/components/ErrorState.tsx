import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-xl animate-fade-up" role="alert" aria-live="assertive">
      <Card className="border-danger/30 bg-danger/5">
        <CardContent className="flex items-start gap-3 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Couldn&rsquo;t analyze that page</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
