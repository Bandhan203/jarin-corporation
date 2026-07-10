<?php

namespace Database\Seeders;

use App\Models\CompanyCorporateProfitLedger;
use App\Models\DynamicCmsSetting;
use App\Models\InventoryUnit;
use App\Models\LandSubmission;
use App\Models\NidVerification;
use App\Models\PaymentLedger;
use App\Models\PlatformCostSetting;
use App\Models\Project;
use App\Models\ProjectEscrowLedger;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $investor = User::updateOrCreate(
            ['email' => 'rafiqul@example.com'],
            [
                'name'        => 'Md. Rafiqul Islam',
                'phone'       => '01711000001',
                'password'    => Hash::make('password'),
                'role'        => 'investor',
                'is_verified' => false,
            ]
        );

        $landowner = User::updateOrCreate(
            ['email' => 'hasina@example.com'],
            [
                'name'        => 'Begum Hasina Khatun',
                'phone'       => '01722000002',
                'password'    => Hash::make('password'),
                'role'        => 'landowner',
                'is_verified' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@estatearchive.bd'],
            [
                'name'        => 'System Administrator',
                'phone'       => '01733000003',
                'password'    => Hash::make('password'),
                'role'        => 'admin',
                'is_verified' => true,
            ]
        );

        $project = Project::updateOrCreate(
            ['title' => 'The Archive Residence I'],
            [
                'location'                  => 'Diabari, Sector 15, Dhaka',
                'total_katha'               => 10,
                'total_shares'              => 27,
                'base_sqft_rate'            => 2800,
                'management_fee_percentage' => 12,
                'funding_percentage'        => 67,
                'status'                    => 'crowdfunding',
                'phase_label'               => 'CROWDFUNDING LAND SHARES',
                'hero_image'                => '/images/estate/archive-residence-aura-blakely.png',
                'contractor'                => 'Buildcon BD Ltd',
                'completion_target'         => 'Q3 2026',
            ]
        );

        Project::updateOrCreate(
            ['title' => 'Parkview Co-Op'],
            [
                'location'                  => 'Uttara, Sector 18, Dhaka',
                'total_katha'               => 8,
                'total_shares'              => 21,
                'base_sqft_rate'            => 2800,
                'management_fee_percentage' => 12,
                'funding_percentage'        => 45,
                'status'                    => 'crowdfunding',
                'phase_label'               => 'CROWDFUNDING LAND SHARES',
                'hero_image'                => '/images/estate/parkview-modernizen.png',
                'contractor'                => 'Premier Infra',
                'completion_target'         => 'Q1 2027',
            ]
        );

        Project::updateOrCreate(
            ['title' => 'Lumina Estate'],
            [
                'location'                  => 'Purbachal, Sector 4, Dhaka',
                'total_katha'               => 12,
                'total_shares'              => 33,
                'base_sqft_rate'            => 2800,
                'management_fee_percentage' => 12,
                'funding_percentage'        => 90,
                'status'                    => 'construction',
                'phase_label'               => 'CONSTRUCTION PHASE I',
                'hero_image'                => '/images/estate/lumina-zurana.png',
                'contractor'                => 'Buildcon BD Ltd',
                'completion_target'         => 'Q4 2027',
            ]
        );

        $statuses = ['available', 'sold', 'available', 'reserved', 'available', 'sold', 'available', 'reserved', 'reserved'];
        $sizes    = [1200, 1350, 1500];
        $orientations = ['North-Facing', 'South-Facing', 'East-Facing'];

        for ($floor = 9; $floor >= 1; $floor--) {
            foreach (['A', 'B', 'C'] as $blockIndex => $block) {
                $idx = (9 - $floor) * 3 + $blockIndex;
                $size = $sizes[$blockIndex];
                $base = $size * 6000;
                $premium = [150000, 250000, 200000][$blockIndex];

                InventoryUnit::updateOrCreate(
                    ['project_id' => $project->id, 'unit_number' => "{$floor}{$block}"],
                    [
                        'floor_number'        => $floor,
                        'size_sft'            => $size,
                        'premium_charge'      => $premium,
                        'total_price'         => $base + $premium,
                        'orientation'         => $orientations[$blockIndex],
                        'status'              => $statuses[$idx % count($statuses)],
                        'reserved_by_user_id' => $blockIndex === 0 && $floor >= 5 ? $landowner->id : null,
                    ]
                );
            }
        }

        $unit7B = InventoryUnit::where('project_id', $project->id)->where('unit_number', '7B')->first();

        if ($unit7B) {
            $unit7B->update([
                'status'              => 'reserved',
                'reserved_by_user_id' => $investor->id,
            ]);
        }

        $installments = [
            ['num' => 0,  'status' => 'paid',    'due' => '2024-01-15'],
            ['num' => 1,  'status' => 'paid',    'due' => '2024-02-15'],
            ['num' => 2,  'status' => 'paid',    'due' => '2024-03-15'],
            ['num' => 3,  'status' => 'paid',    'due' => '2024-04-15'],
            ['num' => 4,  'status' => 'paid',    'due' => '2024-05-15'],
            ['num' => 5,  'status' => 'paid',    'due' => '2024-06-15'],
            ['num' => 6,  'status' => 'overdue', 'due' => '2024-07-15'],
            ['num' => 7,  'status' => 'unpaid',  'due' => '2024-08-15'],
            ['num' => 8,  'status' => 'unpaid',  'due' => '2024-09-15'],
        ];

        foreach ($installments as $row) {
            $amount = $row['num'] === 0 ? 500000 : 98438;
            $invoiceNo = sprintf('INV-2024-%03d', $row['num'] + 1);

            $ledger = PaymentLedger::updateOrCreate(
                ['invoice_number' => $invoiceNo],
                [
                    'user_id'            => $investor->id,
                    'project_id'         => $project->id,
                    'unit_id'            => $unit7B?->id,
                    'installment_number' => $row['num'],
                    'amount_bdt'         => $amount,
                    'status'             => $row['status'],
                    'due_date'           => $row['due'],
                    'paid_at'            => $row['status'] === 'paid' ? Carbon::parse($row['due']) : null,
                    'overdue_streak'     => $row['status'] === 'overdue' ? 1 : 0,
                ]
            );

            if ($row['status'] === 'paid' && ! $ledger->escrowLedger) {
                $escrow = round($amount * 0.88, 2);
                $fee    = round($amount - $escrow, 2);
                $ledger->update(['amount_escrow' => $escrow, 'amount_fee' => $fee]);

                ProjectEscrowLedger::create([
                    'payment_ledger_id' => $ledger->id,
                    'project_id'        => $project->id,
                    'amount'            => $escrow,
                    'split_percentage'  => 88,
                    'status'            => 'held',
                ]);

                CompanyCorporateProfitLedger::create([
                    'payment_ledger_id' => $ledger->id,
                    'amount'            => $fee,
                    'split_percentage'  => 12,
                    'fiscal_quarter'    => 'Q1',
                    'fiscal_year'       => 2024,
                    'status'            => 'received',
                ]);
            }
        }

        NidVerification::updateOrCreate(
            ['user_id' => $landowner->id],
            [
                'nid_number'           => '1995123456789',
                'full_name'            => $landowner->name,
                'date_of_birth'        => '1975-03-12',
                'ocr_confidence_score' => 94.5,
                'status'               => 'approved',
                'verified_at'          => now(),
            ]
        );

        foreach ([
            ['key' => 'sqft_rate', 'label' => 'Base Construction Rate (BDT / SFT)', 'value' => 2800, 'lock' => true],
            ['key' => 'mgmt_fee_pct', 'label' => 'Management Fee (%)', 'value' => 12, 'lock' => false],
            ['key' => 'land_premium_prime', 'label' => 'Prime Location Rate (BDT / SFT)', 'value' => 4500, 'lock' => true],
            ['key' => 'land_premium_standard', 'label' => 'Standard Location Rate (BDT / SFT)', 'value' => 3500, 'lock' => true],
            ['key' => 'booking_pct', 'label' => 'Booking Down-Payment (%)', 'value' => 15, 'lock' => false],
        ] as $cost) {
            PlatformCostSetting::updateOrCreate(
                ['key' => $cost['key']],
                ['label' => $cost['label'], 'value' => $cost['value'], 'lock_when_running' => $cost['lock']]
            );
        }

        foreach ([
            ['group' => 'Hero', 'key' => 'hero_main_headline', 'type' => 'text', 'value' => "Bangladesh er Prothom Automated Real Estate Co-operative Platform."],
            ['group' => 'Hero', 'key' => 'hero_sub_tagline', 'type' => 'text', 'value' => 'Shorashori jomiyer malikana shoho building er construction cost installment e din.'],
            ['group' => 'Hero', 'key' => 'hero_cta_label', 'type' => 'text', 'value' => 'EXPLORE ACTIVE PROJECT SHARES'],
            ['group' => 'Fees', 'key' => 'mgmt_fee_display_pct', 'type' => 'metric', 'value' => '12%'],
            ['group' => 'Fees', 'key' => 'investment_fee_global', 'type' => 'metric', 'value' => '12% Management Fee'],
            ['group' => 'Fees', 'key' => 'booking_deposit_label', 'type' => 'text', 'value' => '15% Booking Deposit Required'],
            ['group' => 'Legal', 'key' => 'deed_notice_body', 'type' => 'rich_text', 'value' => 'CS/RS Mutation Deed issued post 100% fund completion under Cooperative Societies Act 2001.'],
            ['group' => 'Legal', 'key' => 'coop_reg_number', 'type' => 'metric', 'value' => 'CRB-2024-00417'],
            ['group' => 'Homepage', 'key' => 'stats_projects_active', 'type' => 'metric', 'value' => '3 Live Projects'],
            ['group' => 'Homepage', 'key' => 'stats_investors_count', 'type' => 'metric', 'value' => '218 Active Investors'],
            ['group' => 'Footer', 'key' => 'footer_company_tagline', 'type' => 'text', 'value' => 'Building generational wealth through co-operative land ownership.'],
            ['group' => 'Footer', 'key' => 'footer_hotline', 'type' => 'text', 'value' => '+880 1711-000000'],
        ] as $cms) {
            DynamicCmsSetting::updateOrCreate(
                ['key' => $cms['key']],
                ['group' => $cms['group'], 'type' => $cms['type'], 'value' => $cms['value'], 'updated_by' => 'system']
            );
        }

        foreach ([
            ['ref' => 'LO-2024-012', 'name' => 'Abdur Rahman Molla', 'loc' => 'Mirpur, Sector 7 · 6 Katha', 'katha' => 6, 'date' => '2024-07-01', 'status' => 'pending'],
            ['ref' => 'LO-2024-011', 'name' => 'Sultana Begum', 'loc' => 'Bashundhara, Block F · 8.5 Katha', 'katha' => 8.5, 'date' => '2024-06-28', 'status' => 'lawyer_assigned'],
            ['ref' => 'LO-2024-010', 'name' => 'Mohammad Karim', 'loc' => 'Uttara, Sector 12 · 10 Katha', 'katha' => 10, 'date' => '2024-06-20', 'status' => 'pending'],
            ['ref' => 'LO-2024-009', 'name' => 'Rahima Khatun', 'loc' => 'Purbachal, Block D · 12 Katha', 'katha' => 12, 'date' => '2024-06-15', 'status' => 'approved'],
        ] as $sub) {
            LandSubmission::updateOrCreate(
                ['reference_id' => $sub['ref']],
                [
                    'landowner_name' => $sub['name'],
                    'location'       => $sub['loc'],
                    'katha'          => $sub['katha'],
                    'submitted_at'   => $sub['date'],
                    'status'         => $sub['status'],
                ]
            );
        }

        $this->call(CmsPageLayoutSeeder::class);
    }
}
