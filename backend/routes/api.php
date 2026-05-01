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

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::patch('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);

    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::get('/clients/{id}', [ClientController::class, 'show']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

    Route::get('/hosts', [HostController::class, 'index']);
    Route::post('/hosts', [HostController::class, 'store']);
    Route::get('/hosts/{id}', [HostController::class, 'show']);
    Route::put('/hosts/{id}', [HostController::class, 'update']);
    Route::delete('/hosts/{id}', [HostController::class, 'destroy']);
    
    Route::post('/hosts/{id}/notes', [HostController::class, 'addNote']);
    Route::put('/hosts/{id}/notes/{noteId}', [HostController::class, 'updateNote']);
    Route::delete('/hosts/{id}/notes/{noteId}', [HostController::class, 'deleteNote']);
});

Route::get('/ping', [ApiTestController::class, 'ping']);
