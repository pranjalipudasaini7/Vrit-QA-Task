import { test, expect } from '@playwright/test';
import MailosaurClient from 'mailosaur';
import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import process from 'process';

// Reads these from .env
const apiKey = process.env.MAILOSAUR_API_KEY;
const serverId = process.env.MAILOSAUR_SERVER_ID;

if (!apiKey) {
  throw new Error('MAILOSAUR_API_KEY is missing. Add it to your .env file.');
}

if (!serverId) {
  throw new Error('MAILOSAUR_SERVER_ID is missing. Add it to your .env file.');
}

const mailosaur = new MailosaurClient(apiKey);

test('complete authorized partner registration', async ({ page }, testInfo) => {
  
  // To generate unique data for every test run

  const uniqueId = `${Date.now()}-${testInfo.parallelIndex}`;

  const email = `testing-${uniqueId}@${serverId}.mailosaur.net`;

  const primaryPhone = `98${String(Date.now()).slice(-8)}`;

  const agencyEmail = `agency-${uniqueId}@${serverId}.mailosaur.net`;

  // To create a temporary SVG file for upload

  const uploadFolder = path.join(process.cwd(), 'test-files');

  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
  }

  const uploadFilePath = path.join(uploadFolder, `registration-${uniqueId}.svg`);

  fs.writeFileSync(
    uploadFilePath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
      <rect width="100%" height="100%" fill="white"/>
      <text x="20" y="80" font-size="20">Test Registration Document</text>
    </svg>`
  );

  // To start registration

  await page.goto('https://authorized-partner.vercel.app/');

  await page.locator('button').filter({ hasText: /^Join Us Now$/ }).click();

  await page
    .getByRole('checkbox', { name: /I agree to the Terms of/i })
    .check();

  await page.getByRole('button', { name: 'Continue' }).click();

  // To fill personal details

  await page.getByRole('textbox', { name: 'First Name' }).fill('Testing');
  await page.getByRole('textbox', { name: 'Last Name' }).fill('Partner');

  await page
    .getByRole('textbox', { name: 'Email Address' })
    .fill(email);

  await page
    .getByRole('textbox', { name: 'Phone Number' })
    .fill(primaryPhone);

  await page.locator('input[name="password"]').fill('Password.7');

  await page
    .locator('input[name="confirmPassword"]')
    .fill('Password.7');

  await page.getByRole('button', { name: 'Next' }).click();

  // Retrieve OTP from Mailosaur

  const message = await mailosaur.messages.get(
    serverId,
    {
      sentTo: email,
    },
    {
      timeout: 60_000,
    }
  );

  const emailText =
    message.text?.body ??
    message.html?.body ??
    message.subject ??
    '';

  const otpMatch = emailText.match(/\b(\d{4,8})\b/);

  expect(
    otpMatch,
    `OTP was not found in Mailosaur email. Email content: ${emailText}`
  ).not.toBeNull();

  const otp = otpMatch![1];

  await page.getByRole('textbox').fill(otp);

  await page.getByRole('button', { name: 'Verify Code' }).click();

  // Agency details

  await page.getByRole('textbox', { name: 'Name' }).fill('Testing Agency');

  await page
    .getByRole('textbox', { name: 'Role in Agency' })
    .fill('Education Consultant');

  await page
    .getByRole('textbox', { name: 'Email Address' })
    .fill(agencyEmail);

  await page
    .getByRole('textbox', { name: 'Website' })
    .fill('testingagency.com');

  await page
    .getByRole('textbox', { name: 'Address', exact: true })
    .fill('Kathmandu, Nepal');

  await page.getByRole('combobox').click();
  await page.getByText('France', { exact: true }).click();

  await page.getByRole('button', { name: 'Next' }).click();

  // Experience details

  await page.getByRole('combobox', { name: 'Years of Experience' }).click(); 
  
  await page.getByRole('option', { name: '5 years' }).click();

  await page
    .getByRole('spinbutton', { name: 'Number of Students Recruited' })
    .fill('3400');

  await page
    .getByRole('textbox', { name: 'Focus Area' })
    .fill('Undergraduate degree in France');

  await page
    .getByRole('spinbutton', { name: 'Success Metrics' })
    .fill('75');

  await page
    .getByRole('checkbox', { name: 'Career Counseling' })
    .check();

  await page
    .getByRole('checkbox', { name: 'Admission Applications' })
    .check();

  await page
    .getByRole('checkbox', { name: 'Visa Processing' })
    .check();

  await page
    .getByRole('checkbox', { name: 'Test Prepration' })
    .check();

  await page.getByRole('button', { name: 'Next' }).click();

  // Business and certification details

  await page
    .getByRole('textbox', { name: 'Business Registration Number' })
    .fill(`REG-${uniqueId}`);

  await page
    .getByRole('combobox', { name: 'Preferred Countries' })
    .click();

  await page.getByText('France', { exact: true }).click();
  await page.getByText('India', { exact: true }).click();
  await page.getByText('Nepal', { exact: true }).click();
  await page.getByText('Canada', { exact: true }).click();

  await page.getByRole('checkbox', { name: 'Universities' }).check();
  await page.getByRole('checkbox', { name: 'Colleges' }).check();

  await page
    .getByRole('textbox', { name: /Certification Details/i })
    .fill('ICEF Certified Educational Agent');

  await page.getByRole('button', { name: 'Submit' }).click();

  // For uploading document

  await page.getByRole('button', { name: 'Add Documents' }).click();

  const fileInputs = page.locator('input[type="file"]');

console.log('Number of file inputs:', await fileInputs.count());

for (let i = 0; i < await fileInputs.count(); i++) {
  console.log(
    `File input ${i}:`,
    await fileInputs.nth(i).evaluate((input: HTMLInputElement) => ({
      id: input.id,
      name: input.name,
      accept: input.accept,
      multiple: input.multiple,
      outerHTML: input.outerHTML,
    }))
  );
}

await fileInputs.first().setInputFiles(uploadFilePath);

  await expect(page.getByText(path.basename(uploadFilePath))).toBeVisible();

  await page.getByRole('button', { name: 'Submit' }).click(); 
  
  await page.goto('https://authorized-partner.vercel.app/admin/profile'); 
});