import { pool } from "./db";

export const SUPPORT_GOAL = 300;
export const SUPPORT_BASE_AMOUNT = 50;
export const SUPPORT_BASE_NAMES = ["@ana.games", "@joaozinho", "@lu_costa"];

type PendingDonation = {
  paymentId: string;
  donorName: string;
  instagram?: string;
  amount: number;
  status: string;
};

const memoryDonations = new Map<string, PendingDonation>();

export async function savePendingDonation(donation: Omit<PendingDonation, "status">) {
  if (!pool) {
    memoryDonations.set(donation.paymentId, { ...donation, status: "pending" });
    return;
  }
  await pool.query(
    `INSERT INTO donations (payment_id, donor_name, instagram, amount_cents, status)
     VALUES ($1, $2, $3, $4, 'pending')
     ON CONFLICT (payment_id) DO NOTHING`,
    [donation.paymentId, donation.donorName, donation.instagram ?? null, Math.round(donation.amount * 100)],
  );
}

export async function updateDonationStatus(paymentId: string | number, status: string) {
  const id = String(paymentId);
  if (!pool) {
    const donation = memoryDonations.get(id);
    if (donation) memoryDonations.set(id, { ...donation, status });
    return;
  }
  await pool.query(
    `UPDATE donations
     SET status = $2, approved_at = CASE WHEN $2 = 'approved' THEN COALESCE(approved_at, NOW()) ELSE approved_at END,
         updated_at = NOW()
     WHERE payment_id = $1`,
    [id, status],
  );
}

export async function getSupportSummary() {
  let approvedAmount = 0;
  let approvedNames: string[] = [];

  if (!pool) {
    const approved = [...memoryDonations.values()].filter((item) => item.status === "approved");
    approvedAmount = approved.reduce((sum, item) => sum + item.amount, 0);
    approvedNames = approved.flatMap((item) => item.instagram ? [item.instagram] : []);
  } else {
    const totalResult = await pool.query<{ total_cents: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::text AS total_cents FROM donations WHERE status = 'approved'`,
    );
    const namesResult = await pool.query<{ instagram: string }>(
      `SELECT instagram FROM donations
       WHERE status = 'approved' AND instagram IS NOT NULL AND instagram <> ''
       ORDER BY approved_at ASC, created_at ASC`,
    );
    approvedAmount = Number(totalResult.rows[0]?.total_cents ?? 0) / 100;
    approvedNames = namesResult.rows.map((row) => row.instagram);
  }

  const raised = SUPPORT_BASE_AMOUNT + approvedAmount;
  return {
    goal: SUPPORT_GOAL,
    raised,
    remaining: Math.max(SUPPORT_GOAL - raised, 0),
    percentage: Math.min(Math.round((raised / SUPPORT_GOAL) * 100), 100),
    supporters: [...new Set([...SUPPORT_BASE_NAMES, ...approvedNames])],
  };
}
