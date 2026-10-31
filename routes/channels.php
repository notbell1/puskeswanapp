<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.group', function ($user) {
    return $user !== null;
});

Broadcast::channel('chat.user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
