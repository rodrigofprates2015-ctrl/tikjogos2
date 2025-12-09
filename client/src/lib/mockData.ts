import { startOfMonth, subDays, subMonths, format } from "date-fns";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export interface Expense {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  status: ExpenseStatus;
  description: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  size: string;
  status: "completed" | "restored";
  type: "manual" | "scheduled";
}

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "EXP-001",
    date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    merchant: "Uber Business",
    amount: 45.50,
    category: "Transportation",
    status: "pending",
    description: "Client meeting transport"
  },
  {
    id: "EXP-002",
    date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
    merchant: "Delta Airlines",
    amount: 450.00,
    category: "Travel",
    status: "approved",
    description: "Flight to NYC HQ"
  },
  {
    id: "EXP-003",
    date: format(subDays(new Date(), 6), "yyyy-MM-dd"),
    merchant: "Hilton Garden Inn",
    amount: 890.20,
    category: "Lodging",
    status: "approved",
    description: "3 nights for conference"
  },
  {
    id: "EXP-004",
    date: format(subDays(new Date(), 12), "yyyy-MM-dd"),
    merchant: "Starbucks",
    amount: 12.45,
    category: "Meals",
    status: "rejected",
    description: "Coffee run (Personal)"
  },
  {
    id: "EXP-005",
    date: format(subDays(new Date(), 15), "yyyy-MM-dd"),
    merchant: "AWS Web Services",
    amount: 1200.00,
    category: "Software",
    status: "pending",
    description: "Monthly infrastructure"
  },
  {
    id: "EXP-006",
    date: format(subDays(new Date(), 18), "yyyy-MM-dd"),
    merchant: "WeWork",
    amount: 350.00,
    category: "Office",
    status: "approved",
    description: "Day pass for remote team"
  }
];

export const MOCK_BACKUPS: BackupSnapshot[] = [
  {
    id: "BKP-2025-11-29-0900",
    timestamp: format(new Date(), "yyyy-MM-dd HH:mm"),
    size: "1.2 GB",
    status: "completed",
    type: "scheduled"
  },
  {
    id: "BKP-2025-11-28-1800",
    timestamp: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm"),
    size: "1.1 GB",
    status: "completed",
    type: "manual"
  },
  {
    id: "BKP-2025-11-27-0900",
    timestamp: format(subDays(new Date(), 2), "yyyy-MM-dd HH:mm"),
    size: "1.1 GB",
    status: "completed",
    type: "scheduled"
  }
];
