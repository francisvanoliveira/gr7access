<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'client_id',
        'host_id',
        'status',
        'approved_by',
        'expires_at',
        'reason',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function host()
    {
        return $this->belongsTo(Host::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isValid()
    {
        return $this->status === 'approved' && $this->expires_at && $this->expires_at->isFuture();
    }
}
