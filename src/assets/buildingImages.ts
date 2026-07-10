import heroMirageRosetum from "@/imports/Html→Body/802508c1931f7b8ef7bc4228b212c61fa12bd822.png";
import archiveAuraBlakely from "@/imports/Html→Body/d28f761a8cefeca796f5b93b78eb6f8d9382dc95.png";
import parkviewModernizen from "@/imports/Html→Body/2b4b60ff67008b613a401e36253a63b33312cdfe.png";
import luminaZurana from "@/imports/Html→Body/f8dae4958de44fa3806cbffc559947033e170bc6.png";

/** Bundled imports for Vite-optimized frontend rendering */
export const BUILDING_IMAGES = {
  hero: heroMirageRosetum,
  archiveResidenceI: archiveAuraBlakely,
  parkviewCoOp: parkviewModernizen,
  luminaEstate: luminaZurana,
  projects: [archiveAuraBlakely, parkviewModernizen, luminaZurana] as const,
  gallery: [heroMirageRosetum, archiveAuraBlakely, parkviewModernizen, luminaZurana] as const,
} as const;

/** Public URLs for CMS / API / database seeding */
export const BUILDING_IMAGE_URLS = {
  hero: "/images/estate/hero-mirage-rosetum.png",
  archiveResidenceI: "/images/estate/archive-residence-aura-blakely.png",
  parkviewCoOp: "/images/estate/parkview-modernizen.png",
  luminaEstate: "/images/estate/lumina-zurana.png",
  exploreCard: "/images/estate/parkview-modernizen.png",
  howItWorksCard: "/images/estate/lumina-zurana.png",
  projects: [
    "/images/estate/archive-residence-aura-blakely.png",
    "/images/estate/parkview-modernizen.png",
    "/images/estate/lumina-zurana.png",
  ] as const,
} as const;

export const BUILDING_IMAGE_META = {
  hero: { alt: "The Mirage Rosetum — Estate Archive flagship residence", name: "The Mirage Rosetum" },
  archiveResidenceI: { alt: "Aura Blakely — The Archive Residence I", name: "Aura Blakely" },
  parkviewCoOp: { alt: "Modernizen — Parkview Co-Op", name: "Modernizen" },
  luminaEstate: { alt: "The Zurana — Lumina Estate", name: "The Zurana" },
} as const;

export function resolveProjectHeroImage(
  heroImage: string | null | undefined,
  index: number,
): string {
  if (heroImage) return heroImage;
  return BUILDING_IMAGES.projects[index % BUILDING_IMAGES.projects.length];
}

export function resolveProjectHeroUrl(
  heroImage: string | null | undefined,
  index: number,
): string {
  if (heroImage) return heroImage;
  return BUILDING_IMAGE_URLS.projects[index % BUILDING_IMAGE_URLS.projects.length];
}

export function resolveCmsImageUrl(
  imageUrl: string | undefined,
  fallback: string = BUILDING_IMAGES.hero,
): string {
  if (!imageUrl) return fallback;
  if (imageUrl.startsWith("/") || imageUrl.startsWith("http")) return imageUrl;
  return fallback;
}
