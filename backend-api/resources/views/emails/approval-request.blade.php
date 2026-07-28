<!doctype html>
<html><body><p>Permintaan penilaian mahasiswa tersedia.</p><p>Silakan buka tautan berikut untuk memberikan nilai:</p><p><a href="{{ rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') }}/approval/{{ $token }}">Buka formulir penilaian</a></p><p>Tautan berlaku selama 7 hari dan hanya dapat digunakan satu kali.</p></body></html>
