import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import { uploadImage } from '../config/cloudinary.js';

// Categories Controllers
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    let imageUrl = '/uploads/default-category.svg';

    if (req.file) {
      imageUrl = await uploadImage(req.file, 'smartshop_categories');
    }

    const category = new Category({
      name,
      description,
      image: imageUrl
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Banners Controllers (combined for convenience)
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ active: true });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, description, link, type } = req.body;
    let imageUrl = '/uploads/default-banner.svg';

    if (req.file) {
      imageUrl = await uploadImage(req.file, 'smartshop_banners');
    }

    const banner = new Banner({
      title,
      description,
      image: imageUrl,
      link,
      type
    });

    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
