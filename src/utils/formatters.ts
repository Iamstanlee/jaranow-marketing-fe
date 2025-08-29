export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.startsWith('234')) {
    const formatted = cleaned.replace(/^234(\d{3})(\d{3})(\d{4})$/, '+234 $1 $2 $3');
    return formatted;
  }
  
  if (cleaned.startsWith('0')) {
    const withoutLeadingZero = cleaned.substring(1);
    const formatted = withoutLeadingZero.replace(/^(\d{3})(\d{3})(\d{4})$/, '+234 $1 $2 $3');
    return formatted;
  }
  
  if (cleaned.length === 10) {
    const formatted = cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, '+234 $1 $2 $3');
    return formatted;
  }
  
  return value;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return true;
  }
  
  if ((cleaned.startsWith('0') || cleaned.length === 10) && cleaned.length >= 10) {
    return true;
  }
  
  return false;
};

export const formatCurrency = (amount: number, currency: string = '₦'): string => {
  return `${currency}${amount.toLocaleString()}`;
};

export const scrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};