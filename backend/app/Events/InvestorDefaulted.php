<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InvestorDefaulted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly int $overdueStreak
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('admin.risk-flags');
    }

    public function broadcastAs(): string
    {
        return 'investor.defaulted';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id'       => $this->user->id,
            'user_name'     => $this->user->name,
            'overdue_streak'=> $this->overdueStreak,
            'defaulted_at'  => now()->toIso8601String(),
        ];
    }
}
