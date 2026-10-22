<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnimalType;
use App\Models\RabiesCase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RabiesCaseController extends Controller
{
    /**
     * Tampilkan data surveilans kasus gigitan hewan penular rabies (GHPR).
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $statusVar = $request->input('status_var');
        $statusHewan = $request->input('status_hewan');

        $query = RabiesCase::with(['jenisHewan', 'admin'])
            ->when($statusVar, function ($q, $status) {
                $q->where('status_var', $status);
            })
            ->when($statusHewan, function ($q, $status) {
                $q->where('status_hewan', $status);
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama_pasien', 'like', "%{$search}%")
                        ->orWhere('no_surat', 'like', "%{$search}%")
                        ->orWhere('nik_pasien', 'like', "%{$search}%")
                        ->orWhere('alamat_pasien', 'like', "%{$search}%")
                        ->orWhere('kronologi', 'like', "%{$search}%")
                        ->orWhere('nama_pemilik_hewan', 'like', "%{$search}%");
                });
            })
            ->orderBy('tgl_kejadian', 'desc');

        $cases = $query->paginate(5)->withQueryString();

        $cases->getCollection()->transform(function ($case) {
            return [
                'id' => $case->id,
                'no_surat' => $case->no_surat,
                'lampiran' => $case->lampiran ?? '-',
                'perihal' => $case->perihal,
                'nik_pasien' => $case->nik_pasien,
                'nama_pasien' => $case->nama_pasien,
                'jenis_kelamin_pasien' => $case->jenis_kelamin_pasien,
                'umur_pasien' => $case->umur_pasien,
                'tgl_lahir_pasien' => $case->tgl_lahir_pasien ? $case->tgl_lahir_pasien->format('d/m/Y') : '-',
                'alamat_pasien' => $case->alamat_pasien,
                'no_hp_pasien' => $case->no_hp_pasien ?? '-',
                'lokasi_gigitan' => $case->lokasi_gigitan,
                'status_var' => $case->status_var,
                'id_jenis_hewan' => $case->id_jenis_hewan,
                'jenis_hewan' => $case->jenisHewan?->nama_jenis ?? '-',
                'ras_hewan' => $case->ras_hewan ?? '-',
                'jenis_kelamin_hewan' => $case->jenis_kelamin_hewan,
                'umur_hewan' => $case->umur_hewan ?? '-',
                'nama_pemilik_hewan' => $case->nama_pemilik_hewan ?? 'Liar / Tidak Bertuan',
                'status_hewan' => $case->status_hewan,
                'tgl_kejadian' => $case->tgl_kejadian ? $case->tgl_kejadian->format('d/m/Y') : '-',
                'raw_tgl_kejadian' => $case->tgl_kejadian ? $case->tgl_kejadian->toDateString() : '',
                'alamat_kejadian' => $case->alamat_kejadian,
                'kronologi' => $case->kronologi,
                'petugas' => $case->admin?->name ?? 'Petugas Loket',
            ];
        });

        $animalTypes = AnimalType::all(['id', 'nama_jenis']);

        $totalKasus = RabiesCase::count();
        $totalVar = RabiesCase::where('status_var', 'like', '%Sudah%')
            ->orWhere('status_var', 'like', '%Diberikan%')
            ->count();
        $totalObservasi = RabiesCase::where('status_hewan', 'like', '%Observasi%')->count();
        $totalMati = RabiesCase::where('status_hewan', 'like', '%Mati%')
            ->orWhere('status_hewan', 'like', '%Positif%')
            ->count();

        $suggestedNoSurat = RabiesCase::generateNextNoSurat();

        return Inertia::render('admin/rabies/index', [
            'cases' => $cases,
            'animalTypes' => $animalTypes,
            'suggestedNoSurat' => $suggestedNoSurat,
            'summary' => [
                'total_kasus' => $totalKasus,
                'total_var' => $totalVar,
                'total_observasi' => $totalObservasi,
                'total_mati' => $totalMati,
            ],
            'filters' => [
                'search' => $search,
                'status_var' => $statusVar,
                'status_hewan' => $statusHewan,
            ],
        ]);
    }

    /**
     * Tampilkan formulir pencatatan kasus gigitan rabies baru (Dedicated Page).
     */
    public function create(): Response
    {
        $animalTypes = AnimalType::all(['id', 'nama_jenis']);
        $suggestedNoSurat = RabiesCase::generateNextNoSurat();

        return Inertia::render('admin/rabies/create', [
            'animalTypes' => $animalTypes,
            'suggestedNoSurat' => $suggestedNoSurat,
        ]);
    }

    /**
     * Tampilkan formulir edit kasus gigitan rabies (Dedicated Page).
     */
    public function edit(RabiesCase $rabiesCase): Response
    {
        $animalTypes = AnimalType::all(['id', 'nama_jenis']);

        return Inertia::render('admin/rabies/edit', [
            'rabiesCase' => [
                'id' => $rabiesCase->id,
                'no_surat' => $rabiesCase->no_surat,
                'lampiran' => $rabiesCase->lampiran ?? '',
                'perihal' => $rabiesCase->perihal,
                'nik_pasien' => $rabiesCase->nik_pasien,
                'nama_pasien' => $rabiesCase->nama_pasien,
                'jenis_kelamin_pasien' => $rabiesCase->jenis_kelamin_pasien,
                'umur_pasien' => $rabiesCase->umur_pasien,
                'alamat_pasien' => $rabiesCase->alamat_pasien,
                'no_hp_pasien' => $rabiesCase->no_hp_pasien ?? '',
                'lokasi_gigitan' => $rabiesCase->lokasi_gigitan,
                'status_var' => $rabiesCase->status_var,
                'id_jenis_hewan' => $rabiesCase->id_jenis_hewan,
                'ras_hewan' => $rabiesCase->ras_hewan ?? '',
                'jenis_kelamin_hewan' => $rabiesCase->jenis_kelamin_hewan,
                'umur_hewan' => $rabiesCase->umur_hewan ?? '',
                'nama_pemilik_hewan' => $rabiesCase->nama_pemilik_hewan ?? '',
                'status_hewan' => $rabiesCase->status_hewan,
                'tgl_kejadian' => $rabiesCase->tgl_kejadian ? $rabiesCase->tgl_kejadian->toDateString() : '',
                'alamat_kejadian' => $rabiesCase->alamat_kejadian,
                'kronologi' => $rabiesCase->kronologi,
            ],
            'animalTypes' => $animalTypes,
        ]);
    }

    /**
     * Simpan laporan kasus gigitan rabies baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'no_surat' => 'nullable|string|max:100',
            'lampiran' => 'nullable|string|max:100',
            'perihal' => 'required|string|max:255',
            'id_jenis_hewan' => 'required|exists:animal_types,id',
            'nik_pasien' => 'required|string|size:16',
            'nama_pasien' => 'required|string|max:150',
            'jenis_kelamin_pasien' => 'required|in:Laki-Laki,Perempuan',
            'umur_pasien' => 'required|string|max:50',
            'tgl_lahir_pasien' => 'nullable|date',
            'alamat_pasien' => 'required|string|max:500',
            'no_hp_pasien' => 'nullable|string|max:20',
            'lokasi_gigitan' => 'required|string|max:100',
            'status_var' => 'required|string|max:50',
            'jenis_kelamin_hewan' => 'required|in:Jantan,Betina',
            'ras_hewan' => 'nullable|string|max:100',
            'umur_hewan' => 'nullable|string|max:50',
            'nama_pemilik_hewan' => 'nullable|string|max:150',
            'status_hewan' => 'required|string|max:50',
            'tgl_kejadian' => 'required|date',
            'alamat_kejadian' => 'required|string|max:500',
            'kronologi' => 'required|string|max:2000',
        ]);

        $validated['no_surat'] = RabiesCase::generateNextNoSurat();
        $validated['id_admin'] = $request->user()->id;

        RabiesCase::create($validated);

        return redirect()->route('admin.rabies.index')->with(
            'success',
            "Laporan surveilans gigitan rabies pasien {$validated['nama_pasien']} berhasil didata!"
        );
    }

    /**
     * Perbarui data laporan kasus gigitan rabies.
     */
    public function update(Request $request, RabiesCase $rabiesCase): RedirectResponse
    {
        $validated = $request->validate([
            'no_surat' => 'required|string|max:100',
            'lampiran' => 'nullable|string|max:100',
            'perihal' => 'required|string|max:255',
            'id_jenis_hewan' => 'required|exists:animal_types,id',
            'nik_pasien' => 'required|string|size:16',
            'nama_pasien' => 'required|string|max:150',
            'jenis_kelamin_pasien' => 'required|in:Laki-Laki,Perempuan',
            'umur_pasien' => 'required|string|max:50',
            'tgl_lahir_pasien' => 'nullable|date',
            'alamat_pasien' => 'required|string|max:500',
            'no_hp_pasien' => 'nullable|string|max:20',
            'lokasi_gigitan' => 'required|string|max:100',
            'status_var' => 'required|string|max:50',
            'jenis_kelamin_hewan' => 'required|in:Jantan,Betina',
            'ras_hewan' => 'nullable|string|max:100',
            'umur_hewan' => 'nullable|string|max:50',
            'nama_pemilik_hewan' => 'nullable|string|max:150',
            'status_hewan' => 'required|string|max:50',
            'tgl_kejadian' => 'required|date',
            'alamat_kejadian' => 'required|string|max:500',
            'kronologi' => 'required|string|max:2000',
        ]);

        $rabiesCase->update($validated);

        return redirect()->route('admin.rabies.index')->with(
            'success',
            "Data laporan gigitan rabies {$rabiesCase->nama_pasien} ({$rabiesCase->no_surat}) berhasil diperbarui!"
        );
    }

    /**
     * Hapus data laporan kasus gigitan rabies.
     */
    public function destroy(RabiesCase $rabiesCase): RedirectResponse
    {
        $nama = $rabiesCase->nama_pasien;
        $noSurat = $rabiesCase->no_surat;
        $rabiesCase->delete();

        return redirect()->back()->with(
            'success',
            "Laporan kasus rabies {$nama} ({$noSurat}) berhasil dihapus."
        );
    }
}
