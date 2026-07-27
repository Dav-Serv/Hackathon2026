<?php

namespace App\Mail;

use App\Models\TokenApproval;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApprovalRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public TokenApproval $approval, public string $token) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Permintaan persetujuan konversi');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.approval-request', with: ['approval' => $this->approval, 'token' => $this->token]);
    }
}
