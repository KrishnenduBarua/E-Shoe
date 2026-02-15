import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate OTP expiration time
export const getOTPExpiration = () => {
  const minutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 5;
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + minutes);
  return expiration;
};

// Send OTP via SMS using Twilio
export const sendOTP = async (phoneNumber, otp) => {
  try {
    // Check if Twilio is configured
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER ||
      process.env.TWILIO_ACCOUNT_SID === "your_account_sid_here"
    ) {
      // Development mode - just log OTP
      console.log(`\n🔐 ====================================`);
      console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
      console.log(
        `⏰ Valid for ${process.env.OTP_EXPIRE_MINUTES || 5} minutes`,
      );
      console.log(`🔐 ====================================\n`);

      return {
        success: true,
        message: `OTP logged to console (Twilio not configured)`,
        mode: "development",
      };
    }

    // Production mode - send real SMS via Twilio
    const twilio = await import("twilio");
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    // Format phone number for international sending
    const formattedPhone = formatPhoneForSMS(phoneNumber);

    const message = await client.messages.create({
      body: `Your Flick verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 5} minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(
      `✅ SMS sent successfully to ${phoneNumber} (SID: ${message.sid})`,
    );

    return {
      success: true,
      message: `OTP sent to ${phoneNumber}`,
      sid: message.sid,
      mode: "production",
    };
  } catch (error) {
    console.error("❌ SMS sending failed:", error.message);

    // Fallback to console logging if SMS fails
    console.log(`\n🔐 ====================================`);
    console.log(`📱 FALLBACK - OTP for ${phoneNumber}: ${otp}`);
    console.log(`⏰ Valid for ${process.env.OTP_EXPIRE_MINUTES || 5} minutes`);
    console.log(`❌ SMS Error: ${error.message}`);
    console.log(`🔐 ====================================\n`);

    // Still return success so user can continue with the OTP
    return {
      success: true,
      message: `OTP generated (SMS failed, check console)`,
      error: error.message,
      mode: "fallback",
    };
  }
};

// Format phone number for SMS (add Bangladesh country code if needed)
export const formatPhoneForSMS = (phone) => {
  // Remove all spaces, dashes, and special characters
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // If starts with 0, replace with +880 (Bangladesh)
  if (cleaned.startsWith("0")) {
    cleaned = "+880" + cleaned.substring(1);
  }

  // If doesn't start with +, add +880
  if (!cleaned.startsWith("+")) {
    cleaned = "+880" + cleaned;
  }

  return cleaned;
};

// Validate phone number format (Bangladesh)
export const validatePhoneNumber = (phone) => {
  // Remove all spaces, dashes, and special characters
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Bangladesh phone number patterns:
  // 1. With country code: +880 1XXX XXXXXX (11 digits after +880)
  // 2. Without country code: 01XXX XXXXXX (11 digits starting with 01)
  // 3. International format: 880 1XXX XXXXXX

  const patterns = [
    /^\+8801[3-9]\d{8}$/, // +880 1XXX XXXXXX (11 digits)
    /^8801[3-9]\d{8}$/, // 880 1XXX XXXXXX (without +)
    /^01[3-9]\d{8}$/, // 01XXX XXXXXX (local format)
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
};

// Generate unique order number
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

// Format price
export const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};
