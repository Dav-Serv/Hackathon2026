<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\SuratPengantar;
use Illuminate\Http\Request;

class AdminSuratPengantarController extends Controller
{
    public function index(Request $request) { return response()->json(SuratPengantar::with('magang.mahasiswa')->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))->latest()->paginate(15)); }
    public function issue(Request $request, SuratPengantar $suratPengantar) { $suratPengantar->update($request->validate(['status'=>'required|in:diproses,disetujui,ditolak','catatan'=>'nullable|string|max:5000'])); return response()->json($suratPengantar->fresh()); }
}
