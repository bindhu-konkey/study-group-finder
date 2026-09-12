import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\obula\\.gemini\\antigravity-ide\\brain\\221a027c-200e-4c4e-9969-faada02a93c4';

async function capture() {
  console.log('Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // 1. Explore Page (Unauthenticated / Public Directory)
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturing Explore Page...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_explore.png') });

  // 2. Open Login Modal
  console.log('Clicking Sign In button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const signIn = btns.find(el => el.textContent && el.textContent.includes('Sign In'));
    if (signIn) signIn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturing Login Modal...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_login_modal.png') });

  // 3. One-Click Demo Login as Alex Chen
  console.log('Triggering demo login as Alex Chen...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const alexBtn = btns.find(el => el.textContent && el.textContent.includes('Alex Chen'));
    if (alexBtn) alexBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // 4. Navigate to Dashboard
  console.log('Navigating to Dashboard...');
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, a'));
    const dash = navItems.find(el => el.textContent && el.textContent.includes('Dashboard'));
    if (dash) dash.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Capturing Dashboard...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_dashboard.png') });

  // 5. Open Create Group Modal
  console.log('Opening Create Group Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const create = btns.find(el => el.textContent && el.textContent.includes('Create New Group'));
    if (create) create.click();
  });
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturing Create Group Modal...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_create_modal.png') });

  // Close modal by clicking outside or close button
  await page.evaluate(() => {
    const close = document.querySelector('button[aria-label="Close"], .fixed button.absolute');
    if (close) close.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 6. Navigate to Calendar
  console.log('Navigating to Calendar...');
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, a'));
    const cal = navItems.find(el => el.textContent && el.textContent.includes('Calendar'));
    if (cal) cal.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturing Calendar screen...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_calendar.png') });

  // 7. Navigate to My Groups
  console.log('Navigating to My Groups...');
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, a'));
    const mg = navItems.find(el => el.textContent && el.textContent.includes('My Groups'));
    if (mg) mg.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturing My Groups screen...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_my_groups.png') });

  // 8. Open Delete Group Modal
  console.log('Clicking Delete button...');
  await page.evaluate(() => {
    // Find trash buttons in group cards
    const trashBtn = document.querySelector('button[title*="Delete"], button:has(svg.lucide-trash-2), button:has(svg.lucide-trash)');
    if (trashBtn) {
      trashBtn.click();
    } else {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const del = allButtons.find(b => b.innerHTML.includes('trash') || b.title?.includes('Delete') || b.className.includes('text-red'));
      if (del) del.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  console.log('Capturing Delete Confirmation Modal...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_delete_modal.png') });

  console.log('ALL PREVIEWS CAPTURED SUCCESSFULLY!');
  await browser.close();
}

capture().catch(err => {
  console.error('Error capturing previews:', err);
  process.exit(1);
});
