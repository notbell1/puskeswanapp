<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  array<string, mixed>  $payload
     */
    public function __construct(public array $payload) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        if (empty($this->payload['receiver_id'])) {
            return [
                new PrivateChannel('chat.group'),
            ];
        }

        return [
            new PrivateChannel('chat.user.'.$this->payload['receiver_id']),
            new PrivateChannel('chat.user.'.$this->payload['sender_id']),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.deleted';
    }
}
