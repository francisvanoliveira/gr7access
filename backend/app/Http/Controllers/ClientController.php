<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $clients = Client::all()->map(function ($client) use ($request) {
            return $this->attachAccessFlag($client, $request->user());
        });
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $client = Client::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json($client, 201);
    }
    
    public function show(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        $client = $this->attachAccessFlag($client, $request->user());
        return response()->json($client);
    }

    private function attachAccessFlag($client, $user)
    {
        if ($user->level >= 2) {
            $client->has_access = true;
            return $client;
        }

        $hasAccess = \App\Models\AccessRequest::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('expires_at', '>', now())
            ->where('client_id', $client->id)
            ->exists();

        $client->has_access = $hasAccess;
        return $client;
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $client->name = $request->name;
        $client->description = $request->description;
        $client->save();

        return response()->json($client);
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        $client->delete();
        return response()->json(['message' => 'Client deleted']);
    }
}
