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