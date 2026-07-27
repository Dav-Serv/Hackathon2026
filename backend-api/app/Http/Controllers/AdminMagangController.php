<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMagangController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Magang::with(['mahasiswa:id,name,nim_nip,email', 'mitraIndustri', 'supervisorMitra', 'dpl:id,name,nim_nip,email'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->paginate($request->integer('per_page', 15)));
    }

    public function verify(Request $request, Magang $magang): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:disetujui,ditolak'],
        ]);

        abort_unless($magang->status === 'menunggu_verifikasi', 422, 'Pengajuan magang tidak sedang menunggu verifikasi.');

        $magang->update(['status' => $data['status']]);

        return response()->json($magang->fresh()->load(['mahasiswa:id,name,nim_nip,email', 'mitraIndustri', 'supervisorMitra', 'dpl:id,name,nim_nip,email']));
    }
}
