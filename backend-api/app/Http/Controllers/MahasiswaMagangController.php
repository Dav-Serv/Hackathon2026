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
            'mitra_industri_id' => ['nullable', 'required_without:industry_name', 'exists:mitra_industris,id'],
            'supervisor_mitra_id' => ['nullable', 'required_without:supervisor_name', 'exists:supervisor_mitras,id'],
            'industry_name' => ['nullable', 'required_without:mitra_industri_id', 'string', 'max:255'],
            'industry_address' => ['nullable', 'required_with:industry_name', 'string', 'max:1000'],
            'industry_field' => ['nullable', 'required_with:industry_name', 'string', 'max:255'],
            'supervisor_name' => ['nullable', 'required_without:supervisor_mitra_id', 'string', 'max:255'],
            'supervisor_email' => ['nullable', 'required_without:supervisor_mitra_id', 'email', 'max:255'],
            'supervisor_phone' => ['nullable', 'required_without:supervisor_mitra_id', 'string', 'max:50'],
            'dpl_id' => [
                'required',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'dpl')->whereRaw('is_active IS TRUE');
                }),
            ],
            'jenis_program' => ['required', Rule::in(['magang', 'studi_independen'])],
            'posisi' => ['required', 'string', 'max:255'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['required', 'date', 'after_or_equal:periode_mulai'],
            'proposal_file' => ['required', 'file', 'mimes:pdf,docx', 'max:10240','mimetypes:application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'bukti_diterima_file' => ['required', 'file', 'mimes:pdf,docx', 'max:10240','mimetypes:application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ]);
        $data = DB::transaction(function () use ($data) {
            if (! empty($data['industry_name'])) {
                $mitra = MitraIndustri::firstOrCreate(
                    ['nama_perusahaan' => $data['industry_name']],
                    ['alamat' => $data['industry_address'], 'bidang' => $data['industry_field']],
                );
                $mitra->update(array_filter([
                    'alamat' => $data['industry_address'] ?? null,
                    'bidang' => $data['industry_field'] ?? null,
                ], static fn ($value) => $value !== null));
                $data['mitra_industri_id'] = $mitra->id;
                $supervisor = SupervisorMitra::firstOrCreate(
                    ['mitra_industri_id' => $mitra->id, 'email' => $data['supervisor_email']],
                    ['nama' => $data['supervisor_name'], 'no_hp' => $data['supervisor_phone'] ?? null],
                );
                $supervisor->update(array_filter([
                    'nama' => $data['supervisor_name'] ?? null,
                    'no_hp' => $data['supervisor_phone'] ?? null,
                ], static fn ($value) => $value !== null));
                $data['supervisor_mitra_id'] = $supervisor->id;
            }
            abort_unless(SupervisorMitra::whereKey($data['supervisor_mitra_id'])->where('mitra_industri_id', $data['mitra_industri_id'])->exists(), 422, 'Supervisor bukan bagian dari mitra.');

            return $data;
        });
        unset($data['industry_name'], $data['industry_address'], $data['industry_field'], $data['supervisor_name'], $data['supervisor_email'], $data['supervisor_phone']);
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
