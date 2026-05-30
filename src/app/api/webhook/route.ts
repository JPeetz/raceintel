import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan || "pro_monthly";
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;

          const subData = sub as any;
          await supabaseAdmin.from("user_subscriptions").upsert({
            user_id: userId,
            plan,
            status: "trialing",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            is_trialing: true,
            trial_start: subData.trial_start ? new Date(subData.trial_start * 1000).toISOString() : new Date().toISOString(),
            trial_end: subData.trial_end ? new Date(subData.trial_end * 1000).toISOString() : new Date().toISOString(),
            current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
          }, { onConflict: "user_id" });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any;

        let status: string = "inactive";
        if (sub.status === "active") status = "active";
        else if (sub.status === "trialing") status = "trialing";
        else if (sub.status === "past_due") status = "past_due";
        else if (sub.status === "canceled") status = "cancelled";

        await supabaseAdmin.from("user_subscriptions")
          .update({
            status,
            is_trialing: sub.status === "trialing",
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await supabaseAdmin.from("user_subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}