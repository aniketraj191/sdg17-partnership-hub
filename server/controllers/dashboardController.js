import Organization from '../models/Organization.js';
import Project from '../models/Project.js';
import Contribution from '../models/Contribution.js';
import Partnership from '../models/Partnership.js';

// @desc    Get aggregated stats for dashboard counters
// @route   GET /api/dashboard/stats
// @access  Public
export const getDashboardStats = async (req, res, next) => {
  try {
    // Run parallel aggregation pipelines
    const [
      totalOrgs,
      projectStatusCounts,
      contributionSummary,
      totalPartnerships,
    ] = await Promise.all([
      Organization.countDocuments(),
      Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Contribution.aggregate([
        {
          $match: { status: 'Confirmed' },
        },
        {
          $group: {
            _id: '$contributionType',
            totalAmount: { $sum: '$amount' },
            totalQuantity: { $sum: '$quantity' },
            count: { $sum: 1 },
          },
        },
      ]),
      Partnership.countDocuments(),
    ]);

    // Format project status breakdown
    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let plannedProjects = 0;

    projectStatusCounts.forEach((item) => {
      totalProjects += item.count;
      if (item._id === 'Active') activeProjects = item.count;
      if (item._id === 'Completed') completedProjects = item.count;
      if (item._id === 'Planned') plannedProjects = item.count;
    });

    // Format contribution breakdown (monetary vs non-monetary strictly separated)
    let totalMonetary = 0;
    let volunteerHours = 0;
    let equipmentCount = 0;
    let servicesCount = 0;

    contributionSummary.forEach((item) => {
      if (item._id === 'Monetary') totalMonetary = item.totalAmount;
      if (item._id === 'Volunteer Hours') volunteerHours = item.totalQuantity;
      if (item._id === 'Equipment') equipmentCount = item.totalQuantity;
      if (item._id === 'Services') servicesCount = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrganizations: totalOrgs,
        totalProjects,
        activeProjects,
        completedProjects,
        plannedProjects,
        totalPartnerships,
        contributions: {
          totalMonetaryConfirmed: totalMonetary,
          volunteerHours,
          equipmentCount,
          servicesCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get charts data for visual analytics (Recharts)
// @route   GET /api/dashboard/charts
// @access  Public
export const getDashboardCharts = async (req, res, next) => {
  try {
    const [
      projectStatusAgg,
      orgsByTypeAgg,
      topFundedProjectsAgg,
      recentProjects,
      recentContributions,
    ] = await Promise.all([
      // Status distribution
      Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      // Organizations by type
      Organization.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),
      // Contributions by project (Join Project & Contribution)
      Contribution.aggregate([
        { $match: { status: 'Confirmed', contributionType: 'Monetary' } },
        {
          $group: {
            _id: '$projectId',
            confirmedMonetary: { $sum: '$amount' },
          },
        },
        { $sort: { confirmedMonetary: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        {
          $project: {
            projectId: '$_id',
            title: '$project.title',
            fundingTarget: '$project.fundingTarget',
            budget: '$project.budget',
            confirmedMonetary: 1,
          },
        },
      ]),
      // Recent projects
      Project.find()
        .populate('organizationId', 'name type')
        .sort({ createdAt: -1 })
        .limit(5),
      // Recent confirmed contributions
      Contribution.find()
        .populate('projectId', 'title category')
        .sort({ contributionDate: -1 })
        .limit(6),
    ]);

    // Format status distribution for pie/bar chart
    const statusDistribution = [
      { name: 'Active', value: 0, fill: '#10b981' },
      { name: 'Planned', value: 0, fill: '#3b82f6' },
      { name: 'Completed', value: 0, fill: '#059669' },
    ];
    projectStatusAgg.forEach((item) => {
      const found = statusDistribution.find((s) => s.name === item._id);
      if (found) found.value = item.count;
    });

    // Format organization types
    const orgTypes = [
      { name: 'NGO', count: 0 },
      { name: 'Company', count: 0 },
      { name: 'Government', count: 0 },
      { name: 'Community', count: 0 },
    ];
    orgsByTypeAgg.forEach((item) => {
      const found = orgTypes.find((t) => t.name === item._id);
      if (found) found.count = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        statusDistribution,
        organizationsByType: orgTypes,
        contributionsByProject: topFundedProjectsAgg,
        recentProjects,
        recentContributions,
      },
    });
  } catch (error) {
    next(error);
  }
};
