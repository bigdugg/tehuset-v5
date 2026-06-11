 'use client';
import { useState } from 'react';
import type { Lang, Product } from './types';

type OrderResult = {
  reference: string;
  amount: number;
  swishNumber: string;
  message: string;
  summary: string;
  qrDataUrl: string | null;
  emailed: boolean;
  confirmation: string;
};

export function MerchCheckout({ lang, products }: { lang: Lang; products: Product[] }) {
  const product = products.find((item) => item.active) ?? products[0];
  const sizes = product?.sizes ?? [];
  const [size, setSize] = useState(sizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const tr = (sv: string, en: string) => (lang === 'sv' ? sv : en);

  async function submit() {
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/swish/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product!.id, size, quantity, customerName: name, customerEmail: email, note, lang }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus('error');
        setMessage(data.message ?? tr('Något gick fel.', 'Something went wrong.'));
        return;
      }
      setOrder(data as OrderResult);
      setStatus('success');
    } catch {
      setStatus('error');
      setMessage(tr('Kunde inte nå servern.', 'Could not reach the server.'));
    }
  }

  async function copyMessage() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the reference is shown on screen anyway */
    }
  }

  if (status === 'success' && order) {
    return (
      <div className="merch-card merch-card--pay">
        <div className="swish-pay">
          <p className="swish-pay__thanks">{order.confirmation}</p>
          {order.qrDataUrl ? (
            <img className="swish-pay__qr" src={order.qrDataUrl} alt={tr('Swish QR-kod', 'Swish QR code')} width={220} height={220} />
          ) : null}
          <dl className="swish-pay__details">
            <div><dt>{tr('Swisha till', 'Swish to')}</dt><dd>{order.swishNumber}</dd></div>
            <div><dt>{tr('Belopp', 'Amount')}</dt><dd>{order.amount} SEK</dd></div>
            <div>
              <dt>{tr('Meddelande', 'Message')}</dt>
              <dd>
                <button type="button" className="swish-pay__copy" onClick={copyMessage}>
                  {order.message} <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
                </button>
              </dd>
            </div>
          </dl>
          <p className="swish-pay__hint">{tr('Scanna QR-koden med Swish, eller ange uppgifterna manuellt.', 'Scan the QR code with Swish, or enter the details manually.')}</p>
          <button type="button" className="swish-pay__again" onClick={() => { setStatus('idle'); setOrder(null); }}>
            {tr('Gör en ny beställning', 'Place another order')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="merch-card">
      <img src={product.image} alt={product.name[lang]} loading="lazy" />
      <div>
        <h3>{product.name[lang]}</h3>
        <p>{product.description[lang]}</p>
        <p className="price">{product.priceSek} SEK</p>

        {sizes.length > 0 ? (
          <fieldset className="merch-sizes">
            <legend>{tr('Storlek', 'Size')}</legend>
            <div className="merch-sizes__options">
              {sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`merch-sizes__option${size === option ? ' merch-sizes__option--active' : ''}`}
                  aria-pressed={size === option}
                  onClick={() => setSize(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <label>
          {tr('Antal', 'Quantity')}
          <input type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        </label>
        <label>
          {tr('Namn', 'Name')}
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder={tr('För- och efternamn', 'Full name')} />
        </label>
        <label>
          {tr('E-post för bekräftelse', 'Email for confirmation')}
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
        </label>
        <label>
          {tr('Not (upphämtning eller adress)', 'Note (pickup or shipping address)')}
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder={tr('Valfritt', 'Optional')} />
        </label>

        <button className="brush-button" type="button" disabled={status === 'loading'} onClick={submit}>
          {status === 'loading' ? tr('Skapar beställning…', 'Creating order…') : tr('Beställ & betala med Swish', 'Order & pay with Swish')}
        </button>
        {message ? <p className={`checkout-message checkout-message--${status}`}>{message}</p> : null}
      </div>
    </div>
  );
}
