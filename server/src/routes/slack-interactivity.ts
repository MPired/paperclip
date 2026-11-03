import { Router } from "express";
import express from "express";

/**
 * Slack interactivity endpoint — receives button clicks and other
 * interactive component payloads from Slack.
 *
 * Mounted outside /api to avoid board auth middleware.
 * Slack sends application/x-www-form-urlencoded with a `payload` JSON field.
 */
export function slackInteractivityRoutes() {
  const router = Router();

  router.post(
    "/slack/interactivity-endpoint",
    express.urlencoded({ extended: false }),
    async (req, res) => {
      try {
        const raw = req.body?.payload;
        if (!raw) {
          res.status(400).json({ error: "Missing payload" });
          return;
        }

        const payload = JSON.parse(raw);
        const { type } = payload;

        // Slack requires a 200 within 3 seconds to acknowledge
        if (type === "block_actions") {
          const action = payload.actions?.[0];
          const user = payload.user;
          const message = payload.message;
          const channel = payload.channel;

          console.log(
            `[slack-interactivity] block_action from ${user?.username ?? user?.id}: ` +
            `action=${action?.action_id ?? action?.text?.text} value=${action?.value} ` +
            `channel=${channel?.id}`,
          );

          // Acknowledge with an ephemeral update showing the selection
          const selectedText = action?.text?.text ?? action?.value ?? "selection";
          res.json({
            response_type: "ephemeral",
            replace_original: false,
            text: `Got it — you selected: ${selectedText}`,
          });
          return;
        }

        if (type === "url_verification") {
          // Slack URL verification challenge
          res.json({ challenge: payload.challenge });
          return;
        }

        // Default: acknowledge unknown interaction types
        console.log(`[slack-interactivity] unhandled type: ${type}`);
        res.status(200).send();
      } catch (err) {
        console.error("[slack-interactivity] error:", err);
        res.status(200).send(); // Always 200 to Slack to avoid retries
      }
    },
  );

  return router;
}
