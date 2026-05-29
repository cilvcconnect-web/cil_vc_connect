# Security Specification & Threat Model (Attribute-Based Access Control)

## 1. Data Invariants
1. **User Mutation Protection**: A user's profile can only be read as a full record by themselves or the admin (Manager/RA). Users are forbidden from elevating their own roles (`role` field lock) or setting their user registration states (`status`) unilaterally.
2. **VC Operation Bounds**: Only the creating manager can update the schedule details. Assigned conductors can transition the VC `status` or report technical issues. Outside parties are completely blocked from reading or writing specific conference data.
3. **Attendance Verification Integrity**: Conductors are permitted to read their own attendance records and write attendance change requests, but strictly forbidden from modifying confirmed payroll-relevant logs.
4. **Expense Claims Safeguards**: Salary vouchers can only be modified by the creating user (Conductor/RA) if in `Draft` state. RAs can verify, and managers can complete execution. Self-approvals are physically impossible.
5. **Private Message Seals**: Messages between nodes are mathematically bound strictly to the `senderId` and `receiverId`. No third party can perform table-scans or general queries.

---

## 2. The Dirty Dozen Payloads (Theoretical Vectors)
Below are 12 targeted attack payloads designed to test boundaries and trigger exceptions:

1. **Self Role Escalation (`User/1`)** - Authenticated attacker `user_A` attempts to change their own role to `"Manager"` or `"Reporting Authority"`.
2. **Shadow Status Bypass (`User/pending_B`)** - Attacker signs up and attempts to write themselves directly in `status: "Approved"` state.
3. **Ghost Profile Takeover (`User/C`)** - Authenticated user attempts to write another member's profile entirely.
4. **Private PII Extraction (`User/*`)** - An authenticated bystander attempts to execute a blanket query reading everyone's private phones and credentials.
5. **VC Hijack (`VC/1`)** - A bystander conductor attempts to reschedule or change the details of a major VC slated for a corporate block.
6. **VC Status Shortcut (`VC/2`)** - An unauthorized actor attempts to cancel a scheduled meeting or clear its location logs.
7. **Attendance Forgery (`Attendance/1`)** - Attacker attempts to inject an entry under another conductor's ID with `status: "Present"` during an unrecorded period.
8. **Malicious Salary Increase (`Salary/claim_1`)** - A conductor tries to manipulate the `amount` of a salary claim after it has been escalated beyond `Draft` state.
9. **Claim Safe-Pass Avoidance (`Salary/claim_2`)** - A general conductor attempts to transition their own salary voucher directly from `Pending RA Approval` to `Approved`.
10. **Signal Jam Corruption (`VC/technical_disrupt`)** - Attacker injects a massive 1MB string into a technical issue description field to cause UI buffer crashes.
11. **Chat Wiretapping (`Message/spy_1`)** - Attacker `user_D` attempts to read a Message document directed between `user_A` and `user_B`.
12. **System Log Abuse (`any/glob`)** - Rogue client attempts to write a global document outside of identified paths.

---

## 3. Test Runner Configurations
All rules defined inside `firestore.rules` will perform automated checks to ensure permissions for the above vectors return `PERMISSION_DENIED` across all collections and clients.
