<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MitraIndustri extends Model
{
    protected $fillable = ['nama_perusahaan', 'alamat', 'bidang'];

    public function supervisors(): HasMany
    {
        return $this->hasMany(SupervisorMitra::class);
    }

    public function magangs(): HasMany
    {
        return $this->hasMany(Magang::class);
    }
}
