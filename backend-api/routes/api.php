<?php

use App\Http\Controllers\AdminCpmkController;
use App\Http\Controllers\AdminExportController;
use App\Http\Controllers\AdminMagangController;
use App\Http\Controllers\AdminMasterController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminSuratPengantarController;
use App\Http\Controllers\AdminMataKuliahController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DplReviewController;
use App\Http\Controllers\KaprodiDashboardController;
use App\Http\Controllers\MahasiswaDashboardController;
use App\Http\Controllers\MahasiswaKlaimKonversiController;
use App\Http\Controllers\MahasiswaMagangController;
use App\Http\Controllers\MahasiswaUsulanKonversiController;
use App\Http\Controllers\PrivateDocumentController;
use App\Http\Controllers\PublicApprovalController;
use App\Http\Controllers\SuratPengantarController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::get('/approval/{token}', [PublicApprovalController::class, 'show'])->middleware('throttle:30,1');
Route::post('/approval/{token}', [PublicApprovalController::class, 'submit'])->middleware('throttle:10,1');
Route::get('/public/approval/{token}', [PublicApprovalController::class, 'show'])->middleware('throttle:30,1');
Route::post('/public/approval/{token}/mitra', [PublicApprovalController::class, 'submitMitra'])->middleware('throttle:10,1');
Route::post('/public/approval/{token}/dpl', [PublicApprovalController::class, 'submitDpl'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::match(['post', 'put', 'patch'], '/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dokumen/{dokumen}/temporary-url', [PrivateDocumentController::class, 'temporaryUrl']);
    Route::middleware('role:mahasiswa')->group(function () {
        Route::get('/surat-pengantar', [SuratPengantarController::class, 'index']);
        Route::post('/magang/{magang}/surat-pengantar', [SuratPengantarController::class, 'store']);
        Route::put('/surat-pengantar/{suratPengantar}', [SuratPengantarController::class, 'update']);
        Route::get('/surat-pengantar/{suratPengantar}/download', [SuratPengantarController::class, 'download']);
    });

    Route::middleware('role:dpl')->prefix('dpl')->group(function () {
        Route::get('/usulan-konversi', [DplReviewController::class, 'usulanIndex']);
        Route::post('/usulan-konversi/{usulanKonversi}/review', [DplReviewController::class, 'reviewUsulan']);
        Route::get('/klaim-konversi', [DplReviewController::class, 'klaimIndex']);
        Route::post('/klaim-konversi/{klaimKonversi}/review', [DplReviewController::class, 'reviewKlaim']);
    });

    Route::middleware('role:kaprodi')->group(function () {
        Route::get('/kaprodi/dashboard', [KaprodiDashboardController::class, 'index']);
    });

    Route::middleware('role:admin_prodi')->prefix('admin')->group(function () {
        Route::get('/magang', [AdminMagangController::class, 'index']);
        Route::get('/magang/{magang}/dokumen/{jenis}', [AdminMagangController::class, 'document']);
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::post('/magang/{magang}/verifikasi', [AdminMagangController::class, 'verify']);
        Route::get('/surat-pengantar', [AdminSuratPengantarController::class, 'index']);
        Route::post('/surat-pengantar/{suratPengantar}/terbitkan', [AdminSuratPengantarController::class, 'issue']);
        Route::get('/mitra', [AdminMasterController::class, 'mitra']);
        Route::post('/mitra', [AdminMasterController::class, 'storeMitra']);
        Route::patch('/mitra/{mitra}', [AdminMasterController::class, 'updateMitra']);
        Route::delete('/mitra/{mitra}', [AdminMasterController::class, 'destroyMitra']);
        Route::post('/magang/{magang}/dpl', [AdminMagangController::class, 'assignDpl']);
        Route::get('/dpl', [AdminMagangController::class, 'dpl']);
        Route::get('/mitra/{mitra}/supervisor', [AdminMasterController::class, 'supervisors']);
        Route::post('/mitra/{mitra}/supervisor', [AdminMasterController::class, 'storeSupervisor']);
        Route::patch('/supervisor/{supervisor}', [AdminMasterController::class, 'updateSupervisor']);
        Route::delete('/supervisor/{supervisor}', [AdminMasterController::class, 'destroySupervisor']);
        Route::apiResource('/mata-kuliah', AdminMataKuliahController::class)->parameters(['mata-kuliah' => 'mataKuliah']);
        Route::scopeBindings()->apiResource('/mata-kuliah/{mataKuliah}/cpmk', AdminCpmkController::class)->parameters(['cpmk' => 'cpmk']);
        Route::get('/export/hasil-konversi', [AdminExportController::class, 'hasilKonversi']);
    });

    Route::middleware('role:mahasiswa')->group(function () {
        Route::get('/mahasiswa/dashboard', [MahasiswaDashboardController::class, 'index']);
        Route::get('/mata-kuliah', [AdminMataKuliahController::class, 'index']);
        Route::get('/magang', [MahasiswaMagangController::class, 'index']);
        Route::post('/magang', [MahasiswaMagangController::class, 'store']);
        Route::patch('/magang/{magang}', [MahasiswaMagangController::class, 'update']);
        Route::get('/magang/{magang}', [MahasiswaMagangController::class, 'show']);
        Route::post('/usulan-konversi', [MahasiswaUsulanKonversiController::class, 'store']);
        Route::get('/usulan-konversi/{usulanKonversi}', [MahasiswaUsulanKonversiController::class, 'show']);
        Route::put('/usulan-konversi/{usulanKonversi}', [MahasiswaUsulanKonversiController::class, 'update']);
        Route::post('/klaim-konversi', [MahasiswaKlaimKonversiController::class, 'store']);
        Route::put('/klaim-konversi/{klaimKonversi}', [MahasiswaKlaimKonversiController::class, 'update']);
        Route::get('/klaim-konversi/{klaimKonversi}/hasil', [MahasiswaKlaimKonversiController::class, 'result']);
        Route::get('/klaim-konversi/{klaimKonversi}', [MahasiswaKlaimKonversiController::class, 'show']);
    });
});
