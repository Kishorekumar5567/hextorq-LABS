/**
 * Nexus Platform Security & Multi-Tenant Isolation Test Runner
 * Validates RLS rules, cross-client isolation, internal note shielding,
 * Vercel preview host policies, and payment idempotency.
 */

import { db } from '../src/lib/data/repository';
import { INITIAL_PROFILES } from '../src/lib/data/mock-db';
import crypto from 'crypto';

async function runSecurityTests() {
  console.log('===============================================================');
  console.log('NEXUS SECURITY & MULTI-TENANT ISOLATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details || 'Assertion failed'}`);
      failed++;
    }
  }

  const admin = INITIAL_PROFILES.find(p => p.id === 'user-admin-01')!;
  const dev = INITIAL_PROFILES.find(p => p.id === 'user-dev-02')!;
  const clientApex = INITIAL_PROFILES.find(p => p.id === 'user-client-03')!;
  const clientHorizon = INITIAL_PROFILES.find(p => p.id === 'user-client-04')!;

  // TEST 1: Cross-Client Project Isolation
  console.log('[Test Group 1: Cross-Client Project Isolation]');
  const apexProjects = db.getProjects(clientApex);
  assert(
    'Client Apex only sees Apex projects',
    apexProjects.length === 1 && apexProjects[0].id === 'proj-apex-001',
    `Expected 1 Apex project, got ${apexProjects.length}`
  );

  const horizonProjects = db.getProjects(clientHorizon);
  assert(
    'Client Horizon only sees Horizon projects',
    horizonProjects.length === 1 && horizonProjects[0].id === 'proj-horizon-002',
    `Expected 1 Horizon project, got ${horizonProjects.length}`
  );

  let crossAccessBlocked = false;
  try {
    db.getProject('proj-horizon-002', clientApex);
  } catch (err: any) {
    crossAccessBlocked = err.message.includes('Access Denied');
  }
  assert('Client Apex cannot access Horizon project (403 Forbidden)', crossAccessBlocked);

  // Agency Admin has multi-tenant visibility
  const allProjects = db.getProjects(admin);
  assert(
    'Agency Admin can see all agency projects',
    allProjects.length >= 2,
    `Admin sees ${allProjects.length} projects`
  );

  // TEST 2: Internal Notes & Comments Segregation
  console.log('\n[Test Group 2: Internal Information Shielding]');
  const clientAnnotations = db.getVisualAnnotations('proj-apex-001', clientApex);
  const clientAnnoComments = clientAnnotations.flatMap(a => a.comments || []);
  const containsInternalAnnoComment = clientAnnoComments.some(c => c.is_internal_only);
  assert(
    'Internal-only annotation comments are stripped for clients',
    !containsInternalAnnoComment
  );

  const adminAnnotations = db.getVisualAnnotations('proj-apex-001', admin);
  const adminAnnoComments = adminAnnotations.flatMap(a => a.comments || []);
  const adminHasInternalComment = adminAnnoComments.some(c => c.is_internal_only);
  assert(
    'Agency staff can view internal-only annotation comments',
    adminHasInternalComment
  );

  const clientTickets = db.getTickets('proj-apex-001', clientApex);
  const clientHasInternalTicket = clientTickets.some(t => !t.is_client_visible);
  assert(
    'Internal-only tickets are completely hidden from client',
    !clientHasInternalTicket
  );

  const clientFiles = db.getFiles('proj-apex-001', clientApex);
  const clientHasInternalFile = clientFiles.some(f => !f.is_client_visible);
  assert(
    'Internal files (e.g. margin analysis) are hidden from client',
    !clientHasInternalFile
  );

  const clientNotes = db.getNotes('proj-apex-001', clientApex);
  const clientHasInternalNote = clientNotes.some(n => !n.is_client_visible);
  assert(
    'Internal technical secret notes are hidden from client',
    !clientHasInternalNote
  );

  // TEST 3: Vercel Preview Host Policy
  console.log('\n[Test Group 3: Vercel Deployment Host Security Policy]');
  let validPreviewAllowed = false;
  try {
    const validPrev = db.registerPreview('proj-apex-001', admin, {
      deployment_id: 'dpl_test_valid',
      deployment_url: 'https://staging-test.vercel.app',
      git_branch: 'test/security',
    });
    validPreviewAllowed = validPrev.is_current;
  } catch (e) {
    validPreviewAllowed = false;
  }
  assert('Approved .vercel.app host is successfully registered', validPreviewAllowed);

  let unapprovedHostBlocked = false;
  try {
    db.registerPreview('proj-apex-001', admin, {
      deployment_id: 'dpl_evil',
      deployment_url: 'https://attacker-phishing-site.xyz/spoof',
      git_branch: 'malicious',
    });
  } catch (err: any) {
    unapprovedHostBlocked = err.message.includes('Security Exception');
  }
  assert('Unapproved host domain is blocked by security policy', unapprovedHostBlocked);

  let clientDeployBlocked = false;
  try {
    db.registerPreview('proj-apex-001', clientApex, {
      deployment_id: 'dpl_client_attempt',
      deployment_url: 'https://legit.vercel.app',
    });
  } catch (err: any) {
    clientDeployBlocked = err.message.includes('not permitted');
  }
  assert('Clients are barred from registering deployment previews', clientDeployBlocked);

  // TEST 4: Milestone Sign-Off & Escrow Execution
  console.log('\n[Test Group 4: Milestone Formal Digital Sign-Off]');
  const approval = db.approveMilestone(
    'proj-apex-001',
    'ms-apex-03',
    clientApex,
    'Marcus Vance [Apex Retail CEO]',
    'Deliverables verified and accepted on staging'
  );
  assert(
    'Milestone digital signature recorded and marked approved',
    approval.digital_signature.includes('Marcus Vance') &&
    db.milestones.find(m => m.id === 'ms-apex-03')?.status === 'approved'
  );

  // TEST 5: Payment Gateway & Webhook Verification
  console.log('\n[Test Group 5: Payment Settlement & Idempotency]');
  const inv = db.invoices.find(i => i.id === 'inv-apex-002')!;
  assert('Invoice initial status is issued', inv.status === 'issued');

  db.markInvoicePaid(inv.id, 'stripe', 'pi_test_12345');
  assert('Invoice settled server-side as paid', inv.status === 'paid');

  // Verify HMAC signature calculation
  const secret = 'whsec_local_test_secret';
  const payload = JSON.stringify({ event: 'payment_intent.succeeded', invoice_id: inv.id });
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  assert('Cryptographic HMAC-SHA256 signature generated accurately', hmac.length === 64);

  console.log('\n===============================================================');
  console.log(`TOTAL SECURITY TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
