'use client'

import { motion } from 'framer-motion'

interface PhoneLinkProps {
  phoneText: string
  className?: string
}

// Extract phone number from text and create tel: link
function extractPhoneNumber(text: string): string {
  // Match phone number pattern: +1 438 596 85 66 or similar formats
  const phoneMatch = text.match(/\+?[\d\s\-\(\)]+/g)
  if (phoneMatch) {
    // Get the longest match (likely the phone number)
    const phoneNumber = phoneMatch.reduce((a, b) => (a.length > b.length ? a : b))
    // Remove all non-digit characters except +
    return phoneNumber.replace(/[^\d+]/g, '')
  }
  // Fallback: try to extract any sequence of digits
  const digits = text.match(/\d+/g)
  if (digits && digits.length > 0) {
    // Combine all digits
    return digits.join('')
  }
  return ''
}

export function PhoneLink({ phoneText, className = '' }: PhoneLinkProps) {
  const phoneNumber = extractPhoneNumber(phoneText)
  const telLink = phoneNumber ? `tel:${phoneNumber}` : '#'

  if (!phoneNumber) {
    // If no phone number found, just return the text
    return <p className={className}>{phoneText}</p>
  }

  return (
    <motion.a
      href={telLink}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${className} inline-block cursor-pointer hover:text-cyan-300 transition-colors underline decoration-cyan-400/50 hover:decoration-cyan-300`}
    >
      {phoneText}
    </motion.a>
  )
}
