import Project from '../models/Project.js';
import Organization from '../models/Organization.js';
import Contribution from '../models/Contribution.js';

// Helper to compute funding metrics for a project list or single project
const attachFundingMetrics = async (projects) => {
  if (!projects || projects.length === 0) return [];

  const projectIds = projects.map((p) => p._id);

  // Aggregate confirmed monetary contributions
  const monetaryStats = await Contribution.aggregate([
    {
      $match: {
        projectId: { $in: projectIds },
        status: 'Confirmed',
        contributionType: 'Monetary',
      },
    },
    {
      $group: {
        _id: '$projectId',
        totalMonetary: { $sum: '$amount' },
        contributionCount: { $sum: 1 },
      },
    },
  ]);

  const map = {};
  monetaryStats.forEach((stat) => {
    map[stat._id.toString()] = stat;
  });

  return projects.map((project) => {
    const pObj = project.toObject ? project.toObject() : project;
    const stat = map[pObj._id.toString()] || { totalMonetary: 0, contributionCount: 0 };
    const recordedContributions = stat.totalMonetary;
    const fundingTarget = pObj.fundingTarget || 0;
    const fundingProgress = fundingTarget > 0 ? Math.min(100, Math.round((recordedContributions / fundingTarget) * 100)) : 0;
    const remainingFunding = Math.max(0, fundingTarget - recordedContributions);

    return {
      ...pObj,
      recordedContributions,
      contributionCount: stat.contributionCount,
      fundingProgress,
      remainingFunding,
    };
  });
};

// @desc    Get all projects with filters, search, sorting and pagination
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      location,
      organizationId,
      sdgNumber,
      sortBy = 'newest',
      page = 1,
      limit = 9,
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (sdgNumber && !isNaN(sdgNumber)) {
      query.sdgNumber = parseInt(sdgNumber, 10);
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (organizationId) {
      query.organizationId = organizationId;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    if (sortBy === 'budget-asc') sortOptions = { budget: 1 };
    if (sortBy === 'budget-desc') sortOptions = { budget: -1 };
    if (sortBy === 'target-desc') sortOptions = { fundingTarget: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Project.countDocuments(query);
    const rawProjects = await Project.find(query)
      .populate('organizationId', 'name type city country contactEmail')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    let projects = await attachFundingMetrics(rawProjects);

    // If sorting by funding progress
    if (sortBy === 'funding-progress') {
      projects.sort((a, b) => b.fundingProgress - a.fundingProgress);
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with full details & contribution metrics
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'organizationId',
      'name type description city country contactEmail website ownerId'
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id: ${req.params.id}`,
      });
    }

    // Get all contributions for this project
    const contributions = await Contribution.find({ projectId: project._id })
      .populate('organizationId', 'name type')
      .sort({ contributionDate: -1 });

    // Calculate verified breakdown
    let totalMonetary = 0;
    let totalVolunteerHours = 0;
    let totalEquipmentItems = 0;

    contributions.forEach((c) => {
      if (c.status === 'Confirmed') {
        if (c.contributionType === 'Monetary') totalMonetary += c.amount || 0;
        if (c.contributionType === 'Volunteer Hours') totalVolunteerHours += c.quantity || 0;
        if (c.contributionType === 'Equipment') totalEquipmentItems += c.quantity || 0;
      }
    });

    const fundingTarget = project.fundingTarget || 0;
    const fundingProgress = fundingTarget > 0 ? Math.min(100, Math.round((totalMonetary / fundingTarget) * 100)) : 0;
    const remainingFunding = Math.max(0, fundingTarget - totalMonetary);

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        recordedContributions: totalMonetary,
        totalVolunteerHours,
        totalEquipmentItems,
        fundingProgress,
        remainingFunding,
        contributions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Org Owner or Admin)
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      sdgNumber = 17,
      category,
      location,
      organizationId,
      budget,
      fundingTarget,
      startDate,
      endDate,
      status = 'Planned',
      requiredSupportTypes,
    } = req.body;

    // Verify organization exists
    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Specified organization does not exist.',
      });
    }

    // Check authorization: must be admin or the owner of the organization
    if (req.user.role !== 'admin' && org.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to create projects for your own registered organization.',
      });
    }

    // Validate budget & funding target
    const numBudget = Number(budget);
    const numTarget = Number(fundingTarget);
    if (isNaN(numBudget) || numBudget < 0 || isNaN(numTarget) || numTarget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget and funding target must be valid numbers greater than or equal to 0.',
      });
    }

    // Validate dates
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const project = await Project.create({
      title,
      description,
      sdgNumber: Number(sdgNumber),
      category,
      location,
      organizationId,
      budget: numBudget,
      fundingTarget: numTarget,
      startDate,
      endDate: endDate || null,
      status,
      requiredSupportTypes: requiredSupportTypes || ['Funding', 'Volunteers'],
    });

    const populatedProject = await Project.findById(project._id).populate('organizationId', 'name type city country');

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Org Owner or Admin)
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const org = await Organization.findById(project.organizationId);

    // Check authorization
    if (req.user.role !== 'admin' && (!org || org.ownerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this project.',
      });
    }

    // Validate dates if modified
    const startDate = req.body.startDate || project.startDate;
    const endDate = req.body.endDate !== undefined ? req.body.endDate : project.endDate;
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('organizationId', 'name type city country');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Org Owner or Admin)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const org = await Organization.findById(project.organizationId);

    if (req.user.role !== 'admin' && (!org || org.ownerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this project.',
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    // Clean up related contributions & partnerships
    await Contribution.deleteMany({ projectId: project._id });

    res.status(200).json({
      success: true,
      message: 'Project and associated records deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
