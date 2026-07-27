<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dokumen extends Model
{
    protected $fillable = ['referensi_tabel', 'referensi_id', 'jenis_dokumen', 'path_file'];

    protected function casts(): array
    {
        return ['referensi_id' => 'integer'];
    }
}
