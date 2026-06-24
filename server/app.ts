import express from 'express';
import { router } from './routes';
import cors from 'cors'
import { config } from 'dotenv';
import { RequestHandler } from 'express'
import { AuthRequest } from './types/AuthRequest'
import { supabase } from './db/connection';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const app = express();
const port: number = 4001;
app.use(cors());


app.post('/mathly/checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Pro Subscription'
          },
          recurring: {
            interval: 'month'
          },
          unit_amount: 5 * 100
        },
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.CLIENT_URL}/checkout-complete`,
    cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`
  })
  console.log(session);

})



// const { error } = await supabase
//   .from('users')
//   .update({
//     stripe_customer_id: session.customer as string,
//     stripe_subscription_id: subscription.id,
//     subscription_status: subscription.status,
//     current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
//   })
//   .eq('id', user_id)


app.use(express.json());
app.use('/mathly', router);


app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
