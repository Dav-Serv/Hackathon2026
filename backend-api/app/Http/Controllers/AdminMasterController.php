<?php

namespace App\Http\Controllers;

use App\Models\MitraIndustri;
use App\Models\SupervisorMitra;
use Illuminate\Http\Request;

class AdminMasterController extends Controller
{
    public function mitra() { return response()->json(MitraIndustri::with('supervisors')->paginate(15)); }
    public function storeMitra(Request $request) { return response()->json(MitraIndustri::create($request->validate(['nama_perusahaan'=>'required|string|max:255','alamat'=>'nullable|string','bidang'=>'nullable|string'])), 201); }
    public function updateMitra(Request $request, MitraIndustri $mitra) { $mitra->update($request->validate(['nama_perusahaan'=>'sometimes|string|max:255','alamat'=>'nullable|string','bidang'=>'nullable|string'])); return response()->json($mitra->fresh()); }
    public function destroyMitra(MitraIndustri $mitra) { $mitra->delete(); return response()->noContent(); }
    public function supervisors(MitraIndustri $mitra) { return response()->json($mitra->supervisors); }
    public function storeSupervisor(Request $request, MitraIndustri $mitra) { return response()->json($mitra->supervisors()->create($request->validate(['nama'=>'required|string|max:255','email'=>'required|email','no_hp'=>'nullable|string|max:50'])), 201); }
    public function updateSupervisor(Request $request, SupervisorMitra $supervisor) { $supervisor->update($request->validate(['nama'=>'sometimes|string|max:255','email'=>'sometimes|email','no_hp'=>'nullable|string|max:50'])); return response()->json($supervisor->fresh()); }
    public function destroySupervisor(SupervisorMitra $supervisor) { $supervisor->delete(); return response()->noContent(); }
}
