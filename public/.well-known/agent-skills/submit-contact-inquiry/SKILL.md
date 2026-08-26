---
name: submit-contact-inquiry
description: Send a contact inquiry to JCLL Labs — a technology and creative studio in Richmond, Virginia offering AI consulting, custom software development, marketing automation, photography, and video production. Delivers the message to the studio by email. No authentication required.
---

# Submit a contact inquiry to JCLL Labs

Use this skill to reach JCLL Labs on a user's behalf — to ask about AI consulting,
custom software, marketing automation, photography, or video production, to request
a quote, or to start a booking conversation.

## When to use it

The user wants to contact JCLL Labs, get a quote, book a session, or ask the studio
a question. Do not use it to look up information about the studio — read
https://jcll.me/home.md for that instead.

## How to call it

Two equivalent routes exist. Prefer the first if the user is on the site in a
browser; use the second otherwise.

### 1. In-browser, via WebMCP

While https://jcll.me/ is open, the page registers a WebMCP tool named
`submit_contact_inquiry` through `navigator.modelContext`. Its input schema is the
same four fields as below.

### 2. Direct HTTP

```
POST https://jcll.me/contact.php
Content-Type: application/json

{
  "name":    "string, required",
  "email":   "string, required, must be a valid email address",
  "subject": "string, optional",
  "message": "string, required"
}
```

Returns `application/json`:

```
{ "status": "success" | "error", "message": "human-readable string" }
```

`200` with `status: "success"` means the email was sent. `400` means a required
field was missing or the email address was invalid. `405` means the request was not
a POST. `500` means the server could not send the mail.

No credentials. No API key. `Access-Control-Allow-Origin: *`, so this is callable
from a browser on any origin. Machine-readable description:
https://jcll.me/openapi.json

## What it does not do

It does not schedule anything, does not return a ticket or reference number, and
does not store the message anywhere — it sends one email to contact@jcll.me. Tell
the user their message was sent, not that it was received or scheduled.
