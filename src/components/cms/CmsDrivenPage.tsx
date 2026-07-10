import { useQuery } from "@tanstack/react-query";
import { fetchPublicPageLayout } from "@/services/pageLayoutApi";
import { CmsPageView, useCmsByKey } from "@/components/cms/CmsSectionRenderer";

interface CmsDrivenPageProps {
  slug: string;
  fallback: React.ReactNode;
}

export default function CmsDrivenPage({ slug, fallback }: CmsDrivenPageProps) {
  const cmsByKey = useCmsByKey();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ["cms-page", slug],
    queryFn: () => fetchPublicPageLayout(slug),
    retry: 1,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="w-full py-[120px] flex items-center justify-center">
        <span className="font-['Inter'] text-[11px] tracking-[2px] uppercase text-[#4d4635]">Loading…</span>
      </div>
    );
  }

  if (isError || !page?.sections?.length) {
    return <>{fallback}</>;
  }

  return (
    <CmsPageView
      sections={page.sections}
      ctx={{ cmsByKey, preview: false }}
    />
  );
}
