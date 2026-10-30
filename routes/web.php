<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\MedicalRecordResultController;
use App\Http\Controllers\Admin\PatientController;
use App\Http\Controllers\Admin\RabiesCaseController as AdminRabiesCaseController;
use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Dokter\DokterDashboardController;
use App\Http\Controllers\Dokter\DokterExaminationController;
use App\Http\Controllers\Dokter\DokterHistoryController;
use App\Http\Controllers\Dokter\DokterQueueController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StorageFileController;
use App\Http\Controllers\Super\AnimalTypeController;
use App\Http\Controllers\Super\ArticleController;
use App\Http\Controllers\Super\InventoryController;
use App\Http\Controllers\Super\MedicineController;
use App\Http\Controllers\Super\MonitoringController;
use App\Http\Controllers\Super\ReportController;
use App\Http\Controllers\Super\StaffController;
use App\Http\Controllers\Super\SuperDashboardController;
use App\Http\Controllers\Super\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Sistem Informasi Puskeswan
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/tentang', [HomeController::class, 'index'])->name('tentang');
Route::get('/cek-rekam-medis', [HomeController::class, 'index'])->name('cek-rekam-medis');
Route::post('/cek-rekam-medis/cari', [HomeController::class, 'searchMedicalRecords'])
    ->middleware('throttle:10,1')
    ->name('cek-rekam-medis.cari');
Route::get('/captcha/generate', [HomeController::class, 'generateCaptcha'])->name('captcha.generate');
Route::get('/berita', [HomeController::class, 'index'])->name('berita');
Route::get('/berita/author/{author}', [HomeController::class, 'articlesByAuthor'])->name('berita.author');
Route::get('/berita/ketegori/{kategori}', [HomeController::class, 'articlesByCategory'])->name('berita.ketegori');
Route::get('/berita/kategori/{kategori}', [HomeController::class, 'articlesByCategory'])->name('berita.kategori');
Route::get('/berita/{slug}', [HomeController::class, 'showArticle'])->name('berita.show');
Route::get('/staff', [HomeController::class, 'index'])->name('staff');
Route::get('/kontak', [HomeController::class, 'index'])->name('kontak');

// Secure Controller-brokered public media file delivery
Route::get('/storage/{path}', [StorageFileController::class, 'show'])
    ->where('path', '.*')
    ->name('storage.file');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('password.store');
});

Route::get('/429', [AuthenticatedSessionController::class, 'blockedIp'])->name('ip.blocked');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/profil', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/pengaturan-akun', [ProfileController::class, 'edit'])->name('profile.settings');
    Route::post('/profil', [ProfileController::class, 'update'])
        ->middleware('throttle:15,1')
        ->name('profile.update');
    Route::put('/profil/password', [ProfileController::class, 'updatePassword'])
        ->middleware('throttle:10,1')
        ->name('profile.password');
    Route::delete('/profil/foto', [ProfileController::class, 'deletePhoto'])->name('profile.photo.destroy');

    Route::get('/api/realtime/queue-notifications', [DokterQueueController::class, 'realtimeQueue'])->name('realtime.queue');
});

Route::middleware('auth')->get('/dashboard', function () {
    /** @var User $user */
    $user = Auth::user();
    $user->loadMissing('role');
    $role = strtoupper((string) ($user->role?->nama_role ?? ''));

    return match ($role) {
        'SUPER_ADMIN' => redirect()->route('super.dashboard'),
        'ADMIN' => redirect()->route('admin.dashboard'),
        'DOKTER' => redirect()->route('dokter.dashboard'),
        default => abort(403, 'Akses Ditolak: Peran akun Anda belum terkonfigurasi.'),
    };
})->name('dashboard');

Route::middleware(['auth', 'role:SUPER_ADMIN'])->prefix('super')->name('super.')->group(function () {
    Route::get('/dashboard', [SuperDashboardController::class, 'index'])->name('dashboard');

    Route::get('/pengguna', [UserController::class, 'index'])->name('pengguna.index');
    Route::post('/pengguna', [UserController::class, 'store'])->name('pengguna.store');
    Route::put('/pengguna/{user}', [UserController::class, 'update'])->name('pengguna.update');
    Route::patch('/pengguna/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('pengguna.toggle-status');
    Route::delete('/pengguna/{user}', [UserController::class, 'destroy'])->name('pengguna.destroy');

    Route::get('/staf', [StaffController::class, 'index'])->name('staf.index');
    Route::post('/staf', [StaffController::class, 'store'])->name('staf.store');
    Route::post('/staf/jabatan', [StaffController::class, 'storePosition'])->name('staf.jabatan.store');
    Route::put('/staf/{staff}', [StaffController::class, 'update'])->name('staf.update');
    Route::delete('/staf/{staff}', [StaffController::class, 'destroy'])->name('staf.destroy');

    Route::get('/jenis-hewan', [AnimalTypeController::class, 'index'])->name('jenis-hewan.index');
    Route::post('/jenis-hewan', [AnimalTypeController::class, 'store'])->name('jenis-hewan.store');
    Route::put('/jenis-hewan/{animalType}', [AnimalTypeController::class, 'update'])->name('jenis-hewan.update');
    Route::delete('/jenis-hewan/{animalType}', [AnimalTypeController::class, 'destroy'])->name('jenis-hewan.destroy');

    Route::get('/obat', [MedicineController::class, 'index'])->name('obat.index');
    Route::post('/obat', [MedicineController::class, 'store'])->name('obat.store');
    Route::put('/obat/{medicine}', [MedicineController::class, 'update'])->name('obat.update');
    Route::delete('/obat/{medicine}', [MedicineController::class, 'destroy'])->name('obat.destroy');

    Route::get('/inventaris', [InventoryController::class, 'index'])->name('inventaris.index');
    Route::post('/inventaris', [InventoryController::class, 'store'])->name('inventaris.store');
    Route::put('/inventaris/{inventory}', [InventoryController::class, 'update'])->name('inventaris.update');
    Route::delete('/inventaris/{inventory}', [InventoryController::class, 'destroy'])->name('inventaris.destroy');

    Route::get('/artikel', [ArticleController::class, 'index'])->name('artikel.index');
    Route::post('/artikel', [ArticleController::class, 'store'])->name('artikel.store');
    Route::post('/artikel/kategori', [ArticleController::class, 'storeCategory'])->name('artikel.kategori.store');
    Route::put('/artikel/{article}', [ArticleController::class, 'update'])->name('artikel.update');
    Route::delete('/artikel/{article}', [ArticleController::class, 'destroy'])->name('artikel.destroy');

    Route::get('/monitoring/antrian-loket', [MonitoringController::class, 'antrianLoket'])->name('monitoring.antrian-loket');
    Route::get('/monitoring/pelayanan-dokter', [MonitoringController::class, 'pelayananDokter'])->name('monitoring.pelayanan-dokter');

    Route::get('/laporan', [ReportController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/rekam-medis', [ReportController::class, 'rekamMedis'])->name('laporan.rekam-medis');
    Route::get('/laporan/rabies', [ReportController::class, 'rabies'])->name('laporan.rabies');

    Route::get('/profil', [ProfileController::class, 'edit'])->name('profil');
});

Route::middleware(['auth', 'role:ADMIN'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('/rekam-medis', fn () => redirect()->route('admin.rekam-medis.create'));
    Route::get('/rekam-medis/create', [RegistrationController::class, 'create'])->name('rekam-medis.create');
    Route::post('/rekam-medis', [RegistrationController::class, 'store'])->name('rekam-medis.store');
    Route::get('/rekam-medis/search-owner', [RegistrationController::class, 'searchOwner'])->name('rekam-medis.search-owner');

    Route::get('/rekam-medis/antrian', [RegistrationController::class, 'index'])->name('rekam-medis.antrian');
    Route::patch('/rekam-medis/antrian/{visit}/status', [RegistrationController::class, 'updateStatus'])->name('rekam-medis.antrian.status');

    Route::get('/rekam-medis/hasil', [MedicalRecordResultController::class, 'index'])->name('rekam-medis.hasil');

    Route::get('/pendaftaran', fn () => redirect()->route('admin.rekam-medis.antrian'))->name('pendaftaran.index');
    Route::post('/pendaftaran', [RegistrationController::class, 'store'])->name('pendaftaran.store');
    Route::get('/pendaftaran/search-owner', [RegistrationController::class, 'searchOwner'])->name('pendaftaran.search-owner');
    Route::patch('/pendaftaran/{visit}/status', [RegistrationController::class, 'updateStatus'])->name('pendaftaran.update-status');

    Route::get('/pasien', [PatientController::class, 'index'])->name('pasien.index');
    Route::post('/pasien', [PatientController::class, 'store'])->name('pasien.store');
    Route::put('/pasien/{animal}', [PatientController::class, 'update'])->name('pasien.update');

    Route::get('/rabies/create', [AdminRabiesCaseController::class, 'create'])->name('rabies.create');
    Route::post('/rabies', [AdminRabiesCaseController::class, 'store'])->name('rabies.store');
    Route::get('/rabies/{rabiesCase}/edit', [AdminRabiesCaseController::class, 'edit'])->name('rabies.edit');
    Route::put('/rabies/{rabiesCase}', [AdminRabiesCaseController::class, 'update'])->name('rabies.update');
    Route::delete('/rabies/{rabiesCase}', [AdminRabiesCaseController::class, 'destroy'])->name('rabies.destroy');

    Route::get('/rabies', [AdminRabiesCaseController::class, 'index'])->name('rabies.index');

    Route::get('/profil', [ProfileController::class, 'edit'])->name('profil');
});

Route::middleware(['auth', 'role:DOKTER'])->prefix('dokter')->name('dokter.')->group(function () {
    Route::get('/dashboard', [DokterDashboardController::class, 'index'])->name('dashboard');

    Route::get('/antrian', [DokterQueueController::class, 'index'])->name('antrian.index');
    Route::post('/antrian/{visit}/start', [DokterQueueController::class, 'startExamination'])->name('antrian.start');
    Route::patch('/antrian/{visit}/status', [DokterQueueController::class, 'updateStatus'])->name('antrian.status');
    Route::delete('/antrian/{visit}', [DokterQueueController::class, 'destroy'])->name('antrian.destroy');

    Route::get('/pemeriksaan/{visit}', [DokterExaminationController::class, 'create'])->name('pemeriksaan.create');
    Route::post('/pemeriksaan/{visit}', [DokterExaminationController::class, 'store'])->name('pemeriksaan.store');

    Route::get('/riwayat', [DokterHistoryController::class, 'index'])->name('riwayat.index');

    Route::get('/profil', [ProfileController::class, 'edit'])->name('profil');
});

Route::fallback(function () {
    abort(404, 'Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.');
});
