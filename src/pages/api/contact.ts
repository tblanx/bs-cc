import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  const name    = data.get('name')?.toString().trim() ?? '';
  const email   = data.get('email')?.toString().trim() ?? '';
  const path    = data.get('path')?.toString().trim() ?? '';
  const message = data.get('message')?.toString().trim() ?? '';

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const pathLabel: Record<string, string> = {
    'for-good':     'For Good — philanthropic & nonprofit',
    'for-business': 'For Business — strategy & consulting',
    'other':        'Other',
  };

  const { error } = await resend.emails.send({
    from:    'blankspace <tony@goblankspace.com>',
    to:      ['clare@goblankspace.com', 'tony@goblankspace.com'],
    replyTo: email,
    subject: `New contact from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Regarding:</strong> ${pathLabel[path] ?? path}</p>
      <hr />
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
