<?php

namespace Tests\Feature;

use App\Exports\HasilKonversiExport;
use App\Models\Cpmk;
use App\Models\Dokumen;
use App\Models\KlaimKonversi;
use App\Models\Magang;
use App\Models\MataKuliah;
use App\Models\MitraIndustri;
use App\Models\PenilaianDpl;
use App\Models\PenilaianMitra;
use App\Models\SupervisorMitra;
use App\Models\SuratPengantar;
use App\Models\TokenApproval;
use App\Models\User;
use App\Models\UsulanKonversi;
use App\Models\UsulanKonversiDetail;
use App\Services\ApprovalTokenService;
use App\Services\ValueCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class RevisedFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_middleware_rejects_wrong_role(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'mahasiswa']))
            ->getJson('/api/admin/export/hasil-konversi')
            ->assertForbidden();
    }

    public function test_approval_token_valid_expired_and_used(): void
    {
        $claim = $this->claim();
        $service = app(ApprovalTokenService::class);
        $valid = $service->issue($claim, 'mitra');

        $this->getJson('/api/approval/'.$valid)->assertOk();
        $this->postJson('/api/approval/'.$valid, ['nilai' => 80])->assertOk();
        $this->getJson('/api/approval/'.$valid)->assertStatus(Response::HTTP_GONE);

        $expired = $service->issue($claim, 'mitra');
        TokenApproval::where('token_hash', hash('sha256', $expired))->update(['expires_at' => now()->subMinute()]);
        $this->getJson('/api/approval/'.$expired)->assertStatus(Response::HTTP_GONE);
    }

    public function test_value_calculation_and_result_endpoint(): void
    {
        $claim = $this->claim();
        PenilaianMitra::create(['klaim_konversi_id' => $claim->id, 'nilai' => 90, 'submitted_at' => now()]);
        PenilaianDpl::create(['klaim_konversi_id' => $claim->id, 'nilai_akademik' => 70, 'keputusan' => 'setuju', 'submitted_at' => now()]);
        $result = app(ValueCalculationService::class)->calculate($claim->fresh('usulanKonversi.details'));

        $this->assertSame(84.0, (float) $result->nilai_akhir);
        $this->assertSame('AB', $result->nilai_huruf);
        $this->actingAs($claim->magang->mahasiswa)->getJson('/api/klaim-konversi/'.$claim->id.'/hasil')
            ->assertOk()->assertJsonPath('nilai_akhirs.0.nilai_akhir', '84.00');
    }

    public function test_private_document_temporary_url_authorization(): void
    {
        Storage::fake('supabase');
        Storage::disk('supabase')->put('private.pdf', 'x');
        $claim = $this->claim();
        $document = Dokumen::create(['referensi_tabel' => 'klaim_konversis', 'referensi_id' => $claim->id, 'jenis_dokumen' => 'laporan', 'path_file' => 'private.pdf']);
        Storage::shouldReceive('disk')->andReturnSelf();
        Storage::shouldReceive('temporaryUrl')->andReturn('https://temporary.test/private.pdf');

        $this->actingAs($claim->magang->mahasiswa)->getJson('/api/dokumen/'.$document->id.'/temporary-url')->assertOk()->assertJsonPath('url', 'https://temporary.test/private.pdf');
        $this->actingAs(User::factory()->create())->getJson('/api/dokumen/'.$document->id.'/temporary-url')->assertForbidden();
    }

    public function test_xlsx_export_requires_admin(): void
    {
        Excel::fake();
        $this->actingAs(User::factory()->create(['role' => 'mahasiswa']))->get('/api/admin/export/hasil-konversi')->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => 'admin_prodi']))->get('/api/admin/export/hasil-konversi')->assertOk();
        Excel::assertDownloaded('hasil-konversi-'.now()->format('Ymd_His').'.xlsx', fn (HasilKonversiExport $export) => true);
    }

    public function test_surat_pengantar_lifecycle_and_access(): void
    {
        Storage::fake('supabase');
        $claim = $this->claim();
        $student = $claim->magang->mahasiswa;
        $response = $this->actingAs($student)->postJson('/api/magang/'.$claim->magang_id.'/surat-pengantar', ['file' => UploadedFile::fake()->create('surat.pdf', 10, 'application/pdf')]);
        $response->assertCreated()->assertJsonPath('status', 'diajukan');
        $surat = SuratPengantar::first();
        $admin = User::factory()->create(['role' => 'admin_prodi']);
        $this->actingAs($admin)->post('/api/admin/surat-pengantar/'.$surat->id.'/terbitkan', ['status' => 'disetujui', 'file' => UploadedFile::fake()->create('surat-terbit.pdf', 10, 'application/pdf')])->assertOk();
        $this->actingAs(User::factory()->create(['role' => 'dpl']))->getJson('/api/surat-pengantar')->assertForbidden();
        $this->actingAs($student)->getJson('/api/surat-pengantar/'.$surat->id.'/download')->assertOk()->assertJsonStructure(['url']);
    }

    private function claim(): KlaimKonversi
    {
        $student = User::factory()->create(['role' => 'mahasiswa']);
        $dpl = User::factory()->create(['role' => 'dpl']);
        $mitra = MitraIndustri::create(['nama_perusahaan' => 'Acme']);
        $supervisor = SupervisorMitra::create(['mitra_industri_id' => $mitra->id, 'nama' => 'Supervisor', 'email' => 'supervisor@example.test']);
        $magang = Magang::create(['mahasiswa_id' => $student->id, 'mitra_industri_id' => $mitra->id, 'supervisor_mitra_id' => $supervisor->id, 'dpl_id' => $dpl->id, 'posisi' => 'Developer', 'periode_mulai' => now()->subMonths(2), 'periode_selesai' => now()->subMonth(), 'proposal_file' => 'proposal.pdf', 'bukti_diterima_file' => 'accepted.pdf', 'status' => 'disetujui']);
        $mataKuliah = MataKuliah::create(['kode_mk' => 'MK01', 'nama_mk' => 'Programming', 'sks' => 3]);
        $cpmk = Cpmk::create(['mata_kuliah_id' => $mataKuliah->id, 'kode_cpmk' => 'CPMK01', 'deskripsi' => 'Programming']);
        $usulan = UsulanKonversi::create(['magang_id' => $magang->id, 'status' => 'disetujui']);
        UsulanKonversiDetail::create(['usulan_konversi_id' => $usulan->id, 'mata_kuliah_id' => $mataKuliah->id, 'cpmk_id' => $cpmk->id, 'deskripsi_aktivitas_rencana' => 'Build API']);

        return KlaimKonversi::create(['usulan_konversi_id' => $usulan->id, 'magang_id' => $magang->id, 'logbook_file' => 'logbook.pdf', 'laporan_file' => 'laporan.pdf', 'sertifikat_file' => 'sertifikat.pdf', 'status' => 'menunggu_penilaian_mitra']);
    }
}
