<?php

namespace App\Enums;

enum UserRole: string
{
    case AdminProdi = 'admin_prodi';
    case Kaprodi = 'kaprodi';
    case Dpl = 'dpl';
    case Mahasiswa = 'mahasiswa';
}
