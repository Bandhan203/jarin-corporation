<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->load('nidVerification');
        $token = $user->createToken('estate-archive-api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('nidVerification');

        return response()->json(['user' => $this->formatUser($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    private function formatUser(User $user): array
    {
        $nid = $user->nidVerification;

        return [
            'id'             => (string) $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'phone'          => $user->phone ?? '',
            'role'           => $user->role,
            'avatarInitials' => $user->avatar_initials,
            'isNidVerified'  => $user->is_verified
                || ($nid && $nid->status === 'approved'),
        ];
    }
}
