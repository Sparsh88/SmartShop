import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { uploadImage } from '../config/cloudinary.js';
import { aiSmartSearch, getVisualSearchRecommendation } from '../config/gemini.js';

// Get products with filters, sorting, and pagination
export const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      rating, 
      inStock, 
      sort, 
      search, 
      page = 1, 
      limit = 12 
    } = req.query;

    const queryObj = {};

    // Standard filters
    if (category) queryObj.category = category;
    if (brand) queryObj.brand = brand;
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = Number(minPrice);
      if (maxPrice) queryObj.price.$lte = Number(maxPrice);
    }
    if (rating) {
      queryObj.rating = { $gte: Number(rating) };
    }
    if (inStock === 'true') {
      queryObj.stock = { $gt: 0 };
    }

    // Text search if provided
    if (search) {
      queryObj.$text = { $search: search };
    }

    // Sorting
    let sortObj = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortObj = { price: 1 };
          break;
        case 'price_desc':
          sortObj = { price: -1 };
          break;
        case 'newest':
          sortObj = { createdAt: -1 };
          break;
        case 'popularity':
          sortObj = { viewsCount: -1 };
          break;
        case 'rating':
          sortObj = { rating: -1 };
          break;
        default:
          sortObj = { createdAt: -1 };
      }
    } else {
      sortObj = { createdAt: -1 }; // default sorting
    }

    // Perform query
    const skip = (Number(page) - 1) * Number(limit);
    let products = await Product.find(queryObj)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(queryObj);

    // AI Smart Search fallback if search term yielded 0 results
    let isAiRouted = false;
    let aiExplanation = '';
    
    if (search && products.length === 0) {
      console.log(`Standard search returned 0 results for: "${search}". Routing to Gemini Smart Search...`);
      const allProducts = await Product.find({}).select('name category brand price description');
      const allCategories = await Category.find({});

      const aiResponse = await aiSmartSearch(search, allProducts, allCategories);
      
      if (aiResponse && (aiResponse.mappedCategories?.length > 0 || aiResponse.matchedProductIds?.length > 0)) {
        isAiRouted = true;
        aiExplanation = aiResponse.explanation;

        // Perform fallback DB query using AI suggestions
        const fallbackQuery = {
          $or: [
            { _id: { $in: aiResponse.matchedProductIds } },
            { category: { $in: aiResponse.mappedCategories } }
          ]
        };

        products = await Product.find(fallbackQuery).limit(Number(limit));
      }
    }

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      total,
      isAiRouted,
      aiExplanation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product details by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewsCount = (product.viewsCount || 0) + 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a Product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, brand, stock, specs, isTrending, isDeal, isFlashSale, flashSaleEnd } = req.body;

    const parsedSpecs = specs ? (typeof specs === 'string' ? JSON.parse(specs) : specs) : [];
    
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file, 'smartshop_products');
        imageUrls.push(url);
      }
    } else {
      imageUrls.push('/uploads/default-product.svg'); // placeholder if no image uploaded
    }

    const priceNum = Number(price);
    const origPriceNum = Number(originalPrice);
    const discount = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    const product = new Product({
      name,
      description,
      price: priceNum,
      originalPrice: origPriceNum,
      discount,
      category,
      brand,
      stock: Number(stock),
      images: imageUrls,
      specs: parsedSpecs,
      isTrending: isTrending === 'true' || isTrending === true,
      isDeal: isDeal === 'true' || isDeal === true,
      isFlashSale: isFlashSale === 'true' || isFlashSale === true,
      flashSaleEnd: flashSaleEnd ? new Date(flashSaleEnd) : undefined
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, originalPrice, category, brand, stock, specs, isTrending, isDeal, isFlashSale, flashSaleEnd } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.isTrending = isTrending !== undefined ? (isTrending === 'true' || isTrending === true) : product.isTrending;
    product.isDeal = isDeal !== undefined ? (isDeal === 'true' || isDeal === true) : product.isDeal;
    product.isFlashSale = isFlashSale !== undefined ? (isFlashSale === 'true' || isFlashSale === true) : product.isFlashSale;
    if (flashSaleEnd) product.flashSaleEnd = new Date(flashSaleEnd);

    if (price || originalPrice) {
      const priceNum = price ? Number(price) : product.price;
      const origPriceNum = originalPrice ? Number(originalPrice) : product.originalPrice;
      product.price = priceNum;
      product.originalPrice = origPriceNum;
      product.discount = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;
    }

    if (specs) {
      product.specs = typeof specs === 'string' ? JSON.parse(specs) : specs;
    }

    // Handle new image additions
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const url = await uploadImage(file, 'smartshop_products');
        imageUrls.push(url);
      }
      product.images = imageUrls; // replace images
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit a Review (Customer only)
export const createProductReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: product._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by you' });
    }

    const review = new Review({
      user: req.user._id,
      userName: req.user.name,
      product: product._id,
      rating: Number(rating),
      title,
      comment
    });

    await review.save();

    // Recalculate ratings
    const reviews = await Review.find({ product: product._id });
    product.reviewsCount = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    // Recalculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(rev => {
      const roundedRating = Math.round(rev.rating);
      if (distribution[roundedRating] !== undefined) {
        distribution[roundedRating]++;
      }
    });
    product.ratingDistribution = distribution;

    await product.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// AI Visual Image Search Products
export const visualSearchProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const allProducts = await Product.find({}).select('name category brand price description');
    
    // Call Gemini API to extract details from the image and map to DB
    const searchResult = await getVisualSearchRecommendation(
      req.file.buffer,
      req.file.mimetype,
      allProducts
    );

    // Fetch full product details for the visual matches
    const matchedProducts = await Product.find({
      _id: { $in: searchResult.matchedProductIds }
    });

    res.json({
      detectedProduct: searchResult.detectedProduct,
      category: searchResult.category,
      tags: searchResult.tags,
      attributes: searchResult.attributes,
      products: matchedProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
