import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    sdgNumber: {
      type: Number,
      required: [true, 'SDG number is required'],
      default: 17,
      min: [1, 'SDG number must be between 1 and 17'],
      max: [17, 'SDG number must be between 1 and 17'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Education',
          'Climate Action',
          'Healthcare',
          'Clean Energy',
          'Food Security',
          'Water & Sanitation',
          'Economic Growth',
          'Partnerships for the Goals',
        ],
        message: '{VALUE} is not an accepted SDG category',
      },
    },
    location: {
      type: String,
      required: [true, 'Project location is required'],
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required for project'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be greater than or equal to 0'],
    },
    fundingTarget: {
      type: Number,
      required: [true, 'Funding target is required'],
      min: [0, 'Funding target must be greater than or equal to 0'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v || !this.startDate) return true;
          return new Date(v) >= new Date(this.startDate);
        },
        message: 'End date must be greater than or equal to start date',
      },
    },
    status: {
      type: String,
      required: [true, 'Project status is required'],
      enum: {
        values: ['Planned', 'Active', 'Completed'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'Planned',
    },
    requiredSupportTypes: {
      type: [String],
      enum: ['Funding', 'Volunteers', 'Technology', 'Equipment', 'Expertise'],
      default: ['Funding', 'Volunteers'],
    },
    isSampleData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
projectSchema.index({ title: 'text', description: 'text', location: 'text' });
projectSchema.index({ organizationId: 1, status: 1 });
projectSchema.index({ category: 1, sdgNumber: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
