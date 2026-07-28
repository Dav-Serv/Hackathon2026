<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\MitraIndustri;
use App\Models\SuratPengantar;

class AdminDashboardController extends Controller
{
    public function index() { return response()->json(['magang'=>['total'=>Magang::count(),'by_status'=>Magang::query()->selectRaw('status, COUNT(*) total')->groupBy('status')->pluck('total','status')],'mitra'=>MitraIndustri::count(),'surat_pengantar'=>SuratPengantar::query()->selectRaw('status, COUNT(*) total')->groupBy('status')->pluck('total','status')]); }
}
