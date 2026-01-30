export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return "1 min read";
  return `${minutes} min read`;
}

// Extract text from HTML content
export function extractTextFromHTML(html: string): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, " ");
  // Remove extra whitespace
  return text.replace(/\s+/g, " ").trim();
}

// Generate excerpt from content
export function generateExcerpt(text: string, maxLength: number = 160): string {
  const cleanText = text.trim();
  if (cleanText.length <= maxLength) return cleanText;
  
  // Find last complete sentence within limit
  const truncated = cleanText.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastExclamation = truncated.lastIndexOf("!");
  
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return cleanText.substring(0, lastSentenceEnd + 1);
  }
  
  // Otherwise cut at last space
  const lastSpace = truncated.lastIndexOf(" ");
  return cleanText.substring(0, lastSpace) + "...";
}

// Keyword density calculator (SEO)
export function calculateKeywordDensity(text: string, keyword: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const keywordWords = keyword.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  
  let count = 0;
  for (let i = 0; i <= words.length - keywordWords.length; i++) {
    const phrase = words.slice(i, i + keywordWords.length).join(" ");
    if (phrase === keyword.toLowerCase()) {
      count++;
    }
  }
  
  return (count / totalWords) * 100;
}

// Extract headings from HTML content
export function extractHeadings(html: string): { level: number; text: string }[] {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings: { level: number; text: string }[] = [];
  
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].replace(/<[^>]*>/g, "").trim(),
    });
  }
  
  return headings;
}

// Check heading hierarchy (SEO best practice)
export function checkHeadingHierarchy(headings: { level: number; text: string }[]): boolean {
  if (headings.length === 0) return true;
  if (headings[0].level !== 1) return false; // Should start with H1
  
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = headings[i - 1].level;
    const currLevel = headings[i].level;
    
    // Shouldn't skip levels (e.g., H2 to H4)
    if (currLevel > prevLevel + 1) return false;
  }
  
  return true;
}
