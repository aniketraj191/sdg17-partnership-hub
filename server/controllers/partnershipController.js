import Partnership from '../models/Partnership.js';
import Project from '../models/Project.js';
import Organization from '../models/Organization.js';

// @desc    Get all partnerships with optional filters
// @route   GET /api/partnerships
// @access  Public
export const getPartnerships = async (req, res, next) => {
  try {
    const { projectId, organizationId, status } = req.query;
    const query = {};

    if (projectId) query.projectId = projectId;
    if (organizationId) query.organizationId = organizationId;
    if (status && status !== 'All') query.status = status;

    const partnerships = await Partnership.find(query)
      .populate('projectId', 'title category status location budget fundingTarget')
      .populate('organizationId', 'name type city country contactEmail')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: partnerships.length,
      data: partnerships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single partnership request by ID
// @route   GET /api/partnerships/:id
// @access  Public
export const getPartnershipById = async (req, res, next) => {
  try {
    const partnership = await Partnership.findById(req.params.id)
      .populate('projectId', 'title category status location budget fundingTarget')
      .populate('organizationId', 'name type city country contactEmail website')
      .populate('requestedBy', 'name email');

    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: partnership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit partnership request / express interest
// @route   POST /api/partnerships
// @access  Private
export const createPartnership = async (req, res, next) => {
  try {
    const { projectId, organizationId, message, supportTypes } = req.body;

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Target project not found.',
      });
    }

    // Check organization exists
    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Collaborating organization not found.',
      });
    }

    // Prevent project owner from partnering with their own project
    if (project.organizationId.toString() === organizationId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'An organization cannot create a partnership proposal with its own project.',
      });
    }

    const partnership = await Partnership.create({
      projectId,
      organizationId,
      requestedBy: req.user._id,
      message,
      supportTypes: Array.isArray(supportTypes) ? supportTypes : [supportTypes],
      status: 'Pending',
    });

    const populated = await Partnership.findById(partnership._id)
      .populate('projectId', 'title category')
      .populate('organizationId', 'name type city country');

    res.status(201).json({
      success: true,
      message: 'Partnership expression of interest submitted successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update partnership status (Accept / Reject)
// @route   PATCH /api/partnerships/:id/status
// @access  Private (Project Owner or Admin)
export const updatePartnershipStatus = async (req, res, next) => {
  try {
    const { status, responseNotes } = req.body;

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Pending', 'Accepted', or 'Rejected'.",
      });
    }

    const partnership = await Partnership.findById(req.params.id).populate('projectId');

    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found.',
      });
    }

    const project = await Project.findById(partnership.projectId._id || partnership.projectId);
    const hostOrg = await Organization.findById(project.organizationId);

    // Only host organization owner or admin can accept/reject
    if (req.user.role !== 'admin' && (!hostOrg || hostOrg.ownerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Only the project hosting organization or an administrator can update partnership status.',
      });
    }

    partnership.status = status;
    if (responseNotes !== undefined) partnership.responseNotes = responseNotes;
    await partnership.save();

    res.status(200).json({
      success: true,
      message: `Partnership request marked as ${status}.`,
      data: partnership,
    });
  } catch (error) {
    next(error);
  }
};
