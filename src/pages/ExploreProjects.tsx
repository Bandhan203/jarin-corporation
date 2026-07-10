import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/services/projectsApi";
import { resolveProjectHeroImage } from "@/assets/buildingImages";
import FundingBar from "@/components/public/FundingBar";
import CostEstimator from "@/components/public/CostEstimator";
import PublicFooter from "@/components/public/PublicFooter";
import CmsDrivenPage from "@/components/cms/CmsDrivenPage";

function ExploreFallback() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: apiProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const locations = useMemo(
    () => [...new Set(apiProjects.map((p) => p.location))].sort(),
    [apiProjects],
  );

  const projects = useMemo(() => {
    const mapped = apiProjects.map((p, index) => ({
      id: p.id,
      img: resolveProjectHeroImage(p.heroImage, index),
      location: p.location,
      locationLabel: p.location.toUpperCase(),
      name: p.title,
      price: p.displayPrice ?? "—",
      sft: p.displaySft ?? "—",
      percent: Math.round(p.fundingPercentage),
      remaining: `${p.availableShares} SHARES REMAINING`,
      phaseLabel: p.phaseLabel,
    }));

    return mapped.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = locationFilter === "all" || p.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [apiProjects, search, locationFilter]);

  const avgFunded = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.percent, 0) / projects.length)
    : 0;

  return (
    <div className="flex flex-col items-start w-full bg-[#f9f9f9]">
      <div className="relative w-full bg-white border-b border-[#eee]">
        <div className="flex flex-col gap-[24px] items-start p-[64px]">
          <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[10px] tracking-[3px] uppercase leading-[15px]">PROJECT PORTFOLIO</span>
          <div className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[40px] tracking-[-0.8px] leading-[44px] max-w-[720px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>Explore Active Co-operative Ventures</div>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] leading-[24px] max-w-[640px]">Browse vetted land-share projects, compare funding progress, and reserve units at institutional pricing.</p>
          <div className="flex flex-wrap gap-[32px] pt-[8px]">
            <div className="flex flex-col gap-[4px]"><span className="font-['Inter'] text-[10px] tracking-[2px] uppercase text-[#4d4635]">Open Projects</span><span className="font-['Noto_Serif'] text-[24px] text-[#1a1c1c]">{apiProjects.length}</span></div>
            <div className="flex flex-col gap-[4px]"><span className="font-['Inter'] text-[10px] tracking-[2px] uppercase text-[#4d4635]">Avg. Funded</span><span className="font-['Noto_Serif'] text-[24px] text-[#735c00]">{avgFunded}%</span></div>
            <div className="flex flex-col gap-[4px]"><span className="font-['Inter'] text-[10px] tracking-[2px] uppercase text-[#4d4635]">Locations</span><span className="font-['Noto_Serif'] text-[24px] text-[#1a1c1c]">{locations.length}</span></div>
          </div>
        </div>
      </div>
      <div className="w-full px-[64px] py-[32px]">
        <div className="flex flex-col md:flex-row gap-[16px] md:items-center md:justify-between w-full">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by project name or location…" className="flex-1 max-w-[480px] px-[16px] py-[12px] bg-white border border-[#e2e2e2] font-['Inter'] text-[14px] text-[#1a1c1c] outline-none focus:border-[#735c00]" />
          <div className="flex gap-[8px] flex-wrap">
            <button onClick={() => setLocationFilter("all")} className="px-[16px] py-[8px] text-[10px] tracking-[1.5px] uppercase cursor-pointer" style={{ background: locationFilter === "all" ? "#1a1c1c" : "white", color: locationFilter === "all" ? "white" : "#4d4635", border: "1px solid #e2e2e2" }}>All Locations</button>
            {locations.map((loc) => (
              <button key={loc} onClick={() => setLocationFilter(loc)} className="px-[16px] py-[8px] text-[10px] tracking-[1.5px] uppercase cursor-pointer" style={{ background: locationFilter === loc ? "#1a1c1c" : "white", color: locationFilter === loc ? "white" : "#4d4635", border: "1px solid #e2e2e2" }}>{loc}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#f9f9f9] relative w-full">
        <div className="flex flex-col gap-[48px] items-start p-[64px]">
          {projectsLoading && <span className="font-['Inter'] text-[12px] tracking-[2px] uppercase text-[#4d4635]">Loading projects…</span>}
          {!projectsLoading && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[48px] w-full">
              {projects.map((p) => (
                <button key={p.id} onClick={() => navigate(`/project/${p.id}`)} className="flex flex-col gap-[8px] items-start cursor-pointer text-left group">
                  <div className="bg-[#eee] relative shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)] w-full overflow-hidden">
                    <div className="h-[360px] relative w-full"><img alt={p.name} className="absolute h-full left-[-64.7%] max-w-none top-0 w-[229.39%] object-cover group-hover:scale-[1.02] transition-transform duration-500" src={p.img} /><div className="absolute inset-0 bg-white mix-blend-saturation pointer-events-none" /></div>
                  </div>
                  <div className="font-['Noto_Serif'] text-[#1a1c1c] text-[16px] pt-[16px]">{p.name}</div>
                  <FundingBar percent={p.percent} label={`${p.percent}% Funded`} remaining={p.remaining} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <CostEstimator />
      <PublicFooter />
    </div>
  );
}

export default function ExploreProjects() {
  return <CmsDrivenPage slug="explore" fallback={<ExploreFallback />} />;
}
