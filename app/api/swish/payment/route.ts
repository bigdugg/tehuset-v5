import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import site from '../../../../content/site.json';
import productsData from '../../../../content/products.json';

type OrderPayload = {
  productId: string;
  size?: string;
  quantity: number;
  customerName?: string;
  customerEmail?: string;
  note?: string;
  lang?: 'sv' | 'en';
};

const SWISH_QR_ENDPOINT = 'https://mpc.getswish.net/qrg-swish/api/v1/prefilled';

function t(lang: 'sv' | 'en' | undefined, sv: string, en: string) {
  return lang === 'en' ? en : sv;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function buildTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// Generate a scannable Swish QR for a fixed payment to a (personal) Swish number.
// Uses Swish's public QR endpoint — no merchant certificate required.
async function generateSwishQr(payee: string, amount: number, message: string): Promise<string | null> {
  try {
    const response = await fetch(SWISH_QR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'png',
        payee: { value: payee, editable: false },
        amount: { value: amount, editable: false },
        message: { value: message, editable: false },
        size: 320,
        border: 0,
        transparent: true,
      }),
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OrderPayload;
  const lang = body.lang === 'en' ? 'en' : 'sv';

  const product = productsData.products.find((item) => item.id === body.productId && item.active);
  if (!product) {
    return NextResponse.json({ message: t(lang, 'Produkten hittades inte.', 'Product not found.') }, { status: 404 });
  }

  const quantity = Math.max(1, Math.min(10, Number(body.quantity || 1)));
  const sizes = (product as { sizes?: string[] }).sizes ?? [];
  const size = body.size?.trim() ?? '';
  if (sizes.length > 0 && !sizes.includes(size)) {
    return NextResponse.json({ message: t(lang, 'Välj en storlek.', 'Please choose a size.') }, { status: 400 });
  }

  const customerName = body.customerName?.trim() ?? '';
  const customerEmail = body.customerEmail?.trim() ?? '';
  if (!customerName) {
    return NextResponse.json({ message: t(lang, 'Ange ditt namn.', 'Please enter your name.') }, { status: 400 });
  }
  if (!isEmail(customerEmail)) {
    return NextResponse.json({ message: t(lang, 'Ange en giltig e-postadress.', 'Please enter a valid email address.') }, { status: 400 });
  }

  const swishNumber = process.env.SWISH_NUMBER?.trim();
  if (!swishNumber) {
    return NextResponse.json(
      { message: t(lang, 'Betalningen är inte konfigurerad ännu.', 'Payments are not configured yet.') },
      { status: 503 },
    );
  }

  const amount = product.priceSek * quantity;
  const reference = `TEHUSET-${Date.now().toString(36).toUpperCase()}`;
  const sizeLabel = size ? ` (${size})` : '';
  const summary = `${quantity}× ${product.name[lang]}${sizeLabel} — ${amount} SEK`;

  const qrDataUrl = await generateSwishQr(swishNumber, amount, reference);

  const transporter = await buildTransport();
  const from = process.env.ORDER_EMAIL_FROM ?? process.env.SMTP_USER ?? site.adminEmail;
  let emailed = false;

  if (transporter) {
    const payLines = t(
      lang,
      `Swisha ${amount} SEK till ${swishNumber} med meddelandet "${reference}".`,
      `Swish ${amount} SEK to ${swishNumber} with the message "${reference}".`,
    );

    const customerBody = t(
      lang,
      `Hej ${customerName},\n\nTack för din beställning hos Tehuset!\n\nBeställning: ${summary}\nReferens: ${reference}\n\nBetalning:\n${payLines}\n\nVi bekräftar och skickar din t-shirt så snart betalningen kommit in.${body.note ? `\n\nDin not: ${body.note}` : ''}\n\nVärme,\nTehuset`,
      `Hi ${customerName},\n\nThank you for your purchase from Tehuset!\n\nOrder: ${summary}\nReference: ${reference}\n\nPayment:\n${payLines}\n\nWe'll confirm and send your t-shirt as soon as the payment lands.${body.note ? `\n\nYour note: ${body.note}` : ''}\n\nWarmly,\nTehuset`,
    );

    const adminBody = `New merch order ${reference}\n\nProduct: ${product.name.en} (${product.sku})\nSize: ${size || 'n/a'}\nQuantity: ${quantity}\nAmount: ${amount} SEK\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nNote: ${body.note || 'none'}\n\nExpect a Swish payment of ${amount} SEK to ${swishNumber} with message "${reference}".`;

    try {
      await Promise.all([
        transporter.sendMail({
          from,
          to: customerEmail,
          subject: t(lang, `Tehuset – Tack för din beställning (${reference})`, `Tehuset – Thank you for your order (${reference})`),
          text: customerBody,
        }),
        transporter.sendMail({
          from,
          to: site.adminEmail,
          subject: `Tehuset merch order ${reference}`,
          text: adminBody,
        }),
      ]);
      emailed = true;
    } catch {
      emailed = false;
    }
  }

  return NextResponse.json({
    reference,
    amount,
    swishNumber,
    message: reference,
    summary,
    qrDataUrl,
    emailed,
    confirmation: emailed
      ? t(lang, 'Tack! En bekräftelse är på väg till din e-post.', 'Thank you! A confirmation is on its way to your email.')
      : t(lang, 'Tack! Slutför betalningen i Swish nedan.', 'Thank you! Complete the payment in Swish below.'),
  });
}
