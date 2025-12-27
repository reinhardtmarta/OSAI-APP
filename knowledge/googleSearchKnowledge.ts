
/**
 * OSAI Google Search & Web Navigation Knowledge
 * Defines how the AI behaves when searching and navigating the web.
 */

export const GOOGLE_SEARCH_KNOWLEDGE = {
  search_priority: [
    "Prioritize direct results (Featured Snippets).",
    "Avoid sites with Paywalls or excessive CAPTCHAs.",
    "Validate information date to ensure relevance (Today's/recent news).",
    "Extract links from original sources for Grounding."
  ],
  navigation_rules: [
    "Always inform the user when a search is starting.",
    "Summarize content from multiple sites into a single coherent response.",
    "In case of technical barriers (CAPTCHA), try an alternative source immediately.",
    "If the user requests YouTube, focus on describing visual steps for accessibility."
  ],
  grounding_protocol: "Always attach 'groundingUrls' to responses using external data."
};
