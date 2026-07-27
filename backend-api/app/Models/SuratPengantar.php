<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratPengantar extends Model
{
    protected $fillable = ['magang_id', 'file_path', 'status', 'catatan'];

    public function magang(): BelongsTo
    {
        return $this->belongsTo(Magang::class);
    }
}
