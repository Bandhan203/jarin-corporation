<?php

namespace App\Http\Controllers;

use App\Models\CmsBlock;
use App\Models\CmsPage;
use App\Models\CmsSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PageLayoutController extends Controller
{
    public function publicIndex(): JsonResponse
    {
        $pages = CmsPage::where('is_published', true)
            ->orderBy('sort_order')
            ->with(['sections' => fn ($q) => $q->where('is_visible', true)->orderBy('sort_order')->with(['blocks' => fn ($bq) => $bq->where('is_visible', true)->orderBy('sort_order')])])
            ->get();

        return response()->json(['data' => $pages->map(fn ($p) => $this->formatPage($p))]);
    }

    public function publicShow(string $slug): JsonResponse
    {
        $page = CmsPage::where('slug', $slug)
            ->where('is_published', true)
            ->with(['sections' => fn ($q) => $q->where('is_visible', true)->orderBy('sort_order')->with(['blocks' => fn ($bq) => $bq->where('is_visible', true)->orderBy('sort_order')])])
            ->firstOrFail();

        return response()->json(['data' => $this->formatPage($page)]);
    }

    public function adminIndex(): JsonResponse
    {
        $pages = CmsPage::orderBy('sort_order')
            ->with(['sections' => fn ($q) => $q->orderBy('sort_order')->with(['blocks' => fn ($bq) => $bq->orderBy('sort_order')])])
            ->get();

        return response()->json(['data' => $pages->map(fn ($p) => $this->formatPage($p))]);
    }

    public function storePage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'slug'  => ['nullable', 'string', 'max:80'],
            'path'  => ['required', 'string', 'max:200'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['title']);
        $sort = (CmsPage::max('sort_order') ?? -1) + 1;

        $page = CmsPage::create([
            'slug'         => $slug,
            'title'        => $validated['title'],
            'path'         => $validated['path'],
            'sort_order'   => $sort,
            'is_published' => true,
        ]);

        return response()->json(['data' => $this->formatPage($page->fresh(['sections.blocks']))], 201);
    }

    public function updatePage(Request $request, int $id): JsonResponse
    {
        $page = CmsPage::findOrFail($id);

        $validated = $request->validate([
            'title'        => ['sometimes', 'string', 'max:120'],
            'path'         => ['sometimes', 'string', 'max:200'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $page->update($validated);

        return response()->json(['data' => $this->formatPage($page->fresh(['sections.blocks']))]);
    }

    public function destroyPage(int $id): JsonResponse
    {
        CmsPage::findOrFail($id)->delete();

        return response()->json(['message' => 'Page deleted']);
    }

    public function storeSection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page_id' => ['required', 'integer', 'exists:cms_pages,id'],
            'title'   => ['required', 'string', 'max:120'],
            'type'    => ['required', 'string', 'max:60'],
            'slug'    => ['nullable', 'string', 'max:80'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['title']);
        $sort = (CmsSection::where('page_id', $validated['page_id'])->max('sort_order') ?? -1) + 1;

        $section = CmsSection::create([
            'page_id'    => $validated['page_id'],
            'slug'       => $slug,
            'title'      => $validated['title'],
            'type'       => $validated['type'],
            'sort_order' => $sort,
            'settings'   => [],
            'is_visible' => true,
        ]);

        return response()->json(['data' => $this->formatSection($section->fresh('blocks'))], 201);
    }

    public function updateSection(Request $request, int $id): JsonResponse
    {
        $section = CmsSection::findOrFail($id);

        $validated = $request->validate([
            'title'      => ['sometimes', 'string', 'max:120'],
            'type'       => ['sometimes', 'string', 'max:60'],
            'settings'   => ['sometimes', 'array'],
            'is_visible' => ['sometimes', 'boolean'],
            'isVisible'  => ['sometimes', 'boolean'],
        ]);

        if ($request->has('isVisible') && ! $request->has('is_visible')) {
            $validated['is_visible'] = $request->boolean('isVisible');
        }
        unset($validated['isVisible']);

        $section->update($validated);

        return response()->json(['data' => $this->formatSection($section->fresh('blocks'))]);
    }

    public function destroySection(int $id): JsonResponse
    {
        CmsSection::findOrFail($id)->delete();

        return response()->json(['message' => 'Section deleted']);
    }

    public function storeBlock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'section_id' => ['required', 'integer', 'exists:cms_sections,id'],
            'type'       => ['required', 'string', 'max:40'],
            'label'      => ['required', 'string', 'max:120'],
            'content'    => ['nullable', 'array'],
        ]);

        $sort = (CmsBlock::where('section_id', $validated['section_id'])->max('sort_order') ?? -1) + 1;

        $block = CmsBlock::create([
            'section_id' => $validated['section_id'],
            'type'       => $validated['type'],
            'label'      => $validated['label'],
            'content'    => $validated['content'] ?? [],
            'sort_order' => $sort,
            'is_visible' => true,
        ]);

        return response()->json(['data' => $this->formatBlock($block)], 201);
    }

    public function updateBlock(Request $request, int $id): JsonResponse
    {
        $block = CmsBlock::findOrFail($id);

        $validated = $request->validate([
            'label'      => ['sometimes', 'string', 'max:120'],
            'type'       => ['sometimes', 'string', 'max:40'],
            'content'    => ['sometimes', 'array'],
            'is_visible' => ['sometimes', 'boolean'],
            'isVisible'  => ['sometimes', 'boolean'],
        ]);

        if ($request->has('isVisible') && ! $request->has('is_visible')) {
            $validated['is_visible'] = $request->boolean('isVisible');
        }
        unset($validated['isVisible']);

        $block->update($validated);

        return response()->json(['data' => $this->formatBlock($block->fresh())]);
    }

    public function destroyBlock(int $id): JsonResponse
    {
        CmsBlock::findOrFail($id)->delete();

        return response()->json(['message' => 'Block deleted']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pages'    => ['sometimes', 'array'],
            'pages.*.id'         => ['required', 'integer'],
            'pages.*.sort_order' => ['required', 'integer'],
            'sections' => ['sometimes', 'array'],
            'sections.*.id'         => ['required', 'integer'],
            'sections.*.sort_order' => ['required', 'integer'],
            'sections.*.page_id'    => ['sometimes', 'integer'],
            'blocks'   => ['sometimes', 'array'],
            'blocks.*.id'          => ['required', 'integer'],
            'blocks.*.sort_order'  => ['required', 'integer'],
            'blocks.*.section_id'  => ['sometimes', 'integer'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['pages'] ?? [] as $item) {
                CmsPage::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
            foreach ($validated['sections'] ?? [] as $item) {
                $payload = ['sort_order' => $item['sort_order']];
                if (isset($item['page_id'])) {
                    $payload['page_id'] = $item['page_id'];
                }
                CmsSection::where('id', $item['id'])->update($payload);
            }
            foreach ($validated['blocks'] ?? [] as $item) {
                $payload = ['sort_order' => $item['sort_order']];
                if (isset($item['section_id'])) {
                    $payload['section_id'] = $item['section_id'];
                }
                CmsBlock::where('id', $item['id'])->update($payload);
            }
        });

        return response()->json(['message' => 'Order updated']);
    }

    private function formatPage(CmsPage $page): array
    {
        return [
            'id'           => (string) $page->id,
            'slug'         => $page->slug,
            'title'        => $page->title,
            'path'         => $page->path,
            'sortOrder'    => $page->sort_order,
            'isPublished'  => $page->is_published,
            'sections'     => $page->relationLoaded('sections')
                ? $page->sections->map(fn ($s) => $this->formatSection($s))->values()
                : [],
        ];
    }

    private function formatSection(CmsSection $section): array
    {
        return [
            'id'        => (string) $section->id,
            'pageId'    => (string) $section->page_id,
            'slug'      => $section->slug,
            'title'     => $section->title,
            'type'      => $section->type,
            'sortOrder' => $section->sort_order,
            'isVisible' => $section->is_visible,
            'settings'  => $section->settings ?? [],
            'blocks'    => $section->relationLoaded('blocks')
                ? $section->blocks->map(fn ($b) => $this->formatBlock($b))->values()
                : [],
        ];
    }

    private function formatBlock(CmsBlock $block): array
    {
        return [
            'id'        => (string) $block->id,
            'sectionId' => (string) $block->section_id,
            'type'      => $block->type,
            'label'     => $block->label,
            'content'   => $block->content ?? [],
            'sortOrder' => $block->sort_order,
            'isVisible' => $block->is_visible,
        ];
    }
}
