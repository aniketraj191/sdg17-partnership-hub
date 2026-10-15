import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required for recording contribution'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    contributorName: {
      type: String,
      required: [true, 'Contributor or organization name is required'],
      trim: true,
      maxlength: [150, 'Contributor name cannot exceed 150 characters'],
    },
    contributorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contributionType: {
      type: String,
      required: [true, 'Contribution type is required'],
      enum: {
        values: ['Monetary', 'Equipment', 'Volunteer Hours', 'Services'],
        message: '{VALUE} is not a valid contribution type',
      },
    },
    amount: {
      type: Number,
      min: [0, 'Monetary amount must be greater than or equal to 0'],
      validate: {
        validator: function (v) {
          if (this.contributionType === 'Monetary') {
            return typeof v === 'number' && v > 0;
          }
          return true;
        },
        message: 'A positive monetary amount is required for Monetary contributions',
      },
      default: 0,
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity must be greater than or equal to 0'],
      validate: {
        validator: function (v) {
          if (this.contributionType !== 'Monetary') {
            return typeof v === 'number' && v > 0;
          }
          return true;
        },
        message: 'A positive quantity is required for non-monetary contributions',
      },
      default: 0,
    },
    unit: {
      type: String,
      trim: true,
      default: function () {
        if (this.contributionType === 'Monetary') return 'USD';
        if (this.contributionType === 'Volunteer Hours') return 'Hours';
        return 'Items';
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Rejected'],
        message: '{VALUE} is not a valid contribution status',
      },
      default: 'Pending',
    },
    contributionDate: {
      type: Date,
      default: Date.now,
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

// Indexes
contributionSchema.index({ projectId: 1, status: 1, contributionType: 1 });
contributionSchema.index({ organizationId: 1 });

const Contribution = mongoose.model('Contribution', contributionSchema);
export default Contribution;
