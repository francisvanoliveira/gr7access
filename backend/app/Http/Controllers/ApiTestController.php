<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiTestController extends Controller
{
    public function ping()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'A API do Laravel está rodando perfeitamente!',
            'timestamp' => now()
        ]);
    }
}
