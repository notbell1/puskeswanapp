<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Examination;
use App\Models\Medicine;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DokterExaminationController extends Controller
{
    /**
     * Tampilkan formulir pemeriksaan klinis & rekam medis pasien.
     */
    public function create(Visit $visit): Response
    {
        $visit->load([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan,jenis_kelamin,umur,warna_hewan',
            'animal.pemilik:id,nama_lengkap,nik,no_hp_wa,alamat_lengkap',
            'animal.jenisHewan:id,nama_jenis',
            'admin:id,name',
            'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan,waktu_selesai',
            'examination.dokter:id,name,foto,id_staf',
            'examination.dokter.staf:id,nama_staf,foto',
        ]);

        $historicalRecords = Visit::with([
            'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan',
            'examination.dokter:id,name,foto,id_staf',
            'examination.dokter.staf:id,nama_staf,foto',
        ])
            ->where('id_hewan', $visit->id_hewan)
            ->where('id', '!=', $visit->id)
            ->where('status_antrean', 'Selesai')
            ->orderBy('tgl_kunjungan', 'desc')
            ->get([
                'id',
                'id_hewan',
                'tgl_kunjungan',
                'berat_badan',
                'suhu_tubuh',
                'anamnesa',
                'status_antrean',
            ])
            ->map(fn ($oldVisit) => [
                'id' => $oldVisit->id,
                'tgl_kunjungan' => $oldVisit->tgl_kunjungan ? $oldVisit->tgl_kunjungan->format('d/m/Y H:i') : '-',
                'berat_badan' => (float) $oldVisit->berat_badan,
                'suhu_tubuh' => (float) $oldVisit->suhu_tubuh,
                'anamnesa' => $oldVisit->anamnesa,
                'diagnosa' => $oldVisit->examination?->diagnosa ?? '-',
                'terapi_pengobatan' => $oldVisit->examination?->terapi_pengobatan ?? '-',
                'catatan' => $oldVisit->examination?->catatan ?? '-',
                'dokter' => $oldVisit->examination?->dokter?->name ?? 'drh. Puskeswan',
                'dokter_foto' => User::resolvePhotoUrl($oldVisit->examination?->dokter?->foto ?: $oldVisit->examination?->dokter?->staf?->foto),
            ]);

        $medicines = Medicine::orderBy('nama_obat', 'asc')->get([
            'id',
            'kode_obat',
            'nama_obat',
            'stok',
            'satuan',
        ]);

        $exam = $visit->examination;

        $visitData = [
            'id' => $visit->id,
            'id_hewan' => $visit->animal?->id,
            'no_rm' => $visit->animal?->no_rm ?? '-',
            'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
            'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
            'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
            'umur' => $visit->animal?->umur ?? '-',
            'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
            'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
            'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
            'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
            'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
            'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y H:i') : '-',
            'berat_badan' => (float) $visit->berat_badan,
            'suhu_tubuh' => (float) $visit->suhu_tubuh,
            'anamnesa' => $visit->anamnesa,
            'status_antrean' => $visit->status_antrean,
            'admin_petugas' => $visit->admin?->name ?? 'Admin Loket',
            'existing_examination' => $exam ? [
                'diagnosa' => $exam->diagnosa,
                'terapi_pengobatan' => $exam->terapi_pengobatan,
                'catatan' => $exam->catatan,
                'waktu_selesai' => $exam->waktu_selesai ? $exam->waktu_selesai->format('d/m/Y H:i') : null,
            ] : null,
        ];

        return Inertia::render('dokter/pemeriksaan', [
            'visit' => $visitData,
            'historicalRecords' => $historicalRecords,
            'medicines' => $medicines,
        ]);
    }

    /**
     * Simpan hasil pemeriksaan diagnosa klinis, tindakan, dan resep terapi obat.
     */
    public function store(Request $request, Visit $visit): RedirectResponse
    {
        $validated = $request->validate([
            'diagnosa' => 'required|string|max:2000',
            'terapi_pengobatan' => 'required|string|max:3000',
            'catatan' => 'nullable|string|max:2000',
        ], [
            'diagnosa.required' => 'Diagnosa klinis dokter wajib diisi.',
            'terapi_pengobatan.required' => 'Terapi pengobatan dan tindakan medis wajib diisi.',
        ]);

        return DB::transaction(function () use ($request, $visit, $validated) {
            $isEditing = Examination::where('id_kunjungan', $visit->id)->exists();

            Examination::updateOrCreate(
                ['id_kunjungan' => $visit->id],
                [
                    'id_dokter' => $request->user()->id,
                    'waktu_selesai' => now(),
                    'diagnosa' => $validated['diagnosa'],
                    'terapi_pengobatan' => $validated['terapi_pengobatan'],
                    'catatan' => $validated['catatan'] ?? null,
                ]
            );

            $visit->update([
                'status_antrean' => 'Selesai',
            ]);

            $message = $isEditing
                ? "Perubahan data rekam medis pasien {$visit->animal?->nama_hewan} ({$visit->animal?->no_rm}) berhasil disimpan."
                : "Pemeriksaan pasien {$visit->animal?->nama_hewan} ({$visit->animal?->no_rm}) selesai dicatat.";
            $flashKey = $isEditing ? 'blue' : 'success';

            if ($request->input('redirect_to') === 'antrian' || str_contains((string) $request->headers->get('referer', ''), '/dokter/antrian')) {
                return redirect()->back()->with($flashKey, $message);
            }

            return redirect()->route('dokter.riwayat.index')->with($flashKey, $message);
        });
    }
}
