import express from 'express';
import { router } from './routes';
import cors from 'cors'
import { config } from 'dotenv';
import { RequestHandler } from 'express'
import { AuthRequest } from './types/AuthRequest'
import { supabase } from './db/connection';
import { userAuth } from './middlewares/userAuth';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const app = express();
const port: number = 4001;
app.use(cors());


app.post('/mathly/checkout', userAuth, async (req: AuthRequest, res) => {
  if (!req?.user) return res.json("you need to be logged in")
  const plan = req.query.plan
  if (!plan) return res.send("you need a plan")
  let priceId
  switch (plan) {
    case 'pro':
      priceId = 'price_1TkpDTLp9oLU8pvCqhHkxAKL'
      break;
    default:
      return res.send('subscrioption not found')
  }

  const session = await stripe.checkout.sessions.create({
    client_reference_id: req.user.id,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.CLIENT_URL}checkout-complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}checkout-cancel`
  })
  if (!session.url) {
    return res.status(500).send('Failed to create checkout session');
  }
  res.send(session.url)
})

app.get('/checkout-complete', async (req, res) => {
  const sessionId = req.query.session_id;

  if (typeof sessionId !== 'string') {
    return res.status(400).send('Missing or invalid session_id');
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] })
  console.log(JSON.stringify(session));
  res.send("subscribe succesfully")
})

app.get('/checkout-cancel', async (req, res) => {
  res.redirect("/")
})

app.get('/mathly/portal', userAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).send('not logged in')

  const { data, error } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', req.user.id)
    .maybeSingle()

  if (error) return res.status(500).send('lookup failed')

  const customerId = data?.stripe_customer_id
  if (!customerId) return res.status(400).send('no subscription')

  const portalSection = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.CLIENT_URL}/`,
  })

  res.redirect(portalSection.url)
})

// In the ENTRY FILE, this must register BEFORE app.use(express.json())
app.post(
  '/mathly/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET_KEY!
      )
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`)
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = session.customer as string

        const { error } = await supabase
          .from('users')
          .update({
            stripe_customer_id: customerId,
            subscription_status: 'active',
          })
          .eq('id', userId)

        if (error) console.error('webhook update failed:', error)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        await supabase
          .from('users')
          .update({ subscription_status: sub.status })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        await supabase
          .from('users')
          .update({ subscription_status: 'canceled' })
          .eq('stripe_customer_id', customerId)
        break
      }

      default:
        break
    }

    res.json({ received: true })
  }
)

app.use(express.json());
app.use('/mathly', router);


app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
