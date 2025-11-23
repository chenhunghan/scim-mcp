export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  
  const visibleChars = Math.min(2, Math.floor(local.length * 0.3));
  const masked = local.substring(0, visibleChars) + "******";
  return `${masked}@${domain}`;
}

export function maskPhoneNumber(phone: string): string {
  // Keep country code and last 2 digits visible
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  
  const lastTwo = digits.slice(-2);
  const prefix = digits.length > 10 ? digits.substring(0, 2) : "";
  return prefix ? `+${prefix}******${lastTwo}` : `******${lastTwo}`;
}

export function maskString(value: string): string {
  if (value.length <= 2) return "***";
  
  const visibleChars = Math.min(2, Math.floor(value.length * 0.3));
  const masked = value.substring(0, visibleChars) + "******";
  return masked;
}

export function maskPII(obj: any, piiFields: Set<string>): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => maskPII(item, piiFields));
  }
  
  if (typeof obj === "object") {
    const masked: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Check if this field contains PII
      if (piiFields.has(lowerKey)) {
        if (typeof value === "string") {
          if (lowerKey.includes("email") || key === "value" && obj.type === "email") {
            masked[key] = maskEmail(value);
          } else if (lowerKey.includes("phone") || lowerKey.includes("mobile") || 
                     key === "value" && (obj.type === "phone" || obj.type === "mobile")) {
            masked[key] = maskPhoneNumber(value);
          } else {
            masked[key] = maskString(value);
          }
        } else if (value !== null && typeof value === "object") {
          // Recursively mask nested objects
          masked[key] = maskPII(value, piiFields);
        } else {
          masked[key] = value;
        }
      } else if (value !== null && typeof value === "object") {
        // Recursively process nested objects even for non-PII fields
        masked[key] = maskPII(value, piiFields);
      } else {
        masked[key] = value;
      }
    }
    
    return masked;
  }
  
  return obj;
}

export const PII_FIELDS = new Set([
  "username",
  "email",
  "emails",
  "displayname",
  "phonenumber",
  "phonenumbers",
  "phone",
  "mobile",
  "streetaddress",
  "locality",
  "region",
  "postalcode",
  "address",
  "addresses",
  "givenname",
  "familyname",
  "middlename",
  "formatted", // formatted name/address
]);
