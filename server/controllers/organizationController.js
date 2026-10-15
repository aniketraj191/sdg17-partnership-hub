import Organization from '../models/Organization.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get all organizations with search, filters and pagination
// @route   GET /api/organizations
// @access  Public
export const getOrganizations = async (req, res, next) => {
  try {
    const { search, type, country, area, page = 1, limit = 9 } = req.query;

    const query = {};

    // Filter by type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by country
    if (country && country !== 'All') {
      query.country = new RegExp(`^${country}$`, 'i');
    }

    // Filter by contribution area
    if (area && area !== 'All') {
      query.contributionAreas = area;
    }

    // Search query across name, description, city, country
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } },
        { country: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Organization.countDocuments(query);
    const organizations = await Organization.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute active project counts for each organization
    const orgIds = organizations.map((o) => o._id);
    const projectCounts = await Project.aggregate([
      { $match: { organizationId: { $in: orgIds } } },
      { $group: { _id: '$organizationId', totalProjects: { $sum: 1 }, activeProjects: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } } } },
    ]);

    const countMap = {};
    projectCounts.forEach((c) => {
      countMap[c._id.toString()] = c;
    });

    const enrichedOrgs = organizations.map((org) => {
      const counts = countMap[org._id.toString()] || { totalProjects: 0, activeProjects: 0 };
      return {
        ...org.toObject(),
        totalProjects: counts.totalProjects,
        activeProjects: counts.activeProjects,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedOrgs.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: enrichedOrgs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization by ID
// @route   GET /api/organizations/:id
// @access  Public
export const getOrganizationById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id).populate('ownerId', 'name email');

    if (!org) {
      return res.status(404).json({
        success: false,
        message: `Organization not found with id: ${req.params.id}`,
      });
    }

    // Find projects under this organization
    const projects = await Project.find({ organizationId: org._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...org.toObject(),
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private
export const createOrganization = async (req, res, next) => {
  try {
    const { name, type, description, city, country, contributionAreas, contactEmail, website } = req.body;

    // Check duplicate name
    const existing = await Organization.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An organization with this name already exists.',
      });
    }

    const org = await Organization.create({
      name,
      type,
      description,
      city,
      country,
      contributionAreas: Array.isArray(contributionAreas) ? contributionAreas : [contributionAreas],
      contactEmail,
      website: website || '',
      ownerId: req.user._id,
    });

    // Update user's organizationId if not set
    await User.findByIdAndUpdate(req.user._id, {
      organizationId: org._id,
      role: req.user.role === 'admin' ? 'admin' : 'org_admin',
    });

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully.',
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Owner or Admin)
export const updateOrganization = async (req, res, next) => {
  try {
    let org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && org.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this organization.',
      });
    }

    org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully.',
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Owner or Admin)
export const deleteOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && org.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this organization.',
      });
    }

    await Organization.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
