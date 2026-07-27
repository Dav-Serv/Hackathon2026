<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $email = strtolower((string) $value);
                    $allowed = str_ends_with($email, '@amikom.ac.id')
                        || str_ends_with($email, '@students.amikom.ac.id');

                    if (! $allowed) {
                        $fail('Email harus menggunakan domain @amikom.ac.id atau @students.amikom.ac.id.');
                    }
                },
            ],
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

    public function handleGoogleCallback(): RedirectResponse
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $googleUser = Socialite::driver('google')->stateless()->user();
        $email = strtolower((string) $googleUser->getEmail());
        $isVerified = (bool) ($googleUser->user['email_verified'] ?? false);
        $isAmikomEmail = str_ends_with($email, '@amikom.ac.id') || str_ends_with($email, '@students.amikom.ac.id');

        if (! $isVerified || ! $isAmikomEmail) {
            return redirect()->to($frontendUrl.'/auth/callback?error='.rawurlencode('Hanya akun Google @amikom.ac.id yang dapat login.'));
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

        $token = $user->createToken('google-oauth')->plainTextToken;

        return redirect()->to($frontendUrl.'/auth/callback#token='.rawurlencode($token));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'no_hp' => ['sometimes', 'required', 'string', 'max:255'],
            'alamat' => ['sometimes', 'required', 'string'],
            'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'current_password' => ['required_with:password', 'nullable', 'string'],
            'password' => ['sometimes', 'required', 'confirmed', Password::defaults()],
        ]);

        if (array_key_exists('password', $data)) {
            if (! $user->password || ! Hash::check($data['current_password'], $user->password)) {
                return response()->json(['message' => 'Password lama salah.'], 422);
            }

            $data['password'] = Hash::make($data['password']);
        }

        unset($data['current_password']);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $oldPath = parse_url($user->avatar, PHP_URL_PATH);
                $bucketPrefix = '/storage/v1/object/public/'.config('filesystems.disks.supabase.bucket').'/';
                $oldPath = is_string($oldPath) ? str_replace($bucketPrefix, '', $oldPath) : $user->avatar;
                Storage::disk('supabase')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('user-avatars', 'supabase');
            $data['avatar'] = Storage::disk('supabase')->url($path);
        }

        $user->update($data);

        return response()->json(['message' => 'Profil berhasil diperbarui.', 'user' => $user->fresh()]);
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
