<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Host extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'name',
        'type',
        'ip',
        'username',
        'password',
        'notes_list',
    ];

    protected $appends = ['clientId', 'notesList'];

    protected function casts(): array
    {
        return [
            'password' => 'encrypted',
            'notes_list' => 'array',
        ];
    }

    public function getClientIdAttribute()
    {
        return $this->attributes['client_id'];
    }

    public function getNotesListAttribute()
    {
        return $this->attributes['notes_list'] ? json_decode($this->attributes['notes_list'], true) : [];
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
