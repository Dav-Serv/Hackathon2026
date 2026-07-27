<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nim_nip' => ['required', 'string', 'max:255', 'unique:users,nim_nip'],
            'no_hp' => ['required', 'string', 'max:255'],
            'alamat' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! $user->password || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 422);
        }

        return $this->tokenResponse($user);
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback(): JsonResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();
        $email = strtolower((string) $googleUser->getEmail());

        $isVerified = (bool) ($googleUser->user['email_verified'] ?? false);

        if (! $isVerified || ! str_ends_with($email, '@amikom.ac.id')) {
            return response()->json(['message' => 'Hanya akun Google @amikom.ac.id yang dapat login.'], 403);
        } else if (! $isVerified || ! str_ends_with($email, '@students.amikom.ac.id')) {
            return response()->json(['message' => 'Hanya akun Google @students.amikom.ac.id yang dapat login.'], 403);
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Pengguna Google',
                'nim_nip' => 'GOOGLE-'.$googleUser->getId(),
                'no_hp' => '-',
                'alamat' => '-',
                'email' => $googleUser->getEmail(),
                'email_verified_at' => now(),
                'role' => 'mahasiswa',
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
            ]);
        } else {
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        }

        return $this->tokenResponse($user);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Berhasil logout.']);
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $user->createToken('api')->plainTextToken,
            'user' => $user,
        ], $status);
    }
}
