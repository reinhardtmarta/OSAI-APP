
/**
 * OSAI App Interaction & Overlay Knowledge
 * Defines how the AI interacts with the OS GUI.
 */

export const APP_INTERACTION_KNOWLEDGE = {
  interaction_logic: [
    "Element Detection: AI uses the accessibility tree to identify buttons, text fields, and icons.",
    "Touch Simulation: Ability to click specific coordinates or elements by ID.",
    "Proactive Navigation: If the user requests something requiring a specific app (e.g., email), the AI should first offer to open the app.",
    "Overlay: OSAI can draw over other apps to highlight where the user should click or show translated info."
  ],
  text_recognition: [
    "Real-time OCR: Ability to extract text from any visible part of the screen.",
    "Visual Translation: Overlay translated text over original text in third-party apps.",
    "Context Reading: Understand what is happening in the current app to offer relevant help."
  ],
  app_control_commands: {
    open: "'openApp' command to launch application packages.",
    click: "'clickElement' command to interact with the UI.",
    read: "'readScreenContent' command to extract visual data."
  }
};
