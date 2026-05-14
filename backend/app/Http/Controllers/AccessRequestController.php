<?php

namespace App\Http\Controllers;

use App\Models\AccessRequest;
use Illuminate\Http\Request;

class AccessRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = AccessRequest::with(['user', 'client', 'host', 'approver'])
            ->orderBy('created_at', 'desc');
            
        if ($request->user()->level == 1) {
            $query->where('user_id', $request->user()->id);
        }
            
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'host_id' => 'nullable|exists:hosts,id',
            'reason' => 'nullable|string'
        ]);

        if (!$request->client_id && !$request->host_id) {
            return response()->json(['message' => 'Client ID or Host ID is required'], 422);
        }

        // Check if there is already a pending or valid request
        $existing = AccessRequest::where('user_id', $request->user()->id)
            ->where(function ($q) {
                $q->where('status', 'pending')
                  ->orWhere(function ($q2) {
                      $q2->where('status', 'approved')->where('expires_at', '>', now());
                  });
            })
            ->where('client_id', $request->client_id)
            ->where('host_id', $request->host_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Você já possui uma solicitação pendente ou acesso ativo para este recurso.'], 422);
        }

        $accessRequest = AccessRequest::create([
            'user_id' => $request->user()->id,
            'client_id' => $request->client_id,
            'host_id' => $request->host_id,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);

        return response()->json($accessRequest, 201);
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'duration_minutes' => 'required|integer|in:30,60,240'
        ]);

        $accessRequest = AccessRequest::findOrFail($id);
        $accessRequest->status = 'approved';
        $accessRequest->approved_by = $request->user()->id;
        $accessRequest->expires_at = now()->addMinutes($request->duration_minutes);
        $accessRequest->save();

        return response()->json($accessRequest);
    }

    public function reject(Request $request, $id)
    {
        $accessRequest = AccessRequest::findOrFail($id);
        $accessRequest->status = 'rejected';
        $accessRequest->approved_by = $request->user()->id;
        $accessRequest->save();

        return response()->json($accessRequest);
    }
}
