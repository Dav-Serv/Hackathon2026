<?php

namespace App\Http\Controllers;

use App\Models\MataKuliah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminMataKuliahController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(MataKuliah::with('cpmks')->orderBy('kode_mk')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kode_mk' => ['required', 'string', 'max:50', 'unique:mata_kuliahs,kode_mk'],
            'nama_mk' => ['required', 'string', 'max:255'],
            'sks' => ['required', 'integer', 'min:1', 'max:255'],
            'sumber' => ['sometimes', 'string', 'max:100'],
        ]);

        return response()->json(MataKuliah::create($data)->load('cpmks'), 201);
    }

    public function show(MataKuliah $mataKuliah): JsonResponse
    {
        return response()->json($mataKuliah->load('cpmks'));
    }

    public function update(Request $request, MataKuliah $mataKuliah): JsonResponse
    {
        $data = $request->validate([
            'kode_mk' => ['sometimes', 'string', 'max:50', Rule::unique('mata_kuliahs', 'kode_mk')->ignore($mataKuliah)],
            'nama_mk' => ['sometimes', 'string', 'max:255'],
            'sks' => ['sometimes', 'integer', 'min:1', 'max:255'],
            'sumber' => ['sometimes', 'string', 'max:100'],
        ]);
        $mataKuliah->update($data);

        return response()->json($mataKuliah->fresh()->load('cpmks'));
    }

    public function destroy(MataKuliah $mataKuliah): JsonResponse
    {
        abort_if($mataKuliah->usulanKonversiDetails()->exists() || $mataKuliah->nilaiAkhirs()->exists(), 409, 'Mata kuliah sudah digunakan dan tidak dapat dihapus.');
        $mataKuliah->delete();

        return response()->json(['message' => 'Mata kuliah berhasil dihapus.']);
    }
}
