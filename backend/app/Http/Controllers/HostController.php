<?php

namespace App\Http\Controllers;

use App\Models\Host;
use App\Models\Client;
use Illuminate\Http\Request;

class HostController extends Controller
{
    public function index(Request $request)
    {
        $query = Host::query();
        
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'ip' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string',
        ]);

        $notesList = [];
        if (!empty($request->notes)) {
            $notesList[] = [
                'id' => 'n-' . time(),
                'title' => $request->noteTitle,
                'text' => $request->notes,
                'createdAt' => round(microtime(true) * 1000),
            ];
        }

        $host = Host::create([
            'client_id' => $request->client_id,
            'name' => $request->name,
            'type' => $request->type,
            'ip' => $request->ip,
            'username' => $request->username,
            'password' => $request->password,
            'notes_list' => $notesList,
        ]);

        $client = Client::find($request->client_id);
        $client->increment('hosts_count');

        return response()->json($host, 201);
    }
    
    public function show($id)
    {
        $host = Host::with('client')->findOrFail($id);
        return response()->json($host);
    }

    public function update(Request $request, $id)
    {
        $host = Host::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'ip' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string',
        ]);

        $host->name = $request->name;
        $host->type = $request->type;
        $host->ip = $request->ip;
        $host->username = $request->username;
        if ($request->has('password')) {
            $host->password = $request->password;
        }
        $host->save();

        return response()->json($host);
    }

    public function destroy($id)
    {
        $host = Host::findOrFail($id);
        $clientId = $host->client_id;
        $host->delete();

        $client = Client::find($clientId);
        if ($client && $client->hosts_count > 0) {
            $client->decrement('hosts_count');
        }

        return response()->json(['message' => 'Host deleted']);
    }

    public function addNote(Request $request, $id)
    {
        $host = Host::findOrFail($id);
        $request->validate([
            'text' => 'required|string',
            'title' => 'nullable|string',
            'attachmentName' => 'nullable|string',
            'attachmentDataUrl' => 'nullable|string',
            'authorName' => 'nullable|string',
        ]);

        $notes = $host->notes_list ?? [];
        $newNote = [
            'id' => 'n-' . time() . rand(10, 99),
            'title' => $request->title,
            'text' => $request->text,
            'attachmentName' => $request->attachmentName,
            'attachmentDataUrl' => $request->attachmentDataUrl,
            'authorName' => $request->authorName,
            'createdAt' => round(microtime(true) * 1000),
        ];
        $notes[] = $newNote;
        $host->notes_list = $notes;
        $host->save();

        return response()->json($host);
    }

    public function updateNote(Request $request, $id, $noteId)
    {
        $host = Host::findOrFail($id);
        $request->validate([
            'text' => 'required|string',
            'title' => 'nullable|string',
            'attachmentName' => 'nullable|string',
            'attachmentDataUrl' => 'nullable|string',
        ]);

        $notes = $host->notes_list ?? [];
        foreach ($notes as &$note) {
            if ($note['id'] === $noteId) {
                $note['title'] = $request->title;
                $note['text'] = $request->text;
                if ($request->has('attachmentName')) $note['attachmentName'] = $request->attachmentName;
                if ($request->has('attachmentDataUrl')) $note['attachmentDataUrl'] = $request->attachmentDataUrl;
                break;
            }
        }
        $host->notes_list = $notes;
        $host->save();

        return response()->json($host);
    }

    public function deleteNote($id, $noteId)
    {
        $host = Host::findOrFail($id);
        $notes = $host->notes_list ?? [];
        
        $notes = array_values(array_filter($notes, function($note) use ($noteId) {
            return $note['id'] !== $noteId;
        }));

        $host->notes_list = $notes;
        $host->save();

        return response()->json($host);
    }
}
