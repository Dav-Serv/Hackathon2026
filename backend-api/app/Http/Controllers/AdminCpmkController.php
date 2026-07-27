<?php

namespace App\Http\Controllers;

use App\Models\Cpmk;
use App\Models\MataKuliah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCpmkController extends Controller
{
    public function index(MataKuliah $mataKuliah): JsonResponse
    {
        return response()->json($mataKuliah->cpmks()->orderBy('kode_cpmk')->get());
    }

    public function store(Request $request, MataKuliah $mataKuliah): JsonResponse
    {
        $data = $request->validate([
            'kode_cpmk' => ['required', 'string', 'max:50'],
            'deskripsi' => ['required', 'string'],
        ]);
        abort_if($mataKuliah->cpmks()->where('kode_cpmk', $data['kode_cpmk'])->exists(), 422, 'Kode CPMK sudah digunakan pada mata kuliah ini.');

        return response()->json($mataKuliah->cpmks()->create($data), 201);
    }

    public function show(Cpmk $cpmk): JsonResponse
    {
        return response()->json($cpmk->load('mataKuliah'));
    }

    public function update(Request $request, Cpmk $cpmk): JsonResponse
    {
        $data = $request->validate([
            'kode_cpmk' => ['sometimes', 'string', 'max:50', Rule::unique('cpmks', 'kode_cpmk')->where(fn ($query) => $query->where('mata_kuliah_id', $cpmk->mata_kuliah_id))->ignore($cpmk)],
            'deskripsi' => ['sometimes', 'string'],
        ]);
        $cpmk->update($data);

        return response()->json($cpmk->fresh()->load('mataKuliah'));
    }

    public function destroy(Cpmk $cpmk): JsonResponse
    {
        abort_if($cpmk->usulanKonversiDetails()->exists(), 409, 'CPMK sudah digunakan dan tidak dapat dihapus.');
        $cpmk->delete();

        return response()->json(['message' => 'CPMK berhasil dihapus.']);
    }
}
