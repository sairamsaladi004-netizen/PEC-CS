import fs from 'fs';
let code = fs.readFileSync('backend/api.js', 'utf-8');

// 1. Add import for sendOtpEmail
code = code.replace(/import \{ createSession \} from '\.\/auth\.js';/, "import { createSession } from './auth.js';\nimport { sendOtpEmail } from './mail.js';");

// 2. Generate random OTP in /auth/register
code = code.replace(/const newUser = \{[\s\S]*?phone: "\+91 884 2383305",/m, (match) => {
  return match + "\n    otpCode: Math.floor(100000 + Math.random() * 900000).toString(),";
});

// 3. Send email and update response
code = code.replace(/message: \`Account registered successfully as \$\{targetRole\}! Please verify your institutional email with OTP.\`,[\s\S]*?user: sanitizeUser\(newUser\),[\s\S]*?token: newUser\.id,[\s\S]*?otpHint: "742918"/m, `message: \`Account registered successfully as \$\{targetRole\}! Please check your institutional email (\$\{newUser.email\}) for the OTP.\`,
    user: sanitizeUser(newUser),
    token: newUser.id,
    otpHint: process.env.SMTP_HOST ? undefined : newUser.otpCode // Only show hint if SMTP is not configured
  });
  
  // Send the actual email
  sendOtpEmail(newUser.email, newUser.otpCode);`);

// 4. Update /auth/verify-otp to check the real OTP
code = code.replace(/if \(otp === "742918" \|\| \(typeof otp === 'string' && otp\.length === 6\)\) \{/, `if (otp === user.otpCode || (process.env.NODE_ENV !== 'production' && otp === "742918")) {`);

code = code.replace(/message: "Invalid OTP code\. Use 742918\."/, `message: "Invalid OTP code."`);

fs.writeFileSync('backend/api.js', code);
