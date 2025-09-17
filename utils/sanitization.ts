/**
 * Safe HTML rendering utilities
 * Prevents XSS attacks by sanitizing and safely rendering HTML content
 */

// Simple markdown-to-React converter that's XSS-safe
export function parseMarkdownSafely(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-lg font-bold text-blue-300 mt-4 mb-2">
          {trimmedLine.substring(3)}
        </h2>
      );
    } else if (trimmedLine.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-md font-semibold text-white mt-3 mb-1">
          {trimmedLine.substring(4)}
        </h3>
      );
    } else if (trimmedLine.startsWith('- ')) {
      elements.push(
        <li key={key++} className="ml-4 text-gray-300">
          {trimmedLine.substring(2)}
        </li>
      );
    } else if (trimmedLine.startsWith('* ')) {
      elements.push(
        <li key={key++} className="ml-4 text-gray-300">
          {trimmedLine.substring(2)}
        </li>
      );
    } else if (trimmedLine.length > 0) {
      // Handle bold text **text** and *italic*
      const processedLine = trimmedLine
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
        .map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={`${key}-${index}`}>{part.slice(2, -2)}</strong>;
          } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
            return <em key={`${key}-${index}`}>{part.slice(1, -1)}</em>;
          } else {
            return part;
          }
        });

      elements.push(
        <p key={key++} className="text-gray-300 mb-2">
          {processedLine}
        </p>
      );
    } else {
      elements.push(<br key={key++} />);
    }
  }

  return elements;
}

// Input sanitization for form fields
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SQL injection prevention for search queries
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .trim()
    .replace(/[;'"\\]/g, '') // Remove SQL injection characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .replace(/\*\//g, '')
    .substring(0, 1000); // Limit length
}

// Validate and sanitize file paths
export function sanitizeFilePath(filePath: string): string {
  if (!filePath || typeof filePath !== 'string') return '';

  return filePath
    .replace(/\.\./g, '') // Prevent directory traversal
    .replace(/[<>"|*?]/g, '') // Remove dangerous file characters
    .replace(/^\/+/, '') // Remove leading slashes
    .trim();
}

// Validate email addresses
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate UUIDs
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validate URLs
export function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Sanitize prompts for AI/RAG systems to prevent prompt injection
export function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return '';

  return prompt
    .trim()
    // Remove potential instruction injection attempts
    .replace(/\b(ignore|forget|disregard)\s+(previous|all|the above|instructions|system|prompt)/gi, '[REMOVED]')
    .replace(/\b(act as|pretend to be|role[\s-]*play|simulate)\s+[^.!?]*[.!?]/gi, '[REMOVED]')
    // Remove attempts to access system information
    .replace(/\b(system|admin|root|config|database|env|environment)\s*(info|details|access|password|key|secret)/gi, '[REMOVED]')
    // Remove attempts to execute commands
    .replace(/\b(exec|execute|run|cmd|command|shell|bash|powershell|script)/gi, '[REMOVED]')
    // Limit dangerous characters
    .replace(/[<>\"'`${}]/g, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Limit length to prevent token exhaustion attacks
    .substring(0, 4000);
}

// Validate prompt content for additional safety
export function validatePromptSafety(prompt: string): { isValid: boolean; reason?: string } {
  if (!prompt || prompt.length === 0) {
    return { isValid: false, reason: 'Empty prompt' };
  }

  if (prompt.length > 4000) {
    return { isValid: false, reason: 'Prompt too long' };
  }

  // Check for potential jailbreak attempts
  const dangerousPatterns = [
    /\b(bypass|override|disable)\s+(safety|security|protection|filter)/gi,
    /\b(jailbreak|escape|break out of|circumvent)/gi,
    /\b(developer\s+mode|admin\s+mode|debug\s+mode)/gi,
    /\bDAN\s+mode/gi, // "Do Anything Now" mode
    /\b(ignore|disregard)\s+(all\s+)?previous\s+(instructions|rules|constraints)/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(prompt)) {
      return { isValid: false, reason: 'Potentially unsafe content detected' };
    }
  }

  return { isValid: true };
}