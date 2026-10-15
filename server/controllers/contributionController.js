import Contribution from '../models/Contribution.js';
import Project from '../models/Project.js';
import Organization from '../models/Organization.js';

// @desc    Get all contributions with filters and breakdown statistics
// @route   GET /api/contributions
// @access  Public
export const getContributions = async (req, res, next) => {
  try {
    const {
      projectId,
      contributionType,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (projectId) query.projectId = projectId;
    if (contributionType && contributionType !== 'All') query.contributionType = contributionType;
    if (status && status !== 'All') query.status = status;

    if (search && search.trim() !== '') {
      query.$or = [
        { contributorName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Contribution.countDocuments(query);
    const contributions = await Contribution.find(query)
      .populate('projectId', 'title category fundingTarget status')
      .populate('organizationId', 'name type')
      .sort({ contributionDate: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute verified totals using aggregation (single source of truth)
    const summaryAgg = await Contribution.aggregate([
      { $match: { status: 'Confirmed' } },
      {
        $group: {
          _id: '$contributionType',
          totalAmount: { $sum: '$amount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalMonetaryConfirmed = 0;
    let totalVolunteerHours = 0;
    let totalEquipmentUnits = 0;
    let totalServicesCount = 0;

    summaryAgg.forEach((item) => {
      if (item._id === 'Monetary') totalMonetaryConfirmed = item.totalAmount;
      if (item._id === 'Volunteer Hours') totalVolunteerHours = item.totalQuantity;
      if (item._id === 'Equipment') totalEquipmentUnits = item.totalQuantity;
      if (item._id === 'Services') totalServicesCount = item.count;
    });

    res.status(200).json({
      success: true,
      count: contributions.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      summary: {
        totalMonetaryConfirmed,
        totalVolunteerHours,
        totalEquipmentUnits,
        totalServicesCount,
      },
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contribution
// @route   GET /api/contributions/:id
// @access  Public
export const getContributionById = async (req, res, next) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate('projectId', 'title category fundingTarget budget')
      .populate('organizationId', 'name type');

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution record not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record new contribution
// @route   POST /api/contributions
// @access  Public (Guest/User) or Private
export const createContribution = async (req, res, next) => {
  try {
    const {
      projectId,
      organizationId,
      contributorName,
      contributorEmail,
      contributionType,
      amount,
      quantity,
      unit,
      description,
      status,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found.',
      });
    }

    // Validation according to contribution type
    if (contributionType === 'Monetary') {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Monetary contributions must include an amount greater than 0.',
        });
      }
    } else {
      const numQuantity = Number(quantity);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Non-monetary contribution '${contributionType}' requires a quantity greater than 0.`,
        });
      }
    }

    // If authenticated user is admin or project owner, they can confirm immediately, otherwise default to Pending
    let finalStatus = 'Pending';
    if (req.user) {
      const hostOrg = await Organization.findById(project.organizationId);
      if (req.user.role === 'admin' || (hostOrg && hostOrg.ownerId.toString() === req.user._id.toString())) {
        finalStatus = status || 'Confirmed';
      }
    }

    const contribution = await Contribution.create({
      projectId,
      organizationId: organizationId || null,
      contributorName,
      contributorEmail,
      contributionType,
      amount: contributionType === 'Monetary' ? Number(amount) : 0,
      quantity: contributionType !== 'Monetary' ? Number(quantity) : 0,
      unit: unit || (contributionType === 'Monetary' ? 'USD' : contributionType === 'Volunteer Hours' ? 'Hours' : 'Units'),
      description,
      status: finalStatus,
      contributionDate: new Date(),
    });

    const populated = await Contribution.findById(contribution._id)
      .populate('projectId', 'title category')
      .populate('organizationId', 'name type');

    res.status(201).json({
      success: true,
      message: finalStatus === 'Confirmed' ? 'Contribution confirmed and recorded.' : 'Contribution submitted for verification.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contribution (e.g. verify/confirm or edit)
// @route   PUT /api/contributions/:id
// @access  Private (Org Owner or Admin)
export const updateContribution = async (req, res, next) => {
  try {
    let contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found.',
      });
    }

    const project = await Project.findById(contribution.projectId);
    const hostOrg = project ? await Organization.findById(project.organizationId) : null;

    if (req.user.role !== 'admin' && (!hostOrg || hostOrg.ownerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Only the project host organization or an admin can verify or modify contribution records.',
      });
    }

    contribution = await Contribution.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('projectId', 'title category');

    res.status(200).json({
      success: true,
      message: 'Contribution record updated successfully.',
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contribution
// @route   DELETE /api/contributions/:id
// @access  Private (Org Owner or Admin)
export const deleteContribution = async (req, res, next) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found.',
      });
    }

    const project = await Project.findById(contribution.projectId);
    const hostOrg = project ? await Organization.findById(project.organizationId) : null;

    if (req.user.role !== 'admin' && (!hostOrg || hostOrg.ownerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Only the project host organization or an admin can delete contribution records.',
      });
    }

    await Contribution.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Contribution record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
