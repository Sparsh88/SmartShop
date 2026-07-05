import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI Client Initialized successfully.');
  } catch (error) {
    console.error('Error initializing Gemini AI:', error.message);
  }
} else {
  console.warn('GEMINI_API_KEY not found in environment. Running Gemini in MOCK mode.');
}

/**
 * AI Smart Search intent mapping
 * Maps a search query that has zero database matches to categories, brands, or characteristics.
 */
export const aiSmartSearch = async (query, availableProducts = [], availableCategories = []) => {
  if (!query) return { isMock: true, query, suggestedCategories: [], explanation: '' };

  const productsSummary = availableProducts.map(p => ({
    id: p._id,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price: p.price,
    description: p.description
  }));

  const categoryNames = availableCategories.map(c => c.name);

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are SmartShop AI's search router. A customer searched for "${query}", but we do not have an exact match in our inventory.
        We have the following categories available: ${JSON.stringify(categoryNames)}
        Here is a summary of the products currently available in our inventory:
        ${JSON.stringify(productsSummary)}

        Your task is to analyze the search query "${query}" and understand its intent.
        Map it to the closest categories and suggest similar products from our inventory.
        For example: If the customer searches for "MacBook" and we only have "Dell Laptop" or "HP Laptop", map it to the "Laptops" category.
        If they search for "Nike Shoes" and we only have Puma shoes, map it to "Shoes" and suggest Puma shoes.
        
        Respond ONLY with a JSON object in this format:
        {
          "mappedCategories": ["categoryName1", "categoryName2"],
          "suggestedKeywords": ["keyword1", "keyword2"],
          "explanation": "Brief customer-friendly explanation (e.g. 'MacBook is currently unavailable, but we think you might like these premium laptops.')",
          "matchedProductIds": ["productId1", "productId2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Gemini Smart Search API Error:', error.message);
      // Fallback to mock search mapping on error
    }
  }

  // MOCK Fallback Logic
  console.log('Using Mock AI Search mapping...');
  const lowercaseQuery = query.toLowerCase();
  let mappedCategories = [];
  let explanation = `"${query}" is currently out of stock. Here are some options you might like:`;
  let suggestedKeywords = [];

  // Simple rule-based mapping for demo/fallback
  if (lowercaseQuery.includes('macbook') || lowercaseQuery.includes('laptop') || lowercaseQuery.includes('mac') || lowercaseQuery.includes('computer') || lowercaseQuery.includes('pc') || lowercaseQuery.includes('asus') || lowercaseQuery.includes('acer') || lowercaseQuery.includes('dell') || lowercaseQuery.includes('hp') || lowercaseQuery.includes('lenovo')) {
    mappedCategories = ['Laptops', 'Electronics'];
    suggestedKeywords = ['laptop', 'dell', 'hp', 'lenovo', 'macbook', 'asus', 'acer'];
    explanation = 'MacBook and related laptops are currently unavailable. Here are similar premium laptops you may like.';
  } else if (lowercaseQuery.includes('nike') || lowercaseQuery.includes('shoes') || lowercaseQuery.includes('sneakers') || lowercaseQuery.includes('footwear') || lowercaseQuery.includes('puma') || lowercaseQuery.includes('adidas') || lowercaseQuery.includes('asics') || lowercaseQuery.includes('reebok') || lowercaseQuery.includes('running') || lowercaseQuery.includes('walk')) {
    mappedCategories = ['Shoes', 'Fashion'];
    suggestedKeywords = ['shoes', 'puma', 'adidas', 'running', 'asics', 'reebok', 'sneaker', 'nike'];
    explanation = 'Nike Shoes are currently unavailable. Here are some premium footwear alternatives you might love.';
  } else if (lowercaseQuery.includes('gaming chair') || lowercaseQuery.includes('chair') || lowercaseQuery.includes('furniture') || lowercaseQuery.includes('desk') || lowercaseQuery.includes('table') || lowercaseQuery.includes('steelcase') || lowercaseQuery.includes('autonomous')) {
    mappedCategories = ['Furniture', 'Office Supplies'];
    suggestedKeywords = ['chair', 'office', 'ergonomic', 'desk', 'steelcase', 'autonomous', 'wood'];
    explanation = 'Gaming chairs and desk accessories are out of stock. Check out our high-comfort ergonomic office chairs and solid wood desks.';
  } else if (lowercaseQuery.includes('headphones') || lowercaseQuery.includes('headset') || lowercaseQuery.includes('earbuds') || lowercaseQuery.includes('music') || lowercaseQuery.includes('sound') || lowercaseQuery.includes('sony') || lowercaseQuery.includes('boat') || lowercaseQuery.includes('bose') || lowercaseQuery.includes('jbl') || lowercaseQuery.includes('apple watch') || lowercaseQuery.includes('iphone') || lowercaseQuery.includes('phone') || lowercaseQuery.includes('mobile')) {
    mappedCategories = ['Headphones', 'Electronics'];
    suggestedKeywords = ['headphones', 'headset', 'earbuds', 'sony', 'boat', 'bose', 'jbl', 'airpods', 'sound', 'music'];
    explanation = `"${query}" is currently unavailable. Here are some high-fidelity noise-canceling headphones and premium audio gear you might love.`;
  } else if (lowercaseQuery.includes('hoodie') || lowercaseQuery.includes('jacket') || lowercaseQuery.includes('polo') || lowercaseQuery.includes('shirt') || lowercaseQuery.includes('tshirt') || lowercaseQuery.includes('jeans') || lowercaseQuery.includes('pant') || lowercaseQuery.includes('clothes') || lowercaseQuery.includes('clothing') || lowercaseQuery.includes('apparel') || lowercaseQuery.includes('wear') || lowercaseQuery.includes('dress') || lowercaseQuery.includes('levis') || lowercaseQuery.includes('tommy')) {
    mappedCategories = ['Clothes', 'Fashion'];
    suggestedKeywords = ['hoodie', 'jacket', 'polo', 'shirt', 'denim', 'tommy', 'levis', 'puma', 'adidas'];
    explanation = `"${query}" apparel options are out of stock. Here are some trending hoodies, jackets, and classic polo shirts you may like.`;
  } else if (lowercaseQuery.includes('coffee') || lowercaseQuery.includes('almond') || lowercaseQuery.includes('nuts') || lowercaseQuery.includes('energy bar') || lowercaseQuery.includes('protein bar') || lowercaseQuery.includes('snack') || lowercaseQuery.includes('grocery') || lowercaseQuery.includes('groceries') || lowercaseQuery.includes('food') || lowercaseQuery.includes('eat') || lowercaseQuery.includes('drink') || lowercaseQuery.includes('organic') || lowercaseQuery.includes('healthy')) {
    mappedCategories = ['Grocery', 'Food'];
    suggestedKeywords = ['coffee', 'almond', 'nuts', 'energy bar', 'protein', 'organic', 'snack', 'yogabar', 'blue tokai', 'happilo'];
    explanation = `"${query}" is currently unavailable in our grocery inventory. Check out our organic coffee beans, raw California almonds, and protein energy bars.`;
  } else {
    // General keyword mapping
    mappedCategories = categoryNames.filter(cat =>
      lowercaseQuery.includes(cat.toLowerCase()) || cat.toLowerCase().includes(lowercaseQuery)
    );
    suggestedKeywords = [lowercaseQuery];
  }

  // Find products matching keywords
  let matchedProductIds = availableProducts
    .filter(p => 
      mappedCategories.includes(p.category) || 
      suggestedKeywords.some(kw => p.name.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw))
    )
    .slice(0, 4)
    .map(p => p._id);

  // Absolute fallback if no products match
  if (matchedProductIds.length === 0) {
    matchedProductIds = availableProducts.slice(0, 4).map(p => p._id);
    explanation = `"${query}" is not currently in our inventory, but here are some of our popular products you might love!`;
  }

  return {
    mappedCategories,
    suggestedKeywords,
    explanation,
    matchedProductIds,
    isMock: true
  };
};

/**
 * AI Shopping Assistant
 * Discusses user requirements (budget, features, brand) and lists available options from the DB.
 */
export const getChatbotResponse = async (chatHistory, userMessage, availableProducts = []) => {
  const productsSummary = availableProducts.map(p => ({
    id: p._id,
    name: p.name,
    price: p.price,
    category: p.category,
    brand: p.brand,
    rating: p.rating,
    stock: p.stock,
    description: p.description
  }));

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      // Format previous chat history for the prompt
      const formattedHistory = chatHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

      const prompt = `
        You are "SmartShop AI Assistant", a smart shopping assistant for an e-commerce app.
        Your goal is to guide the user to the best products in our inventory.
        Here is our current inventory of products:
        ${JSON.stringify(productsSummary)}

        The user's query is: "${userMessage}"
        
        Previous chat history:
        ${formattedHistory}

        Instructions:
        1. Keep your reply conversational, highly helpful, and engaging.
        2. Analyze the user's budget (convert ₹ to USD if necessary, assume Indian Rupees ₹ is the default currency in product list prices, e.g. price 75000 means ₹75,000).
        3. Recommend matching products from the inventory list above. If exact matches don't exist, suggest the closest alternative from our inventory and justify why it is a good substitute.
        4. Do NOT make up products that are not in the inventory. If the inventory doesn't have what they want, politely say we don't have it and offer a close categories recommendation.
        5. You can answer general shopping questions, warranty explanations, comparison between two items, or buying guides.
        
        Return a JSON object in the following format:
        {
          "reply": "Your conversational text response to the user. Use markdown for lists and bolding.",
          "recommendedProductIds": ["productId1", "productId2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Gemini Chatbot API Error:', error.message);
    }
  }

  // MOCK Fallback Chatbot Logic
  console.log('Using Mock AI Chatbot response...');
  const msg = userMessage.toLowerCase();
  let reply = '';
  let recommendedProductIds = [];

  // Match items based on keywords
  if (msg.includes('laptop') || msg.includes('coding') || msg.includes('work')) {
    const laptops = availableProducts.filter(p => p.category.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('laptop'));
    if (laptops.length > 0) {
      reply = `I found some excellent laptop options in our store! Here are the best fits:\n\n` +
              laptops.map(l => `- **${l.name}** (${l.brand}): Price ₹${l.price.toLocaleString()} with rating ⭐${l.rating}`).join('\n') +
              `\n\nThese models are built for great multi-tasking, web development, and office usage. Let me know if you need specific details on any model!`;
      recommendedProductIds = laptops.map(l => l._id);
    } else {
      reply = `Laptops are currently out of stock. We have some other electronics that might interest you, or please check back in a few days!`;
    }
  } else if (msg.includes('shoes') || msg.includes('running') || msg.includes('walk') || msg.includes('sneaker')) {
    const shoes = availableProducts.filter(p => p.category.toLowerCase().includes('shoes') || p.name.toLowerCase().includes('shoes') || p.category.toLowerCase().includes('fashion'));
    if (shoes.length > 0) {
      reply = `Here are some high-quality shoes available in our catalog:\n\n` +
              shoes.map(s => `- **${s.name}** (${s.brand}): Price ₹${s.price.toLocaleString()} - ideal for running and athletic activities.`).join('\n') +
              `\n\nThey feature soft cushioning and durable grip. Would you like to add any of these to your wishlist?`;
      recommendedProductIds = shoes.map(s => s._id);
    } else {
      reply = `We currently do not have running shoes in stock. Check out our fashion category for other items!`;
    }
  } else if (msg.includes('budget') || msg.includes('under') || msg.includes('price')) {
    // Extract numbers from string
    const numbers = msg.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const maxBudget = parseInt(numbers[0]) * (msg.includes('k') ? 1000 : 1);
      const budgetProducts = availableProducts.filter(p => p.price <= maxBudget).slice(0, 3);
      if (budgetProducts.length > 0) {
        reply = `Here are some great options under ₹${maxBudget.toLocaleString()}:\n\n` +
                budgetProducts.map(p => `- **${p.name}** (₹${p.price.toLocaleString()}) - a budget-friendly option in the **${p.category}** category.`).join('\n') +
                `\n\nIs there a specific category or feature you are looking for within this price range?`;
        recommendedProductIds = budgetProducts.map(p => p._id);
      } else {
        reply = `We don't have any products under ₹${maxBudget.toLocaleString()} at the moment, but we have some options slightly above that range!`;
      }
    } else {
      reply = `Could you please specify your maximum budget? I can find products matching your preferred price limit.`;
    }
  } else {
    // Default helpful greeting
    reply = `Hello! I am your SmartShop AI Assistant. 🤖\n\nI can help you:\n1. Suggest the best laptops, shoes, headphones, or chairs for your needs.\n2. Find items within your budget.\n3. Compare products and explain features.\n\nTry asking me something like: *"Suggest a coding laptop"* or *"I need shoes for running under ₹5000"*!`;
    recommendedProductIds = availableProducts.slice(0, 2).map(p => p._id);
  }

  return {
    reply,
    recommendedProductIds,
    isMock: true
  };
};

/**
 * AI Visual Search helper
 * Analyzes image buffer/base64 to extract keywords, category, and visual description.
 */
export const getVisualSearchRecommendation = async (imageBuffer, mimeType, availableProducts = []) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const imagePart = {
        inlineData: {
          data: Buffer.from(imageBuffer).toString('base64'),
          mimeType
        }
      };

      const prompt = `
        You are SmartShop AI's visual product recognition engine.
        Analyze this image and identify:
        1. The type of product (e.g. laptop, running shoes, headphones, office chair).
        2. Its color, style, design pattern, and brand name if visible.
        3. 3-4 descriptive tags (e.g. sport, athletic, professional, sleek, wireless).
        
        Return ONLY a JSON response in the following format:
        {
          "detectedProduct": "Short product label (e.g., 'Red Sports Shoes')",
          "category": "One of: 'Laptops', 'Shoes', 'Headphones', 'Furniture', 'Electronics'",
          "tags": ["tag1", "tag2", "tag3"],
          "attributes": {
            "color": "dominant color",
            "style": "design style"
          }
        }
      `;

      const result = await model.generateContent([prompt, imagePart]);
      const textResponse = result.response.text();
      const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Match products in our database using categories and tags
      const matchedProductIds = availableProducts
        .filter(p => {
          const categoryMatch = p.category.toLowerCase() === parsed.category.toLowerCase();
          const tagMatch = parsed.tags.some(tag => 
            p.name.toLowerCase().includes(tag.toLowerCase()) || 
            p.description.toLowerCase().includes(tag.toLowerCase())
          );
          return categoryMatch || tagMatch;
        })
        .map(p => p._id);

      return {
        detectedProduct: parsed.detectedProduct,
        category: parsed.category,
        tags: parsed.tags,
        attributes: parsed.attributes,
        matchedProductIds
      };
    } catch (error) {
      console.error('Gemini Visual Search API Error:', error.message);
    }
  }

  // MOCK Fallback for Visual Search
  console.log('Using Mock Visual Search...');
  // Since we don't have visual capability without Gemini API, we match a random category for demo purposes
  const mockCategories = ['Shoes', 'Laptops', 'Headphones', 'Furniture'];
  const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
  
  const matchedProductIds = availableProducts
    .filter(p => p.category.toLowerCase() === randomCategory.toLowerCase())
    .slice(0, 3)
    .map(p => p._id);

  return {
    detectedProduct: `Visual Match in ${randomCategory}`,
    category: randomCategory,
    tags: ['similar-style', 'visually-matched'],
    attributes: { color: 'Various', style: 'Modern' },
    matchedProductIds,
    isMock: true
  };
};
