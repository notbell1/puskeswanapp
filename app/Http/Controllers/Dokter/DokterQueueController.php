<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DokterQueueController extends Controller
{
    /**
     * Tampilkan antrean pemeriksaan pasien hewan untuk dokter.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $statusFilter = $request->input('status');
        $dateFilter = $request->input('tanggal');

        $query = Visit::with([
            'animal.pemilik',
            'animal.jenisHewan',
            'admin',
            'examination.dokter.staf',
            'animal.visits' => function ($q) {
                $q->where('status_antrean', 'Selesai')
                    ->with(['examination.dokter.staf'])
                    ->orderBy('tgl_kunjungan', 'desc');
            },
        ])
            ->where('status_antrean', 'Antri')
            ->when($dateFilter, function ($q, $date) {
                $q->whereDate('tgl_kunjungan', $date);
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('anamnesa', 'like', "%{$search}%")
                        ->orWhereHas('animal', function ($qa) use ($search) {
                            $qa->where('nama_hewan', 'like', "%{$search}%")
                                ->orWhere('no_rm', 'like', "%{$search}%")
                                ->orWhereHas('pemilik', function ($qp) use ($search) {
                                    $qp->where('nama_lengkap', 'like', "%{$search}%")
                                        ->orWhere('nik', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->orderBy('tgl_kunjungan', 'asc');

        $visits = $query->paginate(5)->withQueryString();

        $visits->getCollection()->transform(function ($visit) {
            $exam = $visit->examination;

            $historicalRecords = $visit->animal?->visits
                ? $visit->animal->visits
                    ->filter(fn ($v) => $v->id !== $visit->id)
                    ->values()
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
                    ])
                : collect();

            return [
                'id' => $visit->id,
                'no_rm' => $visit->animal?->no_rm ?? '-',
                'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                'id_hewan' => $visit->animal?->id,
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
                'umur' => $visit->animal?->umur ?? '-',
                'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
                'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y') : '-',
                'jam_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('H:i').' WIB' : '-',
                'waktu_lengkap' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y H:i') : '-',
                'raw_tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->toDateString() : '',
                'berat_badan' => (float) $visit->berat_badan,
                'suhu_tubuh' => (float) $visit->suhu_tubuh,
                'anamnesa' => $visit->anamnesa,
                'status_antrean' => $visit->status_antrean,
                'admin_petugas' => $visit->admin?->name ?? 'Admin Loket',
                'has_examination' => (bool) $exam,
                'diagnosa' => $exam?->diagnosa ?? '',
                'terapi_pengobatan' => $exam?->terapi_pengobatan ?? '',
                'catatan' => $exam?->catatan ?? '',
                'dokter_nama' => $exam?->dokter?->name,
                'dokter_foto' => User::resolvePhotoUrl($exam?->dokter?->foto ?: $exam?->dokter?->staf?->foto),
                'historical_records' => $historicalRecords,
            ];
        });

        $medicines = Medicine::orderBy('nama_obat', 'asc')->get([
            'id',
            'kode_obat',
            'nama_obat',
            'stok',
            'satuan',
        ]);

        $today = now()->toDateString();
        $totalAntriHariIni = Visit::whereDate('tgl_kunjungan', $today)->where('status_antrean', 'Antri')->count();
        $totalAntriSemua = Visit::where('status_antrean', 'Antri')->count();
        $totalSelesaiHariIni = Visit::whereDate('tgl_kunjungan', $today)->where('status_antrean', 'Selesai')->count();

        return Inertia::render('dokter/antrian', [
            'visits' => $visits,
            'medicines' => $medicines,
            'filters' => [
                'search' => $search,
                'status' => 'Antri',
                'tanggal' => $dateFilter ?? '',
            ],
            'summary' => [
                'total' => $totalAntriSemua,
                'antri' => $totalAntriHariIni,
                'selesai' => $totalSelesaiHariIni,
            ],
        ]);
    }

    /**
     * Mulai proses pemeriksaan tanpa merubah status antrean (tetap Antri hingga selesai diperiksa).
     */
    public function startExamination(Visit $visit): RedirectResponse
    {
        return redirect()->route('dokter.pemeriksaan.create', $visit->id);
    }

    /**
     * Perbarui status antrean pasien secara manual (Hanya Antri atau Selesai).
     */
    public function updateStatus(Request $request, Visit $visit): RedirectResponse
    {
        if ($visit->status_antrean === 'Selesai') {
            return redirect()->back()->with('error', 'Status pasien yang telah selesai diperiksa terkunci dan tidak dapat diubah kecuali dihapus.');
        }

        $validated = $request->validate([
            'status_antrean' => 'required|in:Antri,Selesai',
        ]);

        $visit->update([
            'status_antrean' => $validated['status_antrean'],
        ]);

        return redirect()->back()->with(
            'success',
            "Status antrean pasien {$visit->animal?->nama_hewan} berhasil diubah menjadi '{$validated['status_antrean']}'."
        );
    }

    /**
     * Hapus data antrean dan pemeriksaan terkait.
     */
    public function destroy(Visit $visit): RedirectResponse
    {
        $namaHewan = $visit->animal?->nama_hewan ?? 'Pasien';
        $visit->delete();

        return redirect()->back()->with(
            'deleted',
            "Data antrean pasien {$namaHewan} berhasil dihapus dari sistem."
        );
    }

    /**
     * Endpoint API JSON untuk polling realtime lonceng notifikasi header antrean.
     */
    public function realtimeQueue(): JsonResponse
    {
        $today = now()->toDateString();
        $totalAntri = Visit::whereDate('tgl_kunjungan', $today)
            ->where('status_antrean', 'Antri')
            ->count();

        $totalSelesai = Visit::whereDate('tgl_kunjungan', $today)
            ->where('status_antrean', 'Selesai')
            ->count();

        $waitingList = Visit::with(['animal.pemilik', 'animal.jenisHewan'])
            ->whereDate('tgl_kunjungan', $today)
            ->where('status_antrean', 'Antri')
            ->orderBy('tgl_kunjungan', 'asc')
            ->take(6)
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'no_rm' => $v->animal?->no_rm ?? '-',
                'nama_hewan' => $v->animal?->nama_hewan ?? 'Hewan Pasien',
                'jenis_hewan' => $v->animal?->jenisHewan?->nama_jenis ?? 'Hewan',
                'pemilik' => $v->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'anamnesa' => $v->anamnesa ?? '-',
                'jam_kunjungan' => $v->tgl_kunjungan ? $v->tgl_kunjungan->format('H:i').' WIB' : '-',
                'waktu_relatif' => $v->tgl_kunjungan ? $v->tgl_kunjungan->diffForHumans() : '-',
            ]);

        return response()->json([
            'count' => $totalAntri,
            'total_antri' => $totalAntri,
            'total_selesai' => $totalSelesai,
            'waiting_list' => $waitingList,
        ]);
    }
}
