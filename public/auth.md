# auth.md

Authentication and agent-access policy for **JCLL Labs** — https://jcll.me

## Summary

**No authentication is required, and no agent registration exists.** This site
publishes no protected resources. Every document and endpoint listed below is
public and callable without credentials of any kind.

## Agent audience

Any AI agent, answer engine, or automated client acting on behalf of a user or a
business. No allow-list, no account, no API key, no prior arrangement.

## Registration / provisioning

None. There is no registration endpoint, no client-registration flow, and no
provisioning process — because there is nothing to gain access to. An agent that
would normally register first should simply proceed.

## Supported authentication methods

None, by design. Specifically, this site does **not** operate:

- an OAuth 2.0 authorization server (no `/.well-known/oauth-authorization-server`)
- an OpenID Connect issuer (no `/.well-known/openid-configuration`)
- OAuth Protected Resource Metadata (no `/.well-known/oauth-protected-resource`)
- an MCP server or MCP server card (no `/.well-known/mcp/server-card.json`)

Those documents are **absent on purpose**, not missing by oversight. Publishing
discovery metadata for an identity provider that does not exist would point agents
at endpoints that cannot answer.

## Credential usage

Not applicable. Send no `Authorization` header. Any credential presented is ignored.

## What an agent can actually do here

| Capability | URL | Method | Auth |
|---|---|---|---|
| Read the site | https://jcll.me/ | GET | none |
| Read the agent-oriented summary | https://jcll.me/home.md | GET | none |
| Submit a contact inquiry | https://jcll.me/contact.php | POST | none |

`POST /contact.php` accepts `application/json` with `name`, `email`, `subject`,
`message` and returns `{"status": "success"\|"error", "message": "..."}`. It sends
an email to the studio; it has no other side effect and stores nothing.
`Access-Control-Allow-Origin: *` is set, so it is callable cross-origin.
Machine-readable description: https://jcll.me/openapi.json

## Contact

A human reads contact@jcll.me.
