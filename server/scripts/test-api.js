import http from 'http';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Project from '../models/Project.js';
import Contribution from '../models/Contribution.js';
import Partnership from '../models/Partnership.js';

let server;
let baseUrl;

const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Starting Comprehensive SDG 17 API Verification Suite ---');
  await connectDB();

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health Check Endpoint (GET /api/health)');

    // 2. User Registration
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test Activist',
      email: `activist_${Date.now()}@example.org`,
      password: 'SecurePassword123!',
    });
    assert(regRes.status === 201 && regRes.body.token, 'User Registration (POST /api/auth/register)');
    const authToken = regRes.body.token;

    // 3. Current User (GET /api/auth/me)
    const meRes = await request('GET', '/api/auth/me', null, authToken);
    assert(meRes.status === 200 && meRes.body.user.name === 'Test Activist', 'Get Current User (GET /api/auth/me)');

    // 4. Create Organization
    const orgRes = await request('POST', '/api/organizations', {
      name: `Test Eco Alliance ${Date.now()}`,
      type: 'NGO',
      description: 'Test NGO description for verifying API CRUD operations.',
      city: 'Stockholm',
      country: 'Sweden',
      contributionAreas: ['Climate Action', 'Partnerships for the Goals'],
      contactEmail: 'contact@ecoalliance.org',
    }, authToken);
    assert(orgRes.status === 201 && orgRes.body.data._id, 'Create Organization (POST /api/organizations)');
    const createdOrgId = orgRes.body.data._id;

    // 5. Read Organizations
    const getOrgsRes = await request('GET', '/api/organizations');
    assert(getOrgsRes.status === 200 && getOrgsRes.body.data.length > 0, 'List Organizations with Filters (GET /api/organizations)');

    // 6. Create Project
    const projRes = await request('POST', '/api/projects', {
      title: 'Solar Water Filtration Grid',
      description: 'Providing clean solar-powered drinking water to test communities.',
      sdgNumber: 6,
      category: 'Water & Sanitation',
      location: 'Stockholm Archipelago, Sweden',
      organizationId: createdOrgId,
      budget: 50000,
      fundingTarget: 40000,
      startDate: new Date().toISOString(),
      status: 'Active',
      requiredSupportTypes: ['Funding', 'Equipment'],
    }, authToken);
    assert(projRes.status === 201 && projRes.body.data._id, 'Create Project (POST /api/projects)');
    const createdProjectId = projRes.body.data._id;

    // 7. Read Project Details
    const getProjRes = await request('GET', `/api/projects/${createdProjectId}`);
    assert(getProjRes.status === 200 && getProjRes.body.data.title === 'Solar Water Filtration Grid', 'Get Project by ID with Calculated Metrics (GET /api/projects/:id)');

    // 8. Record Contribution
    const contribRes = await request('POST', '/api/contributions', {
      projectId: createdProjectId,
      organizationId: createdOrgId,
      contributorName: 'Clean Water Fund',
      contributorEmail: 'grants@cleanwater.org',
      contributionType: 'Monetary',
      amount: 15000,
      description: 'First milestone tranche.',
      status: 'Confirmed',
    }, authToken);
    assert(contribRes.status === 201 && contribRes.body.data.amount === 15000, 'Record Contribution (POST /api/contributions)');

    // 9. Verify Project Funding Progress update
    const updatedProjRes = await request('GET', `/api/projects/${createdProjectId}`);
    assert(
      updatedProjRes.status === 200 &&
      updatedProjRes.body.data.recordedContributions === 15000 &&
      updatedProjRes.body.data.fundingProgress === 38,
      'Project Funding Progress Recalculation (15,000 / 40,000 = 38%)'
    );

    // 10. Dashboard Stats Aggregation
    const dashStats = await request('GET', '/api/dashboard/stats');
    assert(
      dashStats.status === 200 &&
      dashStats.body.data.totalOrganizations >= 1 &&
      dashStats.body.data.totalProjects >= 1 &&
      dashStats.body.data.contributions.totalMonetaryConfirmed >= 15000,
      'Dashboard Stats Aggregation (GET /api/dashboard/stats)'
    );

    // 11. Dashboard Charts Aggregation
    const dashCharts = await request('GET', '/api/dashboard/charts');
    assert(
      dashCharts.status === 200 &&
      Array.isArray(dashCharts.body.data.statusDistribution) &&
      Array.isArray(dashCharts.body.data.organizationsByType),
      'Dashboard Charts Aggregation (GET /api/dashboard/charts)'
    );

    // 12. Submit Partnership Request
    // First create a second organization to request collaboration
    const org2 = await Organization.create({
      name: `Partner Corp ${Date.now()}`,
      type: 'Company',
      description: 'Tech company providing IoT telemetry.',
      city: 'Berlin',
      country: 'Germany',
      contributionAreas: ['Clean Energy'],
      contactEmail: 'partner@corp.de',
      ownerId: regRes.body.user.id,
    });

    const partnerRes = await request('POST', '/api/partnerships', {
      projectId: createdProjectId,
      organizationId: org2._id,
      message: 'We can deploy remote IoT telemetry sensors to monitor water filter output.',
      supportTypes: ['Technology', 'Equipment'],
    }, authToken);
    assert(partnerRes.status === 201 && partnerRes.body.data.status === 'Pending', 'Submit Partnership Request (POST /api/partnerships)');
    const partnerId = partnerRes.body.data._id;

    // 13. Update Partnership Request Status
    const partnerPatchRes = await request('PATCH', `/api/partnerships/${partnerId}/status`, {
      status: 'Accepted',
      responseNotes: 'Welcome aboard! Connecting with engineering lead.',
    }, authToken);
    assert(partnerPatchRes.status === 200 && partnerPatchRes.body.data.status === 'Accepted', 'Update Partnership Status (PATCH /api/partnerships/:id/status)');

    // 14. Contact Message API
    const contactRes = await request('POST', '/api/contact', {
      name: 'Maria Santos',
      email: 'maria@example.com',
      subject: 'Inquiry on NGO onboarding',
      message: 'We would love to know how to connect our grassroots Latin American network.',
    });
    assert(contactRes.status === 201 && contactRes.body.success === true, 'Submit Contact Inquiry (POST /api/contact)');

    // 15. Invalid ObjectId Handling
    const invalidIdRes = await request('GET', '/api/projects/not-a-valid-object-id');
    assert(invalidIdRes.status === 400 && invalidIdRes.body.success === false, 'Invalid ObjectId Rejection (GET /api/projects/:invalidId)');

    console.log('-------------------------------------------------------');
    console.log(`Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('-------------------------------------------------------');

    server.close();
    await disconnectDB();

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
};

runTests();
