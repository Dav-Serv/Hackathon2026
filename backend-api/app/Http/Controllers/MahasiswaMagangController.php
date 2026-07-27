<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\SupervisorMitra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MahasiswaMagangController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Magang::with(['mitraIndustri', 'supervisorMitra', 'dpl'])->where('mahasiswa_id', $request->user()->id)->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mitra_industri_id' => ['required', 'exists:mitra_industris,id'],
            'supervisor_mitra_id' => ['required', 'exists:supervisor_mitras,id'],
            'dpl_id' => ['required', 'exists:users,id', Rule::exists('users', 'id')->where(fn ($q) => $q->where('role', 'dpl')->where('is_active', true))],
            'jenis_program' => ['required', Rule::in(['magang', 'studi_independen'])],
            'posisi' => ['required', 'string', 'max:255'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['required', 'date', 'after_or_equal:periode_mulai'],
            'proposal_file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'bukti_diterima_file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);
        abort_unless(SupervisorMitra::whereKey($data['supervisor_mitra_id'])->where('mitra_industri_id', $data['mitra_industri_id'])->exists(), 422, 'Supervisor bukan bagian dari mitra.');
        $data['mahasiswa_id'] = $request->user()->id;
        $data['nomor_magang'] = 'MAG-'.strtoupper(substr($data['jenis_program'], 0, 3)).'-'.now()->year.'-'.str_pad((string) (Magang::max('id') + 1), 4, '0', STR_PAD_LEFT);
        $data['proposal_file'] = $request->file('proposal_file')->store('magang/'.$request->user()->id, 'supabase');
        $data['bukti_diterima_file'] = $request->file('bukti_diterima_file')->store('magang/'.$request->user()->id, 'supabase');
        $data['status'] = 'menunggu_verifikasi';

        return response()->json(Magang::create($data), 201);
    }

    public function update(Request $request, Magang $magang): JsonResponse
    {
        abort_unless($magang->mahasiswa_id === $request->user()->id && in_array($magang->status, ['draft', 'revisi'], true), 403);
        $data = $request->validate(['posisi' => ['sometimes', 'string', 'max:255'], 'periode_mulai' => ['sometimes', 'date'], 'periode_selesai' => ['sometimes', 'date', 'after_or_equal:periode_mulai'], 'jenis_program' => ['sometimes', Rule::in(['magang', 'studi_independen'])]]);
        $magang->update($data);

        return response()->json($magang->fresh());
    }

    public function show(Request $request, Magang $magang): JsonResponse
    {
        abort_unless($magang->mahasiswa_id === $request->user()->id, 403);

        return response()->json($magang->load(['mitraIndustri', 'supervisorMitra', 'dpl', 'usulanKonversis.details']));
    }
}
