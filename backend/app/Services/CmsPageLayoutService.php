<?php

namespace App\Services;

use App\Models\CmsBlock;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\DynamicCmsSetting;
use Illuminate\Support\Facades\DB;

class CmsPageLayoutService
{
    private const IMG_HERO = '/images/estate/hero-mirage-rosetum.png';
    private const IMG_ARCHIVE = '/images/estate/archive-residence-aura-blakely.png';
    private const IMG_PARKVIEW = '/images/estate/parkview-modernizen.png';
    private const IMG_LUMINA = '/images/estate/lumina-zurana.png';

    /** @return list<string> */
    public function defaultSlugs(): array
    {
        return array_column($this->getDefaultPages(), 'slug');
    }

    public function hasDefaultLayout(string $slug): bool
    {
        return in_array($slug, $this->defaultSlugs(), true);
    }

    public function seedAll(): void
    {
        foreach ($this->getDefaultPages() as $pageData) {
            $this->upsertPageLayout($pageData);
        }
    }

    public function resetPageById(int $id): ?CmsPage
    {
        $page = CmsPage::find($id);
        if (! $page || ! $this->hasDefaultLayout($page->slug)) {
            return null;
        }

        $pageData = collect($this->getDefaultPages())->firstWhere('slug', $page->slug);
        if (! $pageData) {
            return null;
        }

        return $this->replacePageLayout($page, $pageData);
    }

    public function resetAll(): void
    {
        foreach ($this->getDefaultPages() as $pageData) {
            $page = CmsPage::where('slug', $pageData['slug'])->first();
            if ($page) {
                $this->replacePageLayout($page, $pageData);
            } else {
                $this->upsertPageLayout($pageData);
                $this->syncDynamicSettingsFromPageData($pageData);
            }
        }
    }

    private function replacePageLayout(CmsPage $page, array $pageData): CmsPage
    {
        return DB::transaction(function () use ($page, $pageData) {
            $page->sections()->delete();

            $page->update([
                'title'        => $pageData['title'],
                'path'         => $pageData['path'],
                'sort_order'   => $pageData['sort_order'],
                'is_published' => true,
            ]);

            $this->createSectionsAndBlocks($page, $pageData['sections']);
            $this->syncDynamicSettingsFromPageData($pageData);

            return $page->fresh(['sections.blocks']);
        });
    }

    private function upsertPageLayout(array $pageData): CmsPage
    {
        $page = CmsPage::updateOrCreate(
            ['slug' => $pageData['slug']],
            [
                'title'        => $pageData['title'],
                'path'         => $pageData['path'],
                'sort_order'   => $pageData['sort_order'],
                'is_published' => true,
            ]
        );

        foreach ($pageData['sections'] as $sIdx => $sectionData) {
            $section = CmsSection::updateOrCreate(
                ['page_id' => $page->id, 'slug' => $sectionData['slug']],
                [
                    'title'      => $sectionData['title'],
                    'type'       => $sectionData['type'],
                    'sort_order' => $sIdx,
                    'settings'   => [],
                    'is_visible' => true,
                ]
            );

            foreach ($sectionData['blocks'] as $bIdx => $blockData) {
                CmsBlock::updateOrCreate(
                    [
                        'section_id' => $section->id,
                        'label'      => $blockData['label'],
                    ],
                    [
                        'type'       => $blockData['type'],
                        'content'    => $blockData['content'],
                        'sort_order' => $bIdx,
                        'is_visible' => true,
                    ]
                );
            }
        }

        return $page->fresh(['sections.blocks']);
    }

    private function createSectionsAndBlocks(CmsPage $page, array $sections): void
    {
        foreach ($sections as $sIdx => $sectionData) {
            $section = CmsSection::create([
                'page_id'    => $page->id,
                'slug'       => $sectionData['slug'],
                'title'      => $sectionData['title'],
                'type'       => $sectionData['type'],
                'sort_order' => $sIdx,
                'settings'   => [],
                'is_visible' => true,
            ]);

            foreach ($sectionData['blocks'] as $bIdx => $blockData) {
                CmsBlock::create([
                    'section_id' => $section->id,
                    'type'       => $blockData['type'],
                    'label'      => $blockData['label'],
                    'content'    => $blockData['content'],
                    'sort_order' => $bIdx,
                    'is_visible' => true,
                ]);
            }
        }
    }

    private function syncDynamicSettingsFromPageData(array $pageData): void
    {
        foreach ($pageData['sections'] as $section) {
            foreach ($section['blocks'] as $block) {
                $cmsKey = $block['content']['cmsKey'] ?? null;
                $text = $block['content']['text'] ?? null;

                if (! $cmsKey || $text === null) {
                    continue;
                }

                DynamicCmsSetting::updateOrCreate(
                    ['key' => $cmsKey],
                    [
                        'group'      => $this->groupForCmsKey($cmsKey),
                        'type'       => 'text',
                        'value'      => $text,
                        'updated_by' => 'system',
                    ]
                );
            }
        }
    }

    private function groupForCmsKey(string $key): string
    {
        if (str_starts_with($key, 'hero_')) {
            return 'Hero';
        }
        if (str_starts_with($key, 'footer_')) {
            return 'Footer';
        }

        return 'Homepage';
    }

    /** @return list<array<string, mixed>> */
    private function getDefaultPages(): array
    {
        return [
            [
                'slug' => 'home',
                'title' => 'Home',
                'path' => '/',
                'sort_order' => 0,
                'sections' => [
                    [
                        'slug' => 'hero',
                        'title' => 'Hero',
                        'type' => 'hero',
                        'blocks' => [
                            ['type' => 'heading', 'label' => 'Main Headline', 'content' => [
                                'text' => "Bangladesh er Prothom Automated Real Estate Co-operative Platform.",
                                'highlight' => 'Automated',
                                'cmsKey' => 'hero_main_headline',
                            ]],
                            ['type' => 'text', 'label' => 'Sub Tagline', 'content' => [
                                'text' => 'Shorashori jomiyer malikana shoho building er construction cost installment e din, flat kinun market price er ordhek e. Transparency, shared equity, and collective growth.',
                                'cmsKey' => 'hero_sub_tagline',
                            ]],
                            ['type' => 'button', 'label' => 'Primary CTA', 'content' => ['text' => 'EXPLORE ACTIVE PROJECT SHARES', 'url' => '/explore', 'cmsKey' => 'hero_cta_label']],
                            ['type' => 'button', 'label' => 'Secondary CTA', 'content' => ['text' => 'SUBMIT LAND FOR JOINT VENTURE', 'url' => '/submit-land', 'variant' => 'outline']],
                            ['type' => 'image', 'label' => 'Hero Image', 'content' => [
                                'alt' => 'The Mirage Rosetum — Estate Archive flagship co-operative residence',
                                'imageUrl' => self::IMG_HERO,
                            ]],
                        ],
                    ],
                    [
                        'slug' => 'choose-path',
                        'title' => 'Choose Your Path',
                        'type' => 'choose_path',
                        'blocks' => [],
                    ],
                    [
                        'slug' => 'process-steps',
                        'title' => 'Process Steps',
                        'type' => 'steps',
                        'blocks' => [
                            ['type' => 'eyebrow', 'label' => 'Section Eyebrow', 'content' => ['text' => 'PROCESS ARCHITECTURE']],
                            ['type' => 'heading', 'label' => 'Section Title', 'content' => ['text' => 'Automated Co-operative Journey']],
                            ['type' => 'step', 'label' => 'Step 1', 'content' => ['num' => '1', 'title' => 'Select & Verify', 'desc' => 'Browse vetted land opportunities and legal documentation directly on the platform.']],
                            ['type' => 'step', 'label' => 'Step 2', 'content' => ['num' => '2', 'title' => 'Lock Land Share', 'desc' => 'Secure your physical land registry share with an initial booking amount.']],
                            ['type' => 'step', 'label' => 'Step 3', 'content' => ['num' => '3', 'title' => 'Registry Assignment', 'desc' => 'Direct legal deed transfer to your name as a part-owner of the property.']],
                            ['type' => 'step', 'label' => 'Step 4', 'content' => ['num' => '4', 'title' => 'Smart Installments', 'desc' => 'Automated construction cost distribution over 48 interest-free months.']],
                        ],
                    ],
                    [
                        'slug' => 'active-ventures',
                        'title' => 'Active Ventures',
                        'type' => 'project_grid',
                        'blocks' => [
                            ['type' => 'heading', 'label' => 'Section Title', 'content' => ['text' => 'Active Ventures']],
                            ['type' => 'text', 'label' => 'Section Subtitle', 'content' => ['text' => 'Current co-operative projects open for capital partners.']],
                            ['type' => 'button', 'label' => 'View Portfolio', 'content' => ['text' => 'VIEW PORTFOLIO', 'url' => '/explore', 'variant' => 'gold']],
                        ],
                    ],
                    [
                        'slug' => 'cost-estimator',
                        'title' => 'Cost Estimator',
                        'type' => 'cost_estimator',
                        'blocks' => [
                            ['type' => 'heading', 'label' => 'Estimator Title', 'content' => ['text' => 'Institutional Grade Cost Estimator']],
                        ],
                    ],
                    [
                        'slug' => 'footer',
                        'title' => 'Footer',
                        'type' => 'footer',
                        'blocks' => [
                            ['type' => 'text', 'label' => 'Company Tagline', 'content' => ['text' => 'Re-imagining ownership through collective architectural integrity and radical transparency.', 'cmsKey' => 'footer_company_tagline']],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'explore',
                'title' => 'Explore Projects',
                'path' => '/explore',
                'sort_order' => 1,
                'sections' => [
                    [
                        'slug' => 'page-header',
                        'title' => 'Page Header',
                        'type' => 'page_header',
                        'blocks' => [
                            ['type' => 'eyebrow', 'label' => 'Eyebrow', 'content' => ['text' => 'PROJECT PORTFOLIO']],
                            ['type' => 'heading', 'label' => 'Title', 'content' => ['text' => 'Explore Active Co-operative Ventures']],
                            ['type' => 'text', 'label' => 'Description', 'content' => ['text' => 'Browse vetted land-share projects, compare funding progress, and reserve units at institutional pricing.']],
                            ['type' => 'image', 'label' => 'Header Image', 'content' => [
                                'imageUrl' => self::IMG_ARCHIVE,
                                'alt' => 'Aura Blakely — Archive Residence',
                            ]],
                        ],
                    ],
                    [
                        'slug' => 'project-grid',
                        'title' => 'Project Grid',
                        'type' => 'project_grid',
                        'blocks' => [
                            ['type' => 'heading', 'label' => 'Section Title', 'content' => ['text' => 'Active Ventures']],
                            ['type' => 'text', 'label' => 'Section Subtitle', 'content' => ['text' => 'Current co-operative projects open for capital partners.']],
                        ],
                    ],
                    [
                        'slug' => 'cost-estimator',
                        'title' => 'Cost Estimator',
                        'type' => 'cost_estimator',
                        'blocks' => [
                            ['type' => 'heading', 'label' => 'Estimator Title', 'content' => ['text' => 'Institutional Grade Cost Estimator']],
                        ],
                    ],
                    [
                        'slug' => 'footer',
                        'title' => 'Footer',
                        'type' => 'footer',
                        'blocks' => [],
                    ],
                ],
            ],
            [
                'slug' => 'how-it-works',
                'title' => 'How It Works',
                'path' => '/how-it-works',
                'sort_order' => 2,
                'sections' => [
                    [
                        'slug' => 'page-header',
                        'title' => 'Page Header',
                        'type' => 'page_header',
                        'blocks' => [
                            ['type' => 'eyebrow', 'label' => 'Eyebrow', 'content' => ['text' => 'PROCESS ARCHITECTURE']],
                            ['type' => 'heading', 'label' => 'Title', 'content' => ['text' => 'How the Co-operative Platform Works']],
                            ['type' => 'text', 'label' => 'Description', 'content' => ['text' => 'From land verification to registry assignment and interest-free installments — every step is designed for radical transparency and automated governance.']],
                            ['type' => 'image', 'label' => 'Header Image', 'content' => [
                                'imageUrl' => self::IMG_HERO,
                                'alt' => 'The Mirage Rosetum — Estate Archive',
                            ]],
                        ],
                    ],
                    [
                        'slug' => 'steps',
                        'title' => 'Journey Steps',
                        'type' => 'steps',
                        'blocks' => [
                            ['type' => 'step', 'label' => 'Step 1', 'content' => ['num' => '1', 'title' => 'Select & Verify', 'desc' => 'Browse vetted land opportunities and legal documentation directly on the platform.', 'detail' => 'Every project is pre-screened for RAJUK compliance, title clarity, and co-operative structure before listing.', 'imageUrl' => self::IMG_ARCHIVE, 'alt' => 'Aura Blakely residence']],
                            ['type' => 'step', 'label' => 'Step 2', 'content' => ['num' => '2', 'title' => 'Lock Land Share', 'desc' => 'Secure your physical land registry share with an initial booking amount.', 'detail' => 'Your booking reserves a proportional land share and unlocks the installment schedule for construction costs.', 'imageUrl' => self::IMG_PARKVIEW, 'alt' => 'Modernizen residence']],
                            ['type' => 'step', 'label' => 'Step 3', 'content' => ['num' => '3', 'title' => 'Registry Assignment', 'desc' => 'Direct legal deed transfer to your name as a part-owner of the property.', 'detail' => 'Ownership is recorded through formal registry assignment — not a paper promise, but a legal land share.', 'imageUrl' => self::IMG_LUMINA, 'alt' => 'The Zurana residence']],
                            ['type' => 'step', 'label' => 'Step 4', 'content' => ['num' => '4', 'title' => 'Smart Installments', 'desc' => 'Automated construction cost distribution over 48 interest-free months.', 'detail' => 'Escrow-managed disbursements release funds to contractors only when milestone verification is complete.', 'imageUrl' => self::IMG_HERO, 'alt' => 'The Mirage Rosetum']],
                        ],
                    ],
                    [
                        'slug' => 'choose-path',
                        'title' => 'Choose Your Path',
                        'type' => 'choose_path',
                        'blocks' => [],
                    ],
                    [
                        'slug' => 'trust-pillars',
                        'title' => 'Trust Pillars',
                        'type' => 'trust_pillars',
                        'blocks' => [
                            ['type' => 'card', 'label' => 'Escrow', 'content' => ['title' => 'Escrow Protection', 'description' => 'Investor capital is held in segregated escrow accounts until verified construction milestones are met.', 'imageUrl' => self::IMG_ARCHIVE, 'alt' => 'Aura Blakely']],
                            ['type' => 'card', 'label' => 'Legal', 'content' => ['title' => 'Legal Transparency', 'description' => 'Title deeds, survey maps, and co-operative agreements are available for review before commitment.', 'imageUrl' => self::IMG_PARKVIEW, 'alt' => 'Modernizen']],
                            ['type' => 'card', 'label' => 'Compliance', 'content' => ['title' => 'Automated Compliance', 'description' => 'Installment schedules, default handling, and revenue distribution run through the platform ledger.', 'imageUrl' => self::IMG_LUMINA, 'alt' => 'The Zurana']],
                        ],
                    ],
                    [
                        'slug' => 'cta-banner',
                        'title' => 'CTA Banner',
                        'type' => 'cta_banner',
                        'blocks' => [
                            ['type' => 'heading', 'label' => 'CTA Title', 'content' => ['text' => 'Ready to begin?']],
                            ['type' => 'text', 'label' => 'CTA Subtitle', 'content' => ['text' => 'Explore open ventures or submit your land for a joint-venture partnership.']],
                            ['type' => 'button', 'label' => 'Explore CTA', 'content' => ['text' => 'Explore Projects', 'url' => '/explore', 'variant' => 'gold']],
                            ['type' => 'button', 'label' => 'Submit Land CTA', 'content' => ['text' => 'Submit Land', 'url' => '/submit-land', 'variant' => 'outline-light']],
                        ],
                    ],
                    [
                        'slug' => 'footer',
                        'title' => 'Footer',
                        'type' => 'footer',
                        'blocks' => [],
                    ],
                ],
            ],
        ];
    }
}
