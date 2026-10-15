import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [150, 'Organization name cannot exceed 150 characters'],
    },
    type: {
      type: String,
      required: [true, 'Organization type is required'],
      enum: {
        values: ['NGO', 'Company', 'Government', 'Community'],
        message: '{VALUE} is not a valid organization type',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    contributionAreas: {
      type: [String],
      required: [true, 'At least one contribution area is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Please provide at least one contribution area',
      },
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid contact email',
      ],
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organization owner is required'],
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

// Indexes for fast lookup, filtering and search
organizationSchema.index({ name: 'text', description: 'text', city: 'text', country: 'text' });
organizationSchema.index({ type: 1, country: 1 });
organizationSchema.index({ ownerId: 1 });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
