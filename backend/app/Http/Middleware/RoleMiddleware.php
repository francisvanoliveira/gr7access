<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Se passar "role:2,3", o Laravel pode passar como argumentos separados ou um único array
        // Flatten os papéis caso venham separados por vírgula dentro de um argumento
        $allowedRoles = [];
        foreach ($roles as $roleGroup) {
            $allowedRoles = array_merge($allowedRoles, explode(',', (string)$roleGroup));
        }

        if (!in_array((string)$user->level, $allowedRoles)) {
            return response()->json(['message' => 'Forbidden. Access level too low.'], 403);
        }

        return $next($request);
    }
}
