<?php

namespace Database\Seeders;

use App\Models\CmsBlock;
use App\Models\CmsPage;
use App\Models\CmsSection;
use Illuminate\Database\Seeder;

class CmsPageLayoutSeeder extends Seeder
{
    private const IMG_HERO = '/images/estate/hero-mirage-rosetum.png';
    private const IMG_ARCHIVE = '/images/estate/archive-residence-aura-blakely.png';
    private const IMG_PARKVIEW = '/images/estate/parkview-modernizen.png';
    private const IMG_LUMINA = '/images/estate/lumina-zurana.png';

    public function run(): void
    {
        $pages = [
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
                            ['type' => 'heading', 'label' => 'Main Headline', 'content' => ['text' => "Bangladesh er Prothom Automated Real Estate Co-operative Platform.", 'cmsKey' => 'hero_main_headline']],
                            ['type' => 'text', 'label' => 'Sub Tagline', 'content' => ['text' => 'Shorashori jomiyer malikana shoho building er construction cost installment e din, flat kinun market price er ordhek e.', 'cmsKey' => 'hero_sub_tagline']],
                            ['type' => 'button', 'label' => 'Primary CTA', 'content' => ['text' => 'EXPLORE ACTIVE PROJECT SHARES', 'url' => '/explore', 'cmsKey' => 'hero_cta_label']],
                            ['type' => 'button', 'label' => 'Secondary CTA', 'content' => ['text' => 'SUBMIT LAND FOR JOINT VENTURE', 'url' => '/submit-land', 'variant' => 'outline']],
                            ['type' => 'image', 'label' => 'Hero Image', 'content' => [
                                'alt' => 'The Mirage Rosetum — Estate Archive flagship co-operative residence',
                                'imageUrl' => self::IMG_HERO,
                            ]],
                        ],
                    ],
                    [
                        'slug' => 'quick-links',
                        'title' => 'Quick Links',
                        'type' => 'quick_links',
                        'blocks' => [
                            ['type' => 'card', 'label' => 'Explore Card', 'content' => [
                                'eyebrow' => 'Explore Projects',
                                'title' => 'Browse Active Ventures',
                                'description' => 'Compare co-operative projects, funding progress, and reserve land shares at institutional pricing.',
                                'cta' => 'View Portfolio →',
                                'url' => '/explore',
                                'imageUrl' => self::IMG_PARKVIEW,
                                'alt' => 'Modernizen — Parkview Co-Op',
                            ]],
                            ['type' => 'card', 'label' => 'How It Works Card', 'content' => [
                                'eyebrow' => 'How It Works',
                                'title' => 'Understand the Journey',
                                'description' => 'Learn how land verification, registry assignment, and interest-free installments work on the platform.',
                                'cta' => 'See the Process →',
                                'url' => '/how-it-works',
                                'imageUrl' => self::IMG_LUMINA,
                                'alt' => 'The Zurana — Lumina Estate',
                            ]],
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

        foreach ($pages as $pageData) {
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
        }
    }
}
