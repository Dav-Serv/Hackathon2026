// List of available courses and their CPMK (Obtained from SikurOBE)
export const MASTER_MATA_KULIAH = [
  {
    id: 'mk-01',
    kode: 'IF123',
    nama: 'Proyek Aplikasi Web',
    sks: 4,
    cpmk: [
      { id: 'cpmk-101', kode: 'CPMK-1', deskripsi: 'Mampu merancang arsitektur database relasional yang optimal untuk web.' },
      { id: 'cpmk-102', kode: 'CPMK-2', deskripsi: 'Mampu mengimplementasikan RESTful API dengan backend framework (Laravel/Express).' },
      { id: 'cpmk-103', kode: 'CPMK-3', deskripsi: 'Mampu membangun antarmuka web interaktif, responsif, dan hemat state dengan React.' }
    ]
  },
  {
    id: 'mk-02',
    kode: 'IF124',
    nama: 'Pemrograman Mobile',
    sks: 4,
    cpmk: [
      { id: 'cpmk-201', kode: 'CPMK-1', deskripsi: 'Mampu membuat tata letak antarmuka aplikasi mobile multi-platform menggunakan React Native/Flutter.' },
      { id: 'cpmk-202', kode: 'CPMK-2', deskripsi: 'Mampu mengelola siklus hidup komponen, state lokal, dan persistence data di mobile.' }
    ]
  },
  {
    id: 'mk-03',
    kode: 'IF125',
    nama: 'Perancangan Antarmuka Pengguna (UI/UX)',
    sks: 3,
    cpmk: [
      { id: 'cpmk-301', kode: 'CPMK-1', deskripsi: 'Mampu merancang wireframe, user flow, dan mockup high-fidelity interaktif sesuai prinsip UX.' },
      { id: 'cpmk-302', kode: 'CPMK-2', deskripsi: 'Mampu merancang dan melakukan evaluasi usability testing terhadap purwarupa produk digital.' }
    ]
  },
  {
    id: 'mk-04',
    kode: 'IF126',
    nama: 'Manajemen Proyek TI',
    sks: 3,
    cpmk: [
      { id: 'cpmk-401', kode: 'CPMK-1', deskripsi: 'Mampu memformulasikan backlog, user stories, dan estimasi beban kerja proyek menggunakan metodologi Agile.' },
      { id: 'cpmk-402', kode: 'CPMK-2', deskripsi: 'Mampu mengoperasikan tools kolaborasi (Git/Jira) untuk manajemen pengembangan software.' }
    ]
  }
];

export const MOCK_DPL_LIST = [
  { id: 'dpl-01', nama: 'Dr. Kusrini, M.Kom.', email: 'kusrini@amikom.ac.id' },
  { id: 'dpl-02', nama: 'Andi Sunyoto, M.Kom.', email: 'andi.s@amikom.ac.id' },
  { id: 'dpl-03', nama: 'Ferry Wahyu Wibowo, S.Si., M.T.', email: 'ferry@amikom.ac.id' }
];

export const INITIAL_STATE = {
  // Data Magang Mahasiswa
  magang: {
    mitraNama: 'PT Solusi Teknologi Nusantara',
    mitraAlamat: 'Gedung Digital Creative, Jakarta',
    mitraBidang: 'Software Development',
    posisi: 'Fullstack Web Developer',
    periodeMulai: '2026-02-01',
    periodeSelesai: '2026-07-31',
    dplId: 'dpl-01',
    supervisorNama: 'Budi Raharjo, S.T.',
    supervisorEmail: 'budi.raharjo@solusitech.co.id',
    supervisorHp: '081234567890',
    proposalFile: 'proposal_magang_12345.pdf',
    buktiDiterimaFile: 'bukti_penerimaan_12345.pdf',
    status: 'draft', // draft | menunggu_verifikasi | disetujui | ditolak
    catatanAdmin: '',
  },

  // Usulan Konversi
  usulan: {
    status: 'belum_diajukan', // belum_diajukan | menunggu_persetujuan_dpl | disetujui | revisi | ditolak
    catatanDpl: '',
    details: [
      /* format: { mkId, cpmkId, deskripsiRencana } */
    ],
  },

  // Klaim Konversi
  klaim: {
    status: 'belum_diajukan', // belum_diajukan | menunggu_penilaian_mitra | menunggu_review_dpl | revisi | disetujui | ditolak
    logbookFile: '',
    laporanFile: '',
    sertifikatFile: '',
    details: [
      /* format: { usulanDetailIndex, buktiAktivitasText, buktiFile } */
    ],
  },

  // Penilaian
  penilaian: {
    mitra: {
      nilai: null,
      komentar: '',
      submittedAt: null,
    },
    dpl: {
      nilaiAkademik: null,
      keputusan: '', // setuju | revisi | tolak
      komentar: '',
      submittedAt: null,
    }
  }
};
