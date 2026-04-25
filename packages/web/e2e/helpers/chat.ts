import { expect, type Page, type Locator } from "@playwright/test";

const INPUT = "#chat-input";
const SUBMIT = '[aria-label="Enviar mensaje"]';

/**
 * Send a message through the ChatPanel composer and wait until the assistant
 * stream finishes (the textarea re-enables). Returns the locator of the last
 * assistant bubble so callers can assert on its text.
 */
export async function sendChatMessage(page: Page, text: string): Promise<Locator> {
  const beforeCount = await assistantBubbles(page).count();
  await page.locator(INPUT).fill(text);
  await page.locator(SUBMIT).click();

  // Composer disables itself while streaming; wait for it to come back.
  await expect(page.locator(INPUT)).toBeDisabled({ timeout: 5_000 }).catch(() => {});
  await expect(page.locator(INPUT)).toBeEnabled({ timeout: 120_000 });

  // A new assistant bubble must have appeared.
  const after = assistantBubbles(page);
  await expect(after).toHaveCount(beforeCount + 1, { timeout: 30_000 });
  return after.last();
}

/**
 * Locator that matches every assistant message bubble in the panel.
 * Relies on ChatPanel's structure: outer flex with "justify-start" for
 * assistant messages, with the bubble being the last `div` child.
 */
export function assistantBubbles(page: Page): Locator {
  return page.locator('div.flex.w-full.gap-3.justify-start >> div.rounded-2xl');
}

export function userBubbles(page: Page): Locator {
  return page.locator('div.flex.w-full.gap-3.justify-end >> div.rounded-2xl');
}

/**
 * Wait until the chat is idle (textarea enabled, no spinner). Useful between
 * scripted turns when you do not want to send a new message yet.
 */
export async function waitForChatIdle(page: Page): Promise<void> {
  await expect(page.locator(INPUT)).toBeEnabled({ timeout: 120_000 });
}

/**
 * Concatenate the text of every assistant bubble. Use this for "did the
 * conversation as a whole mention X" assertions where you do not care which
 * turn produced it.
 */
export async function assistantTranscript(page: Page): Promise<string> {
  const texts = await assistantBubbles(page).allInnerTexts();
  return texts.join("\n");
}

/**
 * Reset the conversation via the "Limpiar" button. Returns once the
 * suggestion view is visible again.
 */
export async function clearChat(page: Page): Promise<void> {
  await page.getByRole("button", { name: /limpiar/i }).click();
  await expect(page.getByText("¿En qué te ayudo?")).toBeVisible();
}
