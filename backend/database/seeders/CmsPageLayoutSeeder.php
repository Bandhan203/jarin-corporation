<?php

namespace Database\Seeders;

use App\Services\CmsPageLayoutService;
use Illuminate\Database\Seeder;

class CmsPageLayoutSeeder extends Seeder
{
    public function run(): void
    {
        app(CmsPageLayoutService::class)->seedAll();
    }
}
