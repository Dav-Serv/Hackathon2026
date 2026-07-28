<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Magang;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminMagangController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Magang::with(['mahasiswa:id,name,nim_nip,email,avatar', 'mitraIndustri', 'supervisorMitra', 'dpl:id,name,nim_nip,email', 'dokumens'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q->where('nomor_magang', 'like', "%{$search}%")
                ->orWhereHas('mahasiswa', fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('nim_nip', 'like', "%{$search}%"))
                ->orWhereHas('mitraIndustri', fn ($q) => $q->where('nama_perusahaan', 'like', "%{$search}%")));
        }
        if ($request->filled('jenis_program')) {
            $query->where('jenis_program', $request->string('jenis_program'));
        }
        if ($request->filled('mitra_industri_id')) $query->where('mitra_industri_id', $request->integer('mitra_industri_id'));
        if ($request->filled('dpl_id')) $query->where('dpl_id', $request->integer('dpl_id'));
        if ($request->filled('periode_mulai')) $query->whereDate('periode_mulai', '>=', $request->date('periode_mulai'));
        if ($request->filled('periode_selesai')) $query->whereDate('periode_selesai', '<=', $request->date('periode_selesai'));
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        abort_unless(in_array($sort, ['created_at', 'status', 'periode_mulai', 'periode_selesai'], true), 422);
        abort_unless(in_array($direction, ['asc', 'desc'], true), 422);

        return response()->json($query->orderBy($sort, $direction)->paginate($request->integer('per_page', 15)));
    }

    public function document(Magang $magang, string $jenis): JsonResponse
    {
        abort_unless(in_array($jenis, ['proposal', 'bukti_diterima'], true), 404);
        $path = $jenis === 'proposal' ? $magang->proposal_file : $magang->bukti_diterima_file;
        abort_unless($path, 404);
        return response()->json(['url' => Storage::disk('supabase')->temporaryUrl($path, now()->addMinutes(10)), 'expires_at' => now()->addMinutes(10)->toISOString()]);
    }

    public function dpl(): JsonResponse
    {
        return response()->json(User::where('role', 'dpl')->select('id', 'name', 'nim_nip', 'email')->get());
    }

    public function assignDpl(Request $request, Magang $magang): JsonResponse
    {
        $data = $request->validate(['dpl_id' => ['required', 'exists:users,id']]);
        abort_unless(User::whereKey($data['dpl_id'])->where('role', 'dpl')->exists(), 422, 'User bukan DPL.');
        $magang->update($data);
        return response()->json($magang->fresh()->load('dpl'));
    }

    public function verify(Request $request, Magang $magang): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:disetujui,ditolak'],
        ]);

        abort_unless($magang->status === 'menunggu_verifikasi', 422, 'Pengajuan magang tidak sedang menunggu verifikasi.');

        $magang->update(['status' => $data['status']]);
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => 'magang.verifikasi', 'subject_type' => Magang::class, 'subject_id' => $magang->id, 'metadata' => ['status' => $data['status']], 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent()]);

        return response()->json($magang->fresh()->load(['mahasiswa:id,name,nim_nip,email', 'mitraIndustri', 'supervisorMitra', 'dpl:id,name,nim_nip,email']));
    }
}
