<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'hosts_count',
    ];
    
    protected $appends = ['hostsCount'];

    public function getHostsCountAttribute()
    {
        return $this->attributes['hosts_count'] ?? 0;
    }
}
