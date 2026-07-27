<?php

namespace App\Jobs;

use App\Mail\ApprovalRequestMail;
use App\Models\TokenApproval;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendApprovalRequestEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public int $backoff = 60;

    public function __construct(public TokenApproval $approval, public string $token) {}

    public function handle(): void
    {
        if ($this->approval->recipient_email) {
            Mail::to(new Address($this->approval->recipient_email))->send(new ApprovalRequestMail($this->approval, $this->token));
        }
    }
}
