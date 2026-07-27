<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UsulanKonversi extends Model
{
    protected $fillable = ['magang_id', 'status', 'catatan_dpl', 'reviewed_by', 'reviewed_at'];

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }

    public function magang(): BelongsTo
    {
        return $this->belongsTo(Magang::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function details(): HasMany
    {
        return $this->hasMany(UsulanKonversiDetail::class);
    }

    public function klaimKonversis(): HasMany
    {
        return $this->hasMany(KlaimKonversi::class);
    }
}
