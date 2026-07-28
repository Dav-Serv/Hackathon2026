<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\MitraIndustri;
use App\Models\SuratPengantar;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $months = Magang::query()->selectRaw('EXTRACT(MONTH FROM created_at)::int AS month, COUNT(*) AS total')->groupBy('month')->pluck('total', 'month');
        return response()->json(['magang' => ['total' => Magang::count(), 'by_status' => Magang::query()->selectRaw('status, COUNT(*) total')->groupBy('status')->pluck('total', 'status')], 'mitra' => MitraIndustri::count(), 'surat_pengantar' => SuratPengantar::query()->selectRaw('status, COUNT(*) total')->groupBy('status')->pluck('total', 'status'), 'monthly_submissions' => collect(range(1, 12))->map(fn ($month) => ['month' => $month, 'total' => (int) ($months[$month] ?? 0)])->values()]);
    }
}
