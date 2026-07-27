<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'nim_nip',
        'no_hp',
        'alamat',
        'email',
        'email_verified_at',
        'role',
        'google_id',
        'avatar',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function magangsAsMahasiswa(): HasMany
    {
        return $this->hasMany(Magang::class, 'mahasiswa_id');
    }

    public function magangsAsDpl(): HasMany
    {
        return $this->hasMany(Magang::class, 'dpl_id');
    }

    public function reviewedUsulanKonversis(): HasMany
    {
        return $this->hasMany(UsulanKonversi::class, 'reviewed_by');
    }
}
