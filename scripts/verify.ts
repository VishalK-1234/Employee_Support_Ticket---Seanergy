import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import {
  listTickets,
  getTicketById,
  createTicket,
  updateTicketFields,
  updateTicketStatus,
  listTicketComments,
  createTicketComment,
} from "../src/lib/tickets";
import {
  validateTitle,
  validateDescription,
  validateCategory,
  validatePriority,
  validateStatus,
  validateComment,
} from "../src/lib/validate";

async function runVerification() {
  console.log("=================================================");
  console.log("STARTING AUTOMATED VERIFICATION OF SUPPORT TICKET APP");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `- ${detail}` : ""}`);
      failed++;
    }
  }

  // 1. Database Users & Passwords
  console.log("--- 1. Verification of Seed Users & Authentication ---");
  const emp1 = await prisma.user.findUnique({ where: { username: "employee1" } });
  const emp2 = await prisma.user.findUnique({ where: { username: "employee2" } });
  const sup1 = await prisma.user.findUnique({ where: { username: "support1" } });

  assert(!!emp1 && emp1.role === "employee", "User employee1 exists with role 'employee'");
  assert(!!emp2 && emp2.role === "employee", "User employee2 exists with role 'employee'");
  assert(!!sup1 && sup1.role === "support", "User support1 exists with role 'support'");

  const validPasswordCheck = await bcrypt.compare("password123", emp1!.passwordHash);
  assert(validPasswordCheck, "employee1 password123 hashes and verifies correctly");

  const invalidPasswordCheck = await bcrypt.compare("wrongpass", emp1!.passwordHash);
  assert(!invalidPasswordCheck, "Invalid password 'wrongpass' is rejected");

  const userEmp1 = { id: emp1!.id, username: emp1!.username, role: emp1!.role as "employee" };
  const userEmp2 = { id: emp2!.id, username: emp2!.username, role: emp2!.role as "employee" };
  const userSup1 = { id: sup1!.id, username: sup1!.username, role: sup1!.role as "support" };

  // 2. Sample Tickets Verification
  console.log("\n--- 2. Verification of Seeded Sample Tickets ---");
  const allTickets = await prisma.ticket.findMany();
  assert(allTickets.length >= 5, `Database has at least 5 sample tickets (Found: ${allTickets.length})`);

  const categories = new Set(allTickets.map((t) => t.category));
  const expectedCategories = ["Hardware", "Software", "Network", "Access", "Other"];
  const hasAllCategories = expectedCategories.every((c) => categories.has(c));
  assert(hasAllCategories, "Sample tickets cover all 5 required categories (Hardware, Software, Network, Access, Other)");

  // 3. Ticket Visibility & Access Control (AC-04, AC-05, BR-02, BR-03)
  console.log("\n--- 3. Role-based Visibility & Privacy Verification ---");
  const emp1Tickets = await listTickets(userEmp1);
  const emp1OnlyOwn = emp1Tickets.every((t) => t.createdById === userEmp1.id);
  assert(emp1OnlyOwn && emp1Tickets.length > 0, "employee1 only sees their own tickets");

  const emp2Tickets = await listTickets(userEmp2);
  const emp2OnlyOwn = emp2Tickets.every((t) => t.createdById === userEmp2.id);
  assert(emp2OnlyOwn && emp2Tickets.length > 0, "employee2 only sees their own tickets");

  const supTickets = await listTickets(userSup1);
  assert(
    supTickets.length === allTickets.length,
    `Support staff sees all ${allTickets.length} tickets across the system`
  );
  assert(
    supTickets.some((t) => t.createdBy?.username === "employee1") &&
      supTickets.some((t) => t.createdBy?.username === "employee2"),
    "Support list displays the creator username for each ticket"
  );

  // AC-05: employee1 requesting employee2's ticket by ID receives null (404)
  const emp2Ticket = emp2Tickets[0];
  const unauthorizedFetch = await getTicketById(emp2Ticket.id, userEmp1);
  assert(unauthorizedFetch === null, `AC-05: employee1 requesting employee2's ticket #${emp2Ticket.id} returns null (404 with no data leak)`);

  const authorizedFetch = await getTicketById(emp2Ticket.id, userSup1);
  assert(authorizedFetch !== null && authorizedFetch.id === emp2Ticket.id, "Support staff can view any ticket details");

  // 4. Ticket Creation & Validation Rules (AC-02, AC-03, VAL-01 to VAL-05)
  console.log("\n--- 4. Creation & Input Validation Verification ---");
  const createValid = await createTicket(
    {
      title: "  New Office Headset Microphone Issue  ",
      description: "  Microphone cuts out during online team meetings.  ",
      category: "Hardware",
      priority: "Medium",
    },
    userEmp1
  );
  assert(createValid.status === 201 && !!createValid.ticket, "Valid ticket creation succeeds (status 201)");
  assert(createValid.ticket?.status === "Open", "New ticket status is initialized to 'Open'");
  assert(createValid.ticket?.title === "New Office Headset Microphone Issue", "Title was trimmed before saving");
  assert(createValid.ticket?.createdById === userEmp1.id, "Created by is set to the signed-in employee");

  const newTicketId = createValid.ticket!.id;

  // Support staff creation blocked
  const supportCreate = await createTicket(
    {
      title: "Support ticket attempt",
      description: "Support should not be able to create tickets",
      category: "Hardware",
      priority: "Low",
    },
    userSup1
  );
  assert(supportCreate.status === 403, "Support staff ticket creation is rejected with 403");

  // Blank title rejected
  const blankTitle = await createTicket(
    { title: "   ", description: "Desc", category: "Hardware", priority: "Low" },
    userEmp1
  );
  assert(blankTitle.status === 400, "Blank/whitespace title is rejected with 400");

  // 101 character title rejected
  const longTitle = "a".repeat(101);
  const tooLongTitle = await createTicket(
    { title: longTitle, description: "Desc", category: "Hardware", priority: "Low" },
    userEmp1
  );
  assert(tooLongTitle.status === 400, "Title > 100 characters is rejected with 400");

  // Blank description rejected
  const blankDesc = await createTicket(
    { title: "Valid Title", description: "   ", category: "Hardware", priority: "Low" },
    userEmp1
  );
  assert(blankDesc.status === 400, "Blank/whitespace description is rejected with 400");

  // Invalid category rejected
  const invalidCategory = await createTicket(
    { title: "Valid Title", description: "Desc", category: "NonExistentCategory", priority: "Low" },
    userEmp1
  );
  assert(invalidCategory.status === 400, "Invalid category is rejected with 400");

  // Invalid priority rejected
  const invalidPriority = await createTicket(
    { title: "Valid Title", description: "Desc", category: "Hardware", priority: "Urgent" },
    userEmp1
  );
  assert(invalidPriority.status === 400, "Invalid priority is rejected with 400");

  // 5. Field Editing Restrictions (AC-06, AC-07, AC-09, BR-04, VAL-07)
  console.log("\n--- 5. Field Editing & Permission Restrictions ---");
  const originalCreatedDate = createValid.ticket!.createdAt;
  const originalUpdatedDate = createValid.ticket!.updatedAt;

  // Short delay to ensure timestamp difference
  await new Promise((r) => setTimeout(r, 100));

  const validEdit = await updateTicketFields(
    newTicketId,
    {
      title: "Updated Headset Title",
      priority: "High",
    },
    userEmp1
  );
  assert(validEdit.status === 200, "Creator can edit fields on Open ticket");
  assert(validEdit.ticket?.title === "Updated Headset Title", "Title updated successfully");
  assert(validEdit.ticket?.priority === "High", "Priority updated successfully");
  assert(
    validEdit.ticket!.createdAt.getTime() === originalCreatedDate.getTime(),
    "createdAt remains untouched after edit"
  );
  assert(
    validEdit.ticket!.updatedAt.getTime() > originalUpdatedDate.getTime(),
    "updatedAt refreshed after field edit"
  );

  // Other employee cannot edit
  const otherEmpEdit = await updateTicketFields(
    newTicketId,
    { title: "Hacked by emp2" },
    userEmp2
  );
  assert(otherEmpEdit.status === 404 || otherEmpEdit.status === 403, "Non-creator employee cannot edit fields");

  // Support cannot edit fields
  const supportFieldEdit = await updateTicketFields(
    newTicketId,
    { title: "Edited by support" },
    userSup1
  );
  assert(supportFieldEdit.status === 403, "Support staff cannot edit ticket fields (rejected with 403)");

  // 6. Status Updates & Closed Ticket Rules (AC-07, AC-08, BR-01, VAL-05)
  console.log("\n--- 6. Status Updates & Closed Lifecycle Rules ---");
  // Employee cannot change status
  const empStatusChange = await updateTicketStatus(newTicketId, "In Progress", userEmp1);
  assert(empStatusChange.status === 403, "Employee cannot change ticket status (rejected with 403)");

  // Support can change status to In Progress
  const supProgress = await updateTicketStatus(newTicketId, "In Progress", userSup1);
  assert(supProgress.status === 200 && supProgress.ticket?.status === "In Progress", "Support moves ticket to 'In Progress'");

  // Support can change status to Closed
  const supClosed = await updateTicketStatus(newTicketId, "Closed", userSup1);
  assert(supClosed.status === 200 && supClosed.ticket?.status === "Closed", "Support moves ticket to 'Closed'");

  // AC-07: On Closed ticket, creator field edit is refused
  const closedEditAttempt = await updateTicketFields(
    newTicketId,
    { title: "Edit on Closed ticket attempt" },
    userEmp1
  );
  assert(
    closedEditAttempt.status === 400,
    "AC-07: Field edit on a Closed ticket is refused with 400"
  );
  const postAttemptCheck = await prisma.ticket.findUnique({ where: { id: newTicketId } });
  assert(
    postAttemptCheck?.title === "Updated Headset Title",
    "Ticket fields remain unchanged after refused edit on Closed ticket"
  );

  // Support reopens Closed ticket to Resolved or Open
  const supReopen = await updateTicketStatus(newTicketId, "Open", userSup1);
  assert(supReopen.status === 200 && supReopen.ticket?.status === "Open", "Support reopens ticket from 'Closed' to 'Open'");

  // After reopen, creator can edit again
  const reopenEdit = await updateTicketFields(
    newTicketId,
    { title: "Title After Reopen" },
    userEmp1
  );
  assert(reopenEdit.status === 200, "Creator can edit fields again after ticket is reopened");

  // 7. Comment Validation and Access Control
  console.log("\n--- 7. Comment Validation & Access Control ---");

  const blankCommentValidation = validateComment("   ");
  assert(!blankCommentValidation.valid, "Blank comment content is rejected by validation");

  const longCommentValidation = validateComment("x".repeat(1001));
  assert(!longCommentValidation.valid, "Comment content over 1000 characters is rejected");

  const empComment = await createTicketComment(
    newTicketId,
    { content: "  This issue is now reproducible.  " },
    userEmp1
  );
  assert(empComment.status === 201 && !!empComment.comment, "Creator employee can post an open-ticket comment");
  assert(empComment.comment?.content === "This issue is now reproducible.", "Comment content is trimmed before saving");

  const supportComment = await createTicketComment(
    newTicketId,
    { content: "Support is reviewing the reported issue." },
    userSup1
  );
  assert(supportComment.status === 201 && !!supportComment.comment, "Support staff can reply to an open ticket");

  const visibleComments = await listTicketComments(newTicketId, userEmp1);
  assert(visibleComments.status === 200, "Ticket creator can list comments");
  const comments = "comments" in visibleComments ? visibleComments.comments : undefined;
  if (comments) {
    assert(
      comments.length >= 2 &&
        !!comments[0] &&
        !!comments[1] &&
        comments[0].createdAt.getTime() <= comments[1].createdAt.getTime(),
      "Comments are returned in chronological order"
    );
    assert(
      comments.some((comment) => comment.author.role === "support"),
      "Comment author identities include support staff role"
    );
  }

  const unauthorizedComment = await createTicketComment(
    newTicketId,
    { content: "Unauthorized comment" },
    userEmp2
  );
  assert(
    unauthorizedComment.status === 404,
    "Non-creator employee cannot comment on another employee's ticket"
  );

  const unauthorizedList = await listTicketComments(newTicketId, userEmp2);
  assert(
    unauthorizedList.status === 404,
    "Non-creator employee cannot list another employee's comments"
  );

  const closeForComments = await updateTicketStatus(newTicketId, "Closed", userSup1);
  assert(closeForComments.status === 200, "Support closes ticket before comment lock test");

  const closedComment = await createTicketComment(
    newTicketId,
    { content: "Comment after closure" },
    userEmp1
  );
  assert(closedComment.status === 400, "Posting on a Closed ticket is refused with 400");

  console.log("\n=================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch((e) => {
    console.error("Verification failed with exception:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
