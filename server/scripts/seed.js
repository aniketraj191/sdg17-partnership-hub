import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Project from '../models/Project.js';
import Partnership from '../models/Partnership.js';
import Contribution from '../models/Contribution.js';
import ContactMessage from '../models/ContactMessage.js';

export const seedDatabase = async (autoDisconnect = false) => {
  try {
    console.log('--- Starting SDG 17 Partnership Hub Database Seed ---');

    // Clean previous sample data
    console.log('Purging existing demonstration records...');
    await User.deleteMany({ email: { $regex: /@sdg17hub\.demo$/i } });
    await Organization.deleteMany({ isSampleData: true });
    await Project.deleteMany({ isSampleData: true });
    await Partnership.deleteMany({ isSampleData: true });
    await Contribution.deleteMany({ isSampleData: true });
    await ContactMessage.deleteMany({ email: { $regex: /@sdg17hub\.demo$/i } });

    // 1. Create Demonstration Users
    console.log('Creating demo users...');
    const hashedAdminPassword = await User.hashPassword('Admin@123456');
    const hashedPartnerPassword = await User.hashPassword('Partner@123456');

    const adminUser = await User.create({
      name: 'SDG Hub Administrator',
      email: 'admin@sdg17hub.demo',
      passwordHash: hashedAdminPassword,
      role: 'admin',
    });

    const orgUser1 = await User.create({
      name: 'Elena Rostova (Green Earth)',
      email: 'greenearth@sdg17hub.demo',
      passwordHash: hashedPartnerPassword,
      role: 'org_admin',
    });

    const orgUser2 = await User.create({
      name: 'Dr. Tariq Al-Mansoor (Digital Learning)',
      email: 'edulearn@sdg17hub.demo',
      passwordHash: hashedPartnerPassword,
      role: 'org_admin',
    });

    const orgUser3 = await User.create({
      name: 'Amara Okafor (Community Food Support)',
      email: 'foodsupport@sdg17hub.demo',
      passwordHash: hashedPartnerPassword,
      role: 'org_admin',
    });

    const orgUser4 = await User.create({
      name: 'Liam Chen (Clean Energy Alliance)',
      email: 'cleanpower@sdg17hub.demo',
      passwordHash: hashedPartnerPassword,
      role: 'org_admin',
    });

    // 2. Create Organizations
    console.log('Creating demo organizations...');
    const orgs = await Organization.create([
      {
        name: 'Green Earth NGO (Sample)',
        type: 'NGO',
        description:
          'Dedicated to grassroots reforestation, climate resilience training, and community-led mangrove conservation across vulnerable coastal regions.',
        city: 'Nairobi',
        country: 'Kenya',
        contributionAreas: ['Climate Action', 'Water & Sanitation', 'Partnerships for the Goals'],
        contactEmail: 'contact@greenearth.sdg17hub.demo',
        website: 'https://greenearth.example.org',
        ownerId: orgUser1._id,
        isSampleData: true,
      },
      {
        name: 'Digital Learning Initiative (Sample)',
        type: 'NGO',
        description:
          'Empowering underserved rural youth with open-source STEM curriculum, offline digital learning kits, and teacher mentorship programs.',
        city: 'Amman',
        country: 'Jordan',
        contributionAreas: ['Education', 'Partnerships for the Goals'],
        contactEmail: 'info@digitallearning.sdg17hub.demo',
        website: 'https://digitallearning.example.org',
        ownerId: orgUser2._id,
        isSampleData: true,
      },
      {
        name: 'Community Food Support Network (Sample)',
        type: 'Community',
        description:
          'Mobilizing urban gardens, surplus food redistribution hubs, and nutritional security workshops for marginalized communities.',
        city: 'São Paulo',
        country: 'Brazil',
        contributionAreas: ['Food Security', 'Healthcare'],
        contactEmail: 'connect@foodsupport.sdg17hub.demo',
        website: 'https://communityfood.example.org',
        ownerId: orgUser3._id,
        isSampleData: true,
      },
      {
        name: 'Clean Energy for Communities (Sample)',
        type: 'Company',
        description:
          'A sustainable social enterprise deploying off-grid solar micro-grids and community battery banks to rural clinics and schools.',
        city: 'Manila',
        country: 'Philippines',
        contributionAreas: ['Clean Energy', 'Economic Growth', 'Climate Action'],
        contactEmail: 'partners@cleanenergy.sdg17hub.demo',
        website: 'https://cleanenergy.example.org',
        ownerId: orgUser4._id,
        isSampleData: true,
      },
      {
        name: 'Municipal Sustainability Department (Sample)',
        type: 'Government',
        description:
          'Public agency coordinating inter-sectoral climate adaptation plans, eco-zoning, and municipal solar integration policies.',
        city: 'Rotterdam',
        country: 'Netherlands',
        contributionAreas: ['Climate Action', 'Clean Energy', 'Partnerships for the Goals'],
        contactEmail: 'sustainability@rotterdam.sdg17hub.demo',
        website: 'https://rotterdam-sustainability.example.gov',
        ownerId: adminUser._id,
        isSampleData: true,
      },
    ]);

    // Link organizations to user records
    await User.findByIdAndUpdate(orgUser1._id, { organizationId: orgs[0]._id });
    await User.findByIdAndUpdate(orgUser2._id, { organizationId: orgs[1]._id });
    await User.findByIdAndUpdate(orgUser3._id, { organizationId: orgs[2]._id });
    await User.findByIdAndUpdate(orgUser4._id, { organizationId: orgs[3]._id });

    // 3. Create Sample Projects
    console.log('Creating demo projects...');
    const projects = await Project.create([
      {
        title: 'Coastal Mangrove Restoration & Climate Buffer (Sample)',
        description:
          'Collaborative multi-stakeholder project to plant 150,000 native mangrove saplings, protect coastal fishing communities from tidal surge erosion, and train 400 local climate ambassadors.',
        sdgNumber: 13,
        category: 'Climate Action',
        location: 'Mombasa Coastal Zone, Kenya',
        organizationId: orgs[0]._id,
        budget: 65000,
        fundingTarget: 50000,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-12-15'),
        status: 'Active',
        requiredSupportTypes: ['Funding', 'Volunteers', 'Equipment'],
        isSampleData: true,
      },
      {
        title: 'Solar Power for Remote Rural Health Clinics (Sample)',
        description:
          'Installing 25 standalone solar photovoltaic systems with battery storage for primary medical clinics to power vaccine refrigeration, maternal care units, and emergency medical devices 24/7.',
        sdgNumber: 7,
        category: 'Clean Energy',
        location: 'Palawan & Visayas, Philippines',
        organizationId: orgs[3]._id,
        budget: 95000,
        fundingTarget: 80000,
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-11-30'),
        status: 'Active',
        requiredSupportTypes: ['Funding', 'Equipment', 'Expertise'],
        isSampleData: true,
      },
      {
        title: 'Open STEM Hubs for Rural Classrooms (Sample)',
        description:
          'Equipping 30 public schools with portable offline computer labs, solar chargers, and digital STEM science modules translated into regional dialects.',
        sdgNumber: 4,
        category: 'Education',
        location: 'Zarqa & Mafraq, Jordan',
        organizationId: orgs[1]._id,
        budget: 45000,
        fundingTarget: 35000,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-10-30'),
        status: 'Active',
        requiredSupportTypes: ['Technology', 'Funding', 'Volunteers'],
        isSampleData: true,
      },
      {
        title: 'Community Food Forest & Agroecology Network (Sample)',
        description:
          'Transforming vacant peri-urban parcels into regenerative agroforestry food gardens providing fresh organic produce to 1,200 food-insecure families.',
        sdgNumber: 2,
        category: 'Food Security',
        location: 'East Zone, São Paulo, Brazil',
        organizationId: orgs[2]._id,
        budget: 32000,
        fundingTarget: 28000,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        status: 'Completed',
        requiredSupportTypes: ['Volunteers', 'Equipment', 'Funding'],
        isSampleData: true,
      },
      {
        title: 'Inter-Municipal Green Hydrogen Feasibility Taskforce (Sample)',
        description:
          'A cross-border policy and engineering collaboration evaluating port-city logistics for zero-carbon hydrogen freight logistics corridors.',
        sdgNumber: 17,
        category: 'Partnerships for the Goals',
        location: 'Rotterdam - Antwerp Corridor',
        organizationId: orgs[4]._id,
        budget: 120000,
        fundingTarget: 100000,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        status: 'Planned',
        requiredSupportTypes: ['Expertise', 'Technology', 'Funding'],
        isSampleData: true,
      },
    ]);

    // 4. Create Sample Partnerships (Collaborations)
    console.log('Creating demo partnerships...');
    await Partnership.create([
      {
        projectId: projects[0]._id, // Mangrove Restoration
        organizationId: orgs[3]._id, // Clean Energy
        requestedBy: orgUser4._id,
        message:
          'We would love to partner on the mangrove project by providing solar-powered water quality telemetry sensors and drone monitoring equipment.',
        supportTypes: ['Technology', 'Equipment'],
        status: 'Accepted',
        responseNotes: 'Accepted with enthusiasm! Tech integration planned for Q2.',
        isSampleData: true,
      },
      {
        projectId: projects[2]._id, // STEM Hubs
        organizationId: orgs[0]._id, // Green Earth
        requestedBy: orgUser1._id,
        message:
          'Green Earth would like to co-develop an environmental science curriculum pack focusing on local biodiversity and climate sensors for schools.',
        supportTypes: ['Expertise', 'Volunteers'],
        status: 'Accepted',
        responseNotes: 'Curriculum co-design meeting scheduled.',
        isSampleData: true,
      },
      {
        projectId: projects[1]._id, // Solar Power for Clinics
        organizationId: orgs[2]._id, // Community Food Support
        requestedBy: orgUser3._id,
        message:
          'We can mobilize community volunteers to assist with logistics, local translation, and site security preparations.',
        supportTypes: ['Volunteers'],
        status: 'Pending',
        isSampleData: true,
      },
    ]);

    // 5. Create Sample Contributions (Verified & Recorded)
    console.log('Creating demo contributions...');
    await Contribution.create([
      // Mangrove Restoration
      {
        projectId: projects[0]._id,
        organizationId: orgs[3]._id,
        contributorName: 'Global Eco-Fund Partnership',
        contributorEmail: 'grants@ecofund.demo',
        contributionType: 'Monetary',
        amount: 25000,
        unit: 'USD',
        description: 'Demonstration grant for sapling nursery procurement and local ranger stipends.',
        status: 'Confirmed',
        contributionDate: new Date('2026-02-15'),
        isSampleData: true,
      },
      {
        projectId: projects[0]._id,
        organizationId: orgs[0]._id,
        contributorName: 'Coastline Youth Alliance',
        contributorEmail: 'volunteers@coastline.demo',
        contributionType: 'Volunteer Hours',
        quantity: 350,
        unit: 'Hours',
        description: '350 hours contributed toward wetland planting and barrier clearing.',
        status: 'Confirmed',
        contributionDate: new Date('2026-03-01'),
        isSampleData: true,
      },
      // Solar Power for Clinics
      {
        projectId: projects[1]._id,
        contributorName: 'Renewable Horizons Consortium',
        contributorEmail: 'alliances@horizons.demo',
        contributionType: 'Monetary',
        amount: 45000,
        unit: 'USD',
        description: 'Seed co-financing for 15 medical battery storage units.',
        status: 'Confirmed',
        contributionDate: new Date('2026-02-10'),
        isSampleData: true,
      },
      {
        projectId: projects[1]._id,
        contributorName: 'Apex Solar Technologies',
        contributorEmail: 'support@apexsolar.demo',
        contributionType: 'Equipment',
        quantity: 50,
        unit: 'Monocrystalline Solar Panels',
        description: '50 units of 400W solar modules donated for health clinics.',
        status: 'Confirmed',
        contributionDate: new Date('2026-02-28'),
        isSampleData: true,
      },
      // Open STEM Hubs
      {
        projectId: projects[2]._id,
        contributorName: 'Tech For All Foundation',
        contributorEmail: 'giving@techforall.demo',
        contributionType: 'Monetary',
        amount: 20000,
        unit: 'USD',
        description: 'Recorded contribution to sponsor tablet kits and server hardware.',
        status: 'Confirmed',
        contributionDate: new Date('2026-03-10'),
        isSampleData: true,
      },
      {
        projectId: projects[2]._id,
        contributorName: 'Jordan Tech Volunteers',
        contributorEmail: 'mentors@jordanvolunteers.demo',
        contributionType: 'Volunteer Hours',
        quantity: 180,
        unit: 'Hours',
        description: 'Software setup and teacher training mentorship sessions.',
        status: 'Confirmed',
        contributionDate: new Date('2026-03-12'),
        isSampleData: true,
      },
      // Community Food Forest
      {
        projectId: projects[3]._id,
        contributorName: 'São Paulo Urban Resilience Council',
        contributorEmail: 'funds@spresilience.demo',
        contributionType: 'Monetary',
        amount: 28000,
        unit: 'USD',
        description: 'Full municipal demonstration grant for garden irrigation & organic seeds.',
        status: 'Confirmed',
        contributionDate: new Date('2025-10-05'),
        isSampleData: true,
      },
      // Pending public contribution sample
      {
        projectId: projects[0]._id,
        contributorName: 'Citizen Supporter Alex Rivera',
        contributorEmail: 'alex.rivera@example.com',
        contributionType: 'Monetary',
        amount: 250,
        unit: 'USD',
        description: 'Sample community donation pledge awaiting audit verification.',
        status: 'Pending',
        contributionDate: new Date('2026-04-01'),
        isSampleData: true,
      },
    ]);

    // 6. Create Sample Contact Message
    console.log('Creating demo contact message...');
    await ContactMessage.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sjenkins@globalpartnerships.demo',
      subject: 'Inquiry on Cross-Border Water Purification Collaboration',
      message:
        'Hello SDG 17 Team, We are an academic research lab looking to register our consortium on the platform and partner with East African NGOs working on SDG 6 and SDG 17. Looking forward to connecting!',
      status: 'Unread',
    });

    console.log('=======================================================');
    console.log(' SUCCESS: SDG 17 Partnership Hub Seed Data Populated! ');
    console.log(' Demonstration Credentials:');
    console.log(' - Admin: admin@sdg17hub.demo / Admin@123456');
    console.log(' - Org 1: greenearth@sdg17hub.demo / Partner@123456');
    console.log(' - Org 2: edulearn@sdg17hub.demo / Partner@123456');
    console.log(' - Org 3: cleanpower@sdg17hub.demo / Partner@123456');
    console.log('=======================================================');

    if (autoDisconnect) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding error:', error);
    if (autoDisconnect) {
      await disconnectDB();
      process.exit(1);
    }
    throw error;
  }
};

// If run directly from terminal
if (process.argv[1]?.includes('seed.js')) {
  connectDB().then(() => seedDatabase(true));
}
