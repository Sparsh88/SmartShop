import Product from '../models/Product.js';
import { getChatbotResponse } from '../config/gemini.js';

export const handleAssistantChat = async (req, res) => {
  const { message, history } = req.body;

  try {
    // Fetch all products (limit fields for token optimization)
    const availableProducts = await Product.find({}).select(
      'name price category brand rating stock description images'
    );

    const result = await getChatbotResponse(history || [], message, availableProducts);

    // Populate recommended product items from the DB matching the IDs returned by Gemini
    let recommendedProducts = [];
    if (result.recommendedProductIds && result.recommendedProductIds.length > 0) {
      recommendedProducts = await Product.find({
        _id: { $in: result.recommendedProductIds }
      });
    }

    res.json({
      reply: result.reply,
      recommendedProducts,
      isMock: result.isMock || false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
