// Supabase Edge Function: Process Push Notification Queue
// This function reads unsent notifications from push_notification_queue
// and sends them via Expo Push Notification API.
//
// Deploy: supabase functions deploy send-push-notifications
// Schedule: Set up a cron job or database webhook to call this function
//
// Environment variable needed:
//   SUPABASE_SERVICE_ROLE_KEY (automatically available in Edge Functions)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushQueueItem {
    id: string;
    token: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
}

interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound: string;
    priority: string;
    channelId: string;
}

Deno.serve(async (req) => {
    try {
        // Create Supabase client with service role key
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch unsent notifications (batch of 100)
        const { data: queue, error: fetchError } = await supabase
            .from("push_notification_queue")
            .select("*")
            .eq("sent", false)
            .order("created_at", { ascending: true })
            .limit(100);

        if (fetchError) {
            throw new Error(`Failed to fetch queue: ${fetchError.message}`);
        }

        if (!queue || queue.length === 0) {
            return new Response(
                JSON.stringify({ success: true, sent: 0, message: "No pending notifications" }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        // Build Expo push messages
        const messages: ExpoPushMessage[] = (queue as PushQueueItem[]).map((item) => ({
            to: item.token,
            title: item.title,
            body: item.body,
            data: item.data,
            sound: "default",
            priority: "high",
            channelId: "default",
        }));

        // Send in chunks of 100 (Expo API limit)
        const chunks = [];
        for (let i = 0; i < messages.length; i += 100) {
            chunks.push(messages.slice(i, i + 100));
        }

        let totalSent = 0;
        const failedIds: string[] = [];

        for (const chunk of chunks) {
            const response = await fetch(EXPO_PUSH_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(chunk),
            });

            if (!response.ok) {
                console.error(`Expo Push API error: ${response.status}`);
                continue;
            }

            const result = await response.json();

            // Process results and mark as sent
            if (result.data) {
                for (let i = 0; i < result.data.length; i++) {
                    const ticket = result.data[i];
                    const queueItem = (queue as PushQueueItem[])[totalSent + i];

                    if (ticket.status === "ok") {
                        // Mark as sent
                        await supabase
                            .from("push_notification_queue")
                            .update({ sent: true })
                            .eq("id", queueItem.id);
                    } else if (ticket.status === "error") {
                        failedIds.push(queueItem.id);

                        // If token is invalid, remove it from the user's profile
                        if (ticket.details?.error === "DeviceNotRegistered") {
                            await supabase
                                .from("profiles")
                                .update({ expo_push_token: null })
                                .eq("expo_push_token", queueItem.token);

                            // Mark as sent to prevent retries
                            await supabase
                                .from("push_notification_queue")
                                .update({ sent: true })
                                .eq("id", queueItem.id);
                        }
                    }
                }
            }

            totalSent += chunk.length;
        }

        // Clean up old sent notifications (older than 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        await supabase
            .from("push_notification_queue")
            .delete()
            .eq("sent", true)
            .lt("created_at", sevenDaysAgo.toISOString());

        return new Response(
            JSON.stringify({
                success: true,
                sent: totalSent - failedIds.length,
                failed: failedIds.length,
                total: queue.length,
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Push notification error:", error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});
