// --- Shared email validation ---

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates a single email string. Returns error message or null. */
export function validateEmail(email: string | undefined): string | null {
  if (!email?.trim()) return "Email is required.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  return null;
}

// --- Login ---

export interface LoginInfo {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginInfo, string>>;

export function validateLogin(info: Partial<LoginInfo>): LoginErrors | null {
  const errors: LoginErrors = {};

  const emailError = validateEmail(info.email);
  if (emailError) errors.email = emailError;

  if (!info.password) {
    errors.password = "Password is required.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export interface SignupInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignupErrors = Partial<Record<keyof SignupInfo, string>>;

export function validateSignup(info: Partial<SignupInfo>): SignupErrors | null {
  const errors: SignupErrors = {};

  const emailError = validateEmail(info.email);
  if (emailError) errors.email = emailError;

  if (!info.password) {
    errors.password = "Password is required.";
  } else if (info.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  if (!info.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (info.password && info.confirmPassword !== info.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export interface ChangePasswordInfo {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ChangePasswordErrors = Partial<
  Record<keyof ChangePasswordInfo, string>
>;

export function validateChangePassword(
  info: Partial<ChangePasswordInfo>,
): ChangePasswordErrors | null {
  const errors: ChangePasswordErrors = {};

  if (!info.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }
  if (!info.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (info.newPassword.length < 6) {
    errors.newPassword = "Password must be at least 6 characters.";
  }
  if (!info.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (info.newPassword && info.confirmPassword !== info.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// --- Reset password (forgot password flow) ---

export interface ResetPasswordInfo {
  password: string;
  confirmPassword: string;
}

export type ResetPasswordErrors = Partial<
  Record<keyof ResetPasswordInfo, string>
>;

export function validateResetPassword(
  info: Partial<ResetPasswordInfo>,
): ResetPasswordErrors | null {
  const errors: ResetPasswordErrors = {};

  if (!info.password) {
    errors.password = "New password is required.";
  } else if (info.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  if (!info.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (info.password && info.confirmPassword !== info.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
