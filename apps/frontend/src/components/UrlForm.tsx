import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeFormSchema, type AnalyzeFormValues } from "@/lib/validation";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalyzeFormValues>({
    resolver: zodResolver(analyzeFormSchema),
    defaultValues: { url: "" },
    mode: "onSubmit",
  });

  const submit = handleSubmit((values) => onSubmit(values.url.trim()));

  return (
    <form onSubmit={submit} noValidate className="mx-auto w-full max-w-xl">
      <div className="glass-strong rounded-xl p-2 sm:p-2.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="url-input" className="sr-only">
              Website URL
            </Label>
            <Input
              id="url-input"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com"
              disabled={isLoading}
              aria-invalid={errors.url ? "true" : "false"}
              aria-describedby={errors.url ? "url-error" : undefined}
              className="h-12 border-none bg-transparent px-4 focus-visible:ring-1"
              {...register("url")}
            />
          </div>
          <Button type="submit" size="lg" disabled={isLoading} className="sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing&hellip;
              </>
            ) : (
              <>
                <ScanSearch className="h-4 w-4" aria-hidden="true" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>
      <p id="url-error" role="alert" aria-live="polite" className="mt-2 min-h-[1.25rem] pl-1 text-sm text-danger">
        {errors.url?.message ?? ""}
      </p>
    </form>
  );
}
