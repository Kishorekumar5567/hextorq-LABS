import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/repository';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('x-user-id') || 'user-client-03';
    const user = db.profiles.find(p => p.id === authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoice_id, provider = 'stripe' } = await req.json();
    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    const invoice = db.invoices.find(i => i.id === invoice_id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Verify user is authorized for this invoice
    if (user.role === 'client') {
      const client = db.getClientForUser(user.id);
      if (!client || invoice.client_id !== client.id) {
        return NextResponse.json({ error: 'Forbidden: You do not have access to pay this invoice' }, { status: 403 });
      }
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    // Server-side payment order generation
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clientSecret = `pi_secret_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      order: {
        orderId,
        clientSecret,
        provider,
        amount: invoice.total_amount,
        currency: invoice.currency,
        invoice_number: invoice.invoice_number,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
