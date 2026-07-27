<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupervisorMitra extends Model
{
    protected $fillable = ['mitra_industri_id', 'nama', 'email', 'no_hp'];

    public function mitraIndustri(): BelongsTo
    {
        return $this->belongsTo(MitraIndustri::class);
    }

    public function magangs(): HasMany
    {
        return $this->hasMany(Magang::class);
    }
}
