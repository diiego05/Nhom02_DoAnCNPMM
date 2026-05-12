import "dotenv/config";
import { sendRegistrationOtp } from "./src/utils/emailService.js";

async function testRecipient() {
  const testEmail = "test_recipient_" + Date.now() + "@yopmail.com";
  const otpCode = "123456";

  console.log(`Starting test: Sending to ${testEmail}`);
  try {
    await sendRegistrationOtp(testEmail, otpCode);
    console.log("Test finished. Check logs above for recipient.");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testRecipient();
