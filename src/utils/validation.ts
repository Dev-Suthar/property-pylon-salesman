/**
 * Validation utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getUsernameError = (username: string): string | undefined => {
  if (!username || username.trim().length === 0) {
    return 'Username or email is required';
  }
  return undefined;
};

export const getPasswordError = (password: string): string | undefined => {
  if (!password || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return undefined;
};

export const getAdminPasswordError = (password: string): string | undefined => {
  const trimmedPassword = password.trim();
  if (!trimmedPassword || trimmedPassword.length === 0) {
    return 'Password is required';
  }
  if (trimmedPassword.length < 8) {
    return 'Password must be at least 8 characters';
  }
  // Check for common weak passwords
  if (trimmedPassword.length > 128) {
    return 'Password must be less than 128 characters';
  }
  return undefined;
};

export const getEmailError = (email: string): string | undefined => {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }
  return undefined;
};

export const getNameError = (name: string): string | undefined => {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return undefined;
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone || phone.trim().length === 0) {
    return true; // Phone is optional, so empty is valid
  }
  // Remove common phone number formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  // Check if it's all digits and has reasonable length (7-15 digits)
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(cleaned);
};

export const getPhoneError = (phone: string): string | undefined => {
  if (!phone || phone.trim().length === 0) {
    return undefined; // Phone is optional
  }
  if (!isValidPhone(phone)) {
    return 'Please enter a valid phone number (7-15 digits)';
  }
  return undefined;
};

export const getAgeError = (age: string | number | undefined): string | undefined => {
  if (age === undefined || age === null || age === '') {
    return undefined; // Age is optional
  }
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;
  if (isNaN(ageNum)) {
    return 'Age must be a valid number';
  }
  if (ageNum < 18) {
    return 'Age must be at least 18';
  }
  if (ageNum > 120) {
    return 'Age must be less than 120';
  }
  return undefined;
};

export const getGenderError = (gender: string | undefined): string | undefined => {
  if (!gender || gender.trim().length === 0) {
    return undefined; // Gender is optional
  }
  const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  if (!validGenders.includes(gender)) {
    return 'Please select a valid gender';
  }
  return undefined;
};

export const getAddressError = (address: string | undefined): string | undefined => {
  if (!address || address.trim().length === 0) {
    return undefined; // Address is optional
  }
  if (address.trim().length < 5) {
    return 'Address must be at least 5 characters';
  }
  return undefined;
};

export const getTeamMembersError = (teamMembers: string | number | undefined): string | undefined => {
  if (teamMembers === undefined || teamMembers === null || teamMembers === '') {
    return undefined; // Team members is optional
  }
  const count = typeof teamMembers === 'string' ? parseInt(teamMembers, 10) : teamMembers;
  if (isNaN(count)) {
    return 'Number of team members must be a valid number';
  }
  if (count < 1) {
    return 'Number of team members must be at least 1';
  }
  if (count > 10000) {
    return 'Number of team members must be less than 10,000';
  }
  return undefined;
};

export const getYearsOfExperienceError = (years: string | number | undefined): string | undefined => {
  if (years === undefined || years === null || years === '') {
    return undefined; // Years of experience is optional
  }
  const yearsNum = typeof years === 'string' ? parseFloat(years) : years;
  if (isNaN(yearsNum)) {
    return 'Years of experience must be a valid number';
  }
  if (yearsNum < 0) {
    return 'Years of experience cannot be negative';
  }
  if (yearsNum > 100) {
    return 'Years of experience must be less than 100';
  }
  return undefined;
};

