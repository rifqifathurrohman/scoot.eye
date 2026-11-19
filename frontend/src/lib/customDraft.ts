// Hand-off from the "Make it yours" temple preview to the product page's custom-print form.
const KEY = "scoot-custom-draft";

export interface CustomDraft {
  text: string;
  fileName: string;
  fontLabel: string;
}

export function saveCustomDraft(draft: CustomDraft) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable (private mode); the preview still works without the hand-off.
  }
}

export function readCustomDraft(): CustomDraft | null {
  try {
    const stored = window.sessionStorage.getItem(KEY);
    return stored ? (JSON.parse(stored) as CustomDraft) : null;
  } catch {
    return null;
  }
}
