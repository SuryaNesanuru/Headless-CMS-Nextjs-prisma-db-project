import prisma from "@/lib/db";

export async function triggerWebhooks(
  event: string,
  modelSlug: string,
  entryId: string,
  data?: Record<string, unknown>
) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        active: true,
      },
    });

    const matchingWebhooks = webhooks.filter((webhook: any) => {
      const events = webhook.events as string[];
      return events.includes(event);
    });

    const payload = {
      event,
      model: modelSlug,
      entryId,
      data,
      timestamp: new Date().toISOString(),
    };

    const results = await Promise.allSettled(
      matchingWebhooks.map(async (webhook: any) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (webhook.secret) {
          headers["X-Webhook-Secret"] = webhook.secret;
        }

        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        await prisma.webhookLog.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payload as any,
            status: response.status,
            response: await response.text().catch(() => null),
          },
        });

        return response;
      })
    );

    return results;
  } catch (error) {
    console.error("Error triggering webhooks:", error);
  }
}
