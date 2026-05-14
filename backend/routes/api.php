<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiTestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\HostController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Users: Only Level 3
    Route::middleware('role:3')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::patch('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);
    });

    // Clients & Hosts endpoints
    // Everyone can access the list and show, BUT the controller logic masks the data for Level 1
    Route::get('/clients', [ClientController::class, 'index']);
    Route::get('/clients/{id}', [ClientController::class, 'show']);
    Route::get('/hosts', [HostController::class, 'index']);
    Route::get('/hosts/{id}', [HostController::class, 'show']);

    // Level 2 & 3 can manage Clients and Hosts
    Route::middleware('role:2,3')->group(function () {
        Route::post('/clients', [ClientController::class, 'store']);
        Route::put('/clients/{id}', [ClientController::class, 'update']);
        Route::post('/hosts', [HostController::class, 'store']);
        Route::put('/hosts/{id}', [HostController::class, 'update']);
        Route::post('/hosts/{id}/notes', [HostController::class, 'addNote']);
        Route::put('/hosts/{id}/notes/{noteId}', [HostController::class, 'updateNote']);
        Route::delete('/hosts/{id}/notes/{noteId}', [HostController::class, 'deleteNote']);
        
        // Access Requests (Approve/Reject)
        Route::post('/access-requests/{id}/approve', [\App\Http\Controllers\AccessRequestController::class, 'approve']);
        Route::post('/access-requests/{id}/reject', [\App\Http\Controllers\AccessRequestController::class, 'reject']);
    });

    // Level 3 only can DELETE Clients and Hosts
    Route::middleware('role:3')->group(function () {
        Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
        Route::delete('/hosts/{id}', [HostController::class, 'destroy']);
    });

    // Level 1 can request access
    Route::middleware('role:1,2,3')->group(function () {
        Route::get('/access-requests', [\App\Http\Controllers\AccessRequestController::class, 'index']);
        Route::post('/access-requests', [\App\Http\Controllers\AccessRequestController::class, 'store']);
    });
});

Route::get('/ping', [ApiTestController::class, 'ping']);

Route::get('/debug-requests', function () {
    return response()->json([
        'requests' => \App\Models\AccessRequest::all(),
        'users' => \App\Models\User::all(['id', 'email', 'level', 'name'])
    ]);
});
