/**
 * AI-ready extension layer.
 * Replace stub implementations with real ML/LLM calls (OpenAI, Hugging Face, etc.).
 */

const CATEGORY_KEYWORDS = {
  prepared: ['meal', 'rice', 'curry', 'pasta', 'sandwich', 'soup', 'cooked'],
  bakery: ['bread', 'cake', 'pastry', 'bun', 'croissant', 'muffin'],
  produce: ['fruit', 'vegetable', 'salad', 'apple', 'tomato', 'lettuce'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
  beverages: ['juice', 'drink', 'soda', 'water', 'coffee', 'tea'],
};

function classifyFood(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return { category, confidence: 0.75, source: 'rule-based' };
    }
  }
  return { category: 'other', confidence: 0.5, source: 'rule-based' };
}

function generateTags(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [];
  if (text.includes('vegetarian') || text.includes('veg ')) tags.push('vegetarian');
  if (text.includes('vegan')) tags.push('vegan');
  if (text.includes('halal')) tags.push('halal');
  if (text.includes('gluten')) tags.push('gluten-free');
  if (text.includes('urgent') || text.includes('today')) tags.push('urgent');
  return tags;
}

function calculatePriorityScore(listing) {
  const hoursUntilExpiry = (new Date(listing.expiryTime) - Date.now()) / (1000 * 60 * 60);
  let score = 50;
  if (hoursUntilExpiry < 2) score += 40;
  else if (hoursUntilExpiry < 6) score += 25;
  else if (hoursUntilExpiry < 12) score += 10;
  if (listing.category === 'prepared') score += 15;
  return Math.min(100, Math.max(0, score));
}

function enrichListing(listingData) {
  const classification = classifyFood(listingData.title, listingData.description);
  const aiTags = generateTags(listingData.title, listingData.description);
  const aiPriorityScore = calculatePriorityScore({
    ...listingData,
    category: classification.category,
  });

  return {
    category: listingData.category || classification.category,
    aiTags,
    aiPriorityScore,
    aiMetadata: {
      classification,
      enrichedAt: new Date().toISOString(),
    },
  };
}

async function getRecommendations(user, availableListings) {
  return availableListings
    .map((listing) => ({
      listing,
      score: listing.aiPriorityScore + (user.role === 'ngo' ? 5 : 0),
      reason: listing.aiPriorityScore > 70 ? 'Expiring soon — high priority' : 'Good match for your area',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

module.exports = {
  classifyFood,
  generateTags,
  calculatePriorityScore,
  enrichListing,
  getRecommendations,
};
