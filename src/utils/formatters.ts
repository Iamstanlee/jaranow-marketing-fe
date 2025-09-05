export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.startsWith('234')) {
    return cleaned.replace(/^234(\d{3})(\d{3})(\d{4})$/, '+234 $1 $2 $3');
  }

  if (cleaned.length >= 10) {
    return cleaned.substring(cleaned.startsWith('0') ? 1 : 0).replace(/^(\d{3})(\d{3})(\d{4})$/, '+234 $1 $2 $3');
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

export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
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