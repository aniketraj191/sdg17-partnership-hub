import mongoose from 'mongoose';

const partnershipSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required for partnership request'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Requesting organization is required'],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: [true, 'Partnership proposal message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    supportTypes: {
      type: [String],
      required: [true, 'Please specify at least one support type'],
      enum: ['Funding', 'Volunteers', 'Technology', 'Equipment', 'Expertise'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one support type must be selected',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Accepted', 'Rejected'],
        message: '{VALUE} is not a valid partnership status',
      },
      default: 'Pending',
    },
    responseNotes: {
      type: String,
      trim: true,
      default: '',
    },
    isSampleData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find requests by project or organization
partnershipSchema.index({ projectId: 1, organizationId: 1 });
partnershipSchema.index({ status: 1 });

const Partnership = mongoose.model('Partnership', partnershipSchema);
export default Partnership;
