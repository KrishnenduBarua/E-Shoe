import crypto from "crypto";

console.log("\n🔐 Generating secure secrets for production...\n");

console.log("JWT_SECRET:");
console.log(crypto.randomBytes(32).toString("base64"));

console.log("\nADMIN_JWT_SECRET:");
console.log(crypto.randomBytes(32).toString("base64"));

console.log("\n✅ Copy these values to your environment variables!");
console.log("⚠️  Keep these secrets secure and never commit them to git!\n");
