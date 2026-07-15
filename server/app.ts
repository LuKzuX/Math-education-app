import express from 'express';
import { router } from './routes';
import cors from 'cors'
import { config } from 'dotenv';
import { AuthRequest } from './types/AuthRequest'
import { supabase } from './db/connection';
import { userAuth } from './middlewares/userAuth';
import { getClientUrl } from './utils/clientUrl';
import Stripe from "stripe";

config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const app = express();
const port: number = 4001;

const allowedOrigins = (process.env.CLIENT_URL ?? '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true)
    }
    console.error(`CORS rejected origin "${origin}". Allowed: ${allowedOrigins.join(', ')}`)
    callback(new Error('Not allowed by CORS'))
  },
}));


// app.post('/mathly/checkout', userAuth, async (req: AuthRequest, res) => {
//   if (!req?.user) return res.json("you need to be logged in")
//   const plan = req.query.plan
//   if (!plan) return res.send("you need a plan")
//   let priceId
//   switch (plan) {
//     case 'pro':
//       priceId = 'price_1TkpDTLp9oLU8pvCqhHkxAKL'
//       break;
//     default:
//       return res.send('subscrioption not found')
//   }

//   const session = await stripe.checkout.sessions.create({
//     client_reference_id: req.user.id,
//     line_items: [
//       {
//         price: priceId,
//         quantity: 1
//       }
//     ],
//     mode: 'subscription',
//     success_url: `${getClientUrl()}checkout-complete?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${getClientUrl()}checkout-cancel`
//   })
//   if (!session.url) {
//     return res.status(500).send('Failed to create checkout session');
//   }
//   res.send(session.url)
// })

// app.get('/mathly/portal', userAuth, async (req: AuthRequest, res) => {
//   if (!req.user) return res.status(401).send('not logged in')

//   const { data, error } = await supabase
//     .from('users')
//     .select('stripe_customer_id')
//     .eq('id', req.user.id)
//     .maybeSingle()

//   if (error) return res.status(500).send('lookup failed')

//   const customerId = data?.stripe_customer_id
//   if (!customerId) return res.status(400).send('no subscription')

//   const portalSection = await stripe.billingPortal.sessions.create({
//     customer: customerId,
//     return_url: `${getClientUrl()}`,
//   })

//   res.redirect(portalSection.url)
// })

// app.post(
//   '/mathly/webhook',
//   express.raw({ type: 'application/json' }),
//   async (req, res) => {
//     const sig = req.headers['stripe-signature']

//     let event: Stripe.Event
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig as string,
//         process.env.STRIPE_WEBHOOK_SECRET_KEY!
//       )
//     } catch (err) {
//       console.error('webhook signature error:', (err as Error).message)
//       return res.status(400).send(`Webhook Error: ${(err as Error).message}`)
//     }

//     console.log('webhook event type:', event.type)

//     switch (event.type) {
//       case 'checkout.session.completed': {
//         const session = event.data.object as Stripe.Checkout.Session
//         const userId = session.client_reference_id
//         const customerId = session.customer as string

//         console.log('userId:', userId, 'customerId:', customerId)

//         const { data, error } = await supabase
//           .from('users')
//           .update({
//             stripe_customer_id: customerId,
//             subscription_status: 'active',
//           })
//           .eq('id', userId)
//           .select()

//         if (error) console.error('webhook update failed:', error)
//         break
//       }

//       case 'customer.subscription.updated': {
//         const sub = event.data.object as Stripe.Subscription
//         const customerId = sub.customer as string
//         await supabase
//           .from('users')
//           .update({ subscription_status: sub.status })
//           .eq('stripe_customer_id', customerId)
//         break
//       }

//       case 'customer.subscription.deleted': {
//         const sub = event.data.object as Stripe.Subscription
//         const customerId = sub.customer as string
//         await supabase
//           .from('users')
//           .update({ subscription_status: 'canceled' })
//           .eq('stripe_customer_id', customerId)
//         break
//       }

//       default:
//         break
//     }

//     res.json({ received: true })
//   }
// )

app.use(express.json());
app.use('/mathly', router);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  if (res.headersSent) return next(err)
  res.status(500).json({ message: 'Internal server error' })
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at ${port}`);
  });
}

export default app;
