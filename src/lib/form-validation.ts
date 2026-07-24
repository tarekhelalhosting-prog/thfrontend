type ValidationErrors<T extends string> = Partial<Record<T, string>>;

const namePattern = /^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s'-]{1,29}$/;
// Matches the backend's Egyptian mobile number rule (^01[0125][0-9]{8}$):
// valid prefixes are 010, 011, 012, 015 only.
const phonePattern = /^01[0125]\d{8}$/;

function hasValue(value: string) {
  return value.trim().length > 0;
}

export function validateRequiredText(value: string, label: string, minLength = 2, maxLength = 50) {
  const normalized = value.trim();

  if (!normalized) {
    return `${label} مطلوب.`;
  }

  if (normalized.length < minLength) {
    return `${label} يجب ألا يقل عن ${minLength} حروف.`;
  }

  if (normalized.length > maxLength) {
    return `${label} يجب ألا يزيد عن ${maxLength} حرفًا.`;
  }

  return "";
}

export function validateName(value: string, label: string) {
  const baseError = validateRequiredText(value, label, 2, 30);

  if (baseError) {
    return baseError;
  }

  if (!namePattern.test(value.trim())) {
    return `${label} يجب أن يحتوي على حروف فقط.`;
  }

  return "";
}

export function validatePhone(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "رقم الهاتف مطلوب.";
  }

  if (!phonePattern.test(normalized)) {
    return "رقم الهاتف غير صحيح، يجب أن يتكون من 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015.";
  }

  return "";
}

// Kept in sync with the backend's registration rule (password minimum
// length: 8) - see API_INTEGRATION_GUIDE.md. Mismatches here previously let
// users submit a form the backend would always reject, which then surfaced
// as a confusing/unrelated error message from the server response.
export function validatePassword(value: string) {
  if (!value) {
    return "كلمة المرور مطلوبة.";
  }

  if (value.length < 8) {
    return "كلمة المرور يجب ألا تقل عن 8 أحرف.";
  }

  return "";
}

export function validatePasswordConfirmation(password: string, confirmPassword: string) {
  if (!confirmPassword) {
    return "تأكيد كلمة المرور مطلوب.";
  }

  if (password !== confirmPassword) {
    return "كلمتا المرور غير متطابقتين.";
  }

  return "";
}

export function validateAddressTitle(value: string) {
  return validateRequiredText(value, "عنوان التعريف", 2, 20);
}

export function validateCity(value: string) {
  return validateRequiredText(value, "المدينة", 2, 40);
}

export function validateCountry(value: string) {
  return validateRequiredText(value, "الدولة", 2, 40);
}

export function validateStreet(value: string) {
  return validateRequiredText(value, "الشارع", 5, 120);
}

export function validateOptionalAddressNotes(value: string, label: string) {
  if (!hasValue(value)) {
    return "";
  }

  if (value.trim().length < 5) {
    return `${label} يجب ألا يقل عن 5 حروف.`;
  }

  if (value.trim().length > 120) {
    return `${label} يجب ألا يزيد عن 120 حرفًا.`;
  }

  return "";
}

export function hasValidationErrors<T extends string>(errors: ValidationErrors<T>) {
  return Object.values(errors).some(Boolean);
}
