<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\MitraIndustri;
use App\Models\SupervisorMitra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'mitra_industri_id' => ['nullable', 'exists:mitra_industris,id'],
            'mitra_nama' => ['required_without:mitra_industri_id', 'string', 'max:255'],
            'mitra_bidang' => ['nullable', 'string', 'max:255'],
            'mitra_alamat' => ['nullable', 'string'],
            'supervisor_mitra_id' => ['nullable', 'exists:supervisor_mitras,id'],
            'supervisor_nama' => ['required_without:supervisor_mitra_id', 'string', 'max:255'],
            'supervisor_email' => ['required_without:supervisor_mitra_id', 'email', 'max:255'],
            'supervisor_hp' => ['nullable', 'string', 'max:50'],
            'dpl_id' => ['required', 'exists:users,id', Rule::exists('users', 'id')->where(fn ($q) => $q->where('role', 'dpl')->whereRaw('is_active IS TRUE'))],
            'jenis_program' => ['required', Rule::in(['magang', 'studi_independen'])],
            'posisi' => ['required', 'string', 'max:255'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['required', 'date', 'after_or_equal:periode_mulai'],
            'proposal_file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'bukti_diterima_file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);
        $magang = DB::transaction(function () use ($request, $data) {
            $mitraId = $data['mitra_industri_id'] ?? null;
            $supervisorId = $data['supervisor_mitra_id'] ?? null;

            $mitra = $mitraId
                ? MitraIndustri::findOrFail($mitraId)
                : MitraIndustri::firstOrCreate(
                    ['nama_perusahaan' => $data['mitra_nama']],
                    [
                        'bidang' => $data['mitra_bidang'] ?? null,
                        'alamat' => $data['mitra_alamat'] ?? null,
                    ],
                );

            if ($supervisorId) {
                $supervisor = SupervisorMitra::whereKey($supervisorId)
                    ->where('mitra_industri_id', $mitra->id)
                    ->firstOrFail();
            } else {
                $supervisor = SupervisorMitra::firstOrCreate(
                    ['mitra_industri_id' => $mitra->id, 'email' => $data['supervisor_email']],
                    ['nama' => $data['supervisor_nama'], 'no_hp' => $data['supervisor_hp'] ?? null],
                );
            }

            return Magang::create([
                'mahasiswa_id' => $request->user()->id,
                'mitra_industri_id' => $mitra->id,
                'supervisor_mitra_id' => $supervisor->id,
                'dpl_id' => $data['dpl_id'],
                'jenis_program' => $data['jenis_program'],
                'posisi' => $data['posisi'],
                'periode_mulai' => $data['periode_mulai'],
                'periode_selesai' => $data['periode_selesai'],
                'nomor_magang' => 'MAG-'.strtoupper(substr($data['jenis_program'], 0, 3)).'-'.now()->year.'-'.str_pad((string) (Magang::max('id') + 1), 4, '0', STR_PAD_LEFT),
                'proposal_file' => $request->file('proposal_file')->store('magang/'.$request->user()->id, 'supabase'),
                'bukti_diterima_file' => $request->file('bukti_diterima_file')->store('magang/'.$request->user()->id, 'supabase'),
                'status' => 'menunggu_verifikasi',
            ]);
        });

        return response()->json($magang->load(['mitraIndustri', 'supervisorMitra', 'dpl']), 201);
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
