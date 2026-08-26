import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { SITE_URL } from '../utils/site';

// Byte-identical to the description in /.well-known/agent-skills/index.json and in
// that skill's SKILL.md frontmatter. An agent matches tools on this string, so the
// three copies must not drift.
const SUBMIT_INQUIRY_DESCRIPTION = 'Send a contact inquiry to JCLL Labs — a technology and creative studio in Richmond, Virginia offering AI consulting, custom software development, marketing automation, photography, and video production. Delivers the message to the studio by email. No authentication required.';

// Same six services, in the same order, as public/home.md and the ai-catalog entry.
// Read from content.js rather than restated here: the homepage #services block now
// renders the same list, and two hand-kept copies would eventually disagree.
const SERVICES = content.en.services.items.map((service) => service.name);

const AEO = () => {
    const { language } = useStore();

    useEffect(() => {
        // WebMCP is experimental and Chrome-only. Its absence is the ordinary case,
        // not an error condition — leave silently rather than warning.
        if (typeof navigator === 'undefined' || !('modelContext' in navigator)) return;

        const getStudioInfo = {
            name: 'get_studio_info',
            description: 'Get factual information about JCLL Labs, a technology and creative studio in Richmond, Virginia: what it does, its services, its service area, and how to contact it. Read-only.',
            inputSchema: { type: 'object', properties: {}, required: [] },
            execute: async () => ({
                content: [{
                    type: 'text',
                    // Both locales ship every time: an agent answering a Spanish
                    // question needs Spanish source text even when the UI is in
                    // English. Reading both keys directly also removes any chance
                    // of an undefined from a locale gap.
                    text: JSON.stringify({
                        name: 'JCLL Labs',
                        url: SITE_URL,
                        activeLanguage: language,
                        location: { city: 'Richmond', region: 'VA', country: 'US' },
                        areaServed: ['Richmond', 'Midlothian', 'Glen Allen', 'Chesterfield'],
                        email: content.en.contact.email,
                        services: SERVICES,
                        summary: {
                            en: content.en.seo.description,
                            es: content.es.seo.description
                        },
                        about: {
                            en: content.en.about.description,
                            es: content.es.about.description
                        },
                        markdownSummaryUrl: `${SITE_URL}/home.md`,
                        // Restated in-band so an agent that never fetched
                        // /robots.txt still learns the citation-yes/training-no policy.
                        contentPolicy: 'ai-train=no, search=yes, ai-input=yes'
                    }, null, 2)
                }]
            })
        };

        const submitContactInquiry = {
            name: 'submit_contact_inquiry',
            description: SUBMIT_INQUIRY_DESCRIPTION,
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Name of the person or organization making contact.' },
                    email: { type: 'string', description: 'A reply address. Must be a valid email address.' },
                    subject: { type: 'string', description: 'Optional subject line.' },
                    message: { type: 'string', description: 'The inquiry itself.' }
                },
                required: ['name', 'email', 'message']
            },
            // Same fetch contract as the human form in src/pages/Contact.jsx. No
            // client-side validation is duplicated — the server's own 400 message is
            // more accurate, and one validator stays authoritative. Touches no UI:
            // the human may not even be looking at the contact section.
            execute: async (input) => {
                try {
                    const response = await fetch('/contact.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: input.name,
                            email: input.email,
                            // '' rather than undefined, so the key survives
                            // JSON.stringify and the payload matches the form's.
                            subject: input.subject || '',
                            message: input.message
                        }),
                    });

                    const result = await response.json();

                    if (response.ok && result.status === 'success') {
                        return {
                            content: [{ type: 'text', text: 'Inquiry sent to JCLL Labs. A reply will come from contact@jcll.me.' }]
                        };
                    }

                    throw new Error(result.message || 'Failed to send message.');
                } catch (error) {
                    // Never throw out of execute — an unhandled rejection here is a
                    // broken page for a visitor who did nothing.
                    return {
                        content: [{ type: 'text', text: `Could not send the inquiry: ${error.message}` }],
                        isError: true
                    };
                }
            }
        };

        // provideContext replaces the whole tool set, so re-running on a language
        // change cannot register duplicates.
        navigator.modelContext.provideContext({ tools: [getStudioInfo, submitContactInquiry] });
    }, [language]);

    return (
        <Helmet>
            {/* Discovery hints for agents that execute JS. These satisfy no audit
                item on their own — the HTTP Link: header in public/.htaccess is
                what a pre-JS fetch reads. Both ship; neither substitutes. */}
            <link rel="alternate" type="text/markdown" href="/home.md" />
            <link rel="describedby" type="application/json" href="/.well-known/ai-catalog.json" />
            <link rel="api-catalog" href="/.well-known/api-catalog" />
            <link rel="service-desc" type="application/json" href="/openapi.json" />
            <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        </Helmet>
    );
};

export default AEO;
