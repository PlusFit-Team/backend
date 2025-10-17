export function validateContact(contact: string): 'EMAIL' | 'PHONE' {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^998(20|33|50|77|88|90|91|93|94|95|97|98|99)\d{7}$/; // Uzbek phone number

  if (emailRegex.test(contact)) {
    return 'EMAIL';
  } else if (phoneRegex.test(contact)) {
    return 'PHONE';
  }
}
