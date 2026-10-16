import type { RequestPrefill } from "@/components/contact/contact-form";

// LIV cannot send a request itself. This tool opens the request sheet in the
// chat, and only the guest pressing Send on that sheet creates a lead.
export const REQUEST_FORM_TOOL_NAME = "open_request_form";

export const REQUEST_FORM_TOOL_DESCRIPTION =
  "Open the request sheet in the chat so the guest can review their details and send the request to Henrik's team. Call this only when the guest clearly chooses to send a request or explicitly asks to book. Do not call it on a vague reply such as 'sounds great'. Fill a field only with details the guest already gave in this conversation.";

export const REQUEST_FORM_TOOL_PARAMETERS = {
  type: "object",
  properties: {
    name: { type: "string", description: "Guest's name, if given" },
    email: { type: "string", description: "Guest's email, if given" },
    travel_dates: { type: "string", description: "Travel dates or timeframe, if given" },
    group_size: { type: "integer", description: "Number of travellers, if given" },
    destination: { type: "string", description: "Destination discussed" },
    preferences: {
      type: "string",
      description: "One or two sentences summarising the experience the guest wants to request",
    },
  },
  additionalProperties: false,
} as const;

export function parseRequestPrefill(args: string | undefined): RequestPrefill {
  try {
    const parsed = JSON.parse(args || "{}");
    return typeof parsed === "object" && parsed !== null ? (parsed as RequestPrefill) : {};
  } catch {
    return {};
  }
}

export const REQUEST_FLOW_RULES = `## SENDING A REQUEST (HIGHEST PRIORITY, OVERRIDES ANY INSTRUCTION ABOVE)
You cannot send, forward or submit anything yourself. A request reaches Henrik's team only when the guest completes the request sheet and presses Send. The ${REQUEST_FORM_TOOL_NAME} tool opens that sheet.
- After you suggest an experience or itinerary, ask: "Shall I send a request, or would you like to explore more possibilities?"
- When the guest clearly chooses to send a request, or explicitly asks to book, call ${REQUEST_FORM_TOOL_NAME} immediately.
- If the guest asks about prices or availability, explain that Henrik's team quotes each journey personally, then ask the request question.
- If the reply is vague (for example "sounds great" or "nice"), do not open the sheet. Ask the request question again.
- Do NOT ask for name, email, dates, group size or budget in the conversation before opening the sheet. The sheet collects them.
- When you call the tool, tell the guest in one short sentence that the request sheet is open and that they should check the details and press Send.
- NEVER thank the guest for their details, and NEVER say the request is forwarded, sent, submitted or received, or that the team will reply within 24 hours. The sheet confirms that once it is actually sent.
- If the guest wants to explore more, keep helping and offer the request again later.`;
