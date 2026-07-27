<?php

namespace App\Http\Controllers;

use App\Models\Dokumen;
use App\Services\PrivateDocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivateDocumentController extends Controller
{
    public function temporaryUrl(Request $request, Dokumen $dokumen, PrivateDocumentService $service): JsonResponse
    {
        return response()->json(['url' => $service->temporaryUrl($dokumen, $request->user()), 'expires_at' => now()->addMinutes(10)->toISOString()]);
    }
}
