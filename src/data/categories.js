export const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food & Dining', 'Utilities',
  'Healthcare', 'Insurance', 'Entertainment', 'Personal Care',
  'Education', 'Shopping', 'Travel', 'Savings & Investments',
  'Debt Payments', 'Gifts & Donations', 'Business', 'Other',
]

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Side Income', 'Investment Return',
  'Bonus', 'EI Benefits', 'CRA Refund', 'GST/HST Credit', 'CCB', 'Other Income',
]

export const SUBCATEGORIES = {
  'Housing':               ['Rent/Mortgage', 'Property Tax', 'Condo Fees', 'Maintenance', 'Furniture'],
  'Transportation':        ['Gas', 'Car Payment', 'Insurance', 'Public Transit', 'Parking', 'Rideshare', 'Maintenance'],
  'Food & Dining':         ['Groceries', 'Restaurants', 'Coffee', 'Takeout', 'Alcohol', 'Work Lunches'],
  'Utilities':             ['Electricity', 'Gas/Heat', 'Water', 'Internet', 'Phone', 'Streaming', 'Cable/Satellite'],
  'Healthcare':            ['Doctor', 'Dentist', 'Prescriptions', 'Gym', 'Mental Health', 'Vision'],
  'Insurance':             ['Extended Health/Dental', 'Life Insurance', 'Disability Insurance', 'Pet Insurance'],
  'Entertainment':         ['Movies', 'Concerts', 'Sports', 'Hobbies', 'Books', 'Games'],
  'Personal Care':         ['Haircut', 'Clothing', 'Skincare', 'Laundry'],
  'Education':             ['Tuition', 'Books', 'Courses', 'Student Loan'],
  'Shopping':              ['Amazon', 'Electronics', 'Home Goods', 'Clothing', 'Gifts'],
  'Travel':                ['Flights', 'Hotels', 'Car Rental', 'Activities', 'Luggage'],
  'Savings & Investments': ['Emergency Fund', 'RRSP', 'TFSA', 'FHSA', 'GIC', 'Non-Registered Account'],
  'Debt Payments':         ['Credit Card', 'Student Loan', 'Personal Loan', 'Car Loan'],
  'Gifts & Donations':     ['Gifts', 'Charity', 'Religious'],
  'Business':              ['Office Supplies', 'Software', 'Client Entertainment', 'Travel', 'Marketing'],
  'Other':                 ['Miscellaneous', 'Bank Fees', 'ATM', 'Unknown'],
  // Income subcategories (optional)
  'Salary':                ['Regular Pay', 'Overtime'],
  'Freelance':             ['Contract', 'Consulting'],
  'Side Income':           ['Part-time', 'Gig Work'],
  'Investment Return':     ['Dividends', 'Capital Gains', 'Interest'],
  'Bonus':                 ['Performance', 'Holiday'],
  'EI Benefits':           ['Employment Insurance'],
  'CRA Refund':            ['Tax Refund'],
  'GST/HST Credit':        ['Quarterly Credit'],
  'CCB':                   ['Canada Child Benefit'],
  'Other Income':          ['Miscellaneous'],
}

export const PAYMENT_METHODS = [
  'Credit Card', 'Debit Card', 'Cash', 'Interac e-Transfer', 'Auto-Debit',
]

export const TAGS = [
  'Recurring', 'One-Time', 'Discretionary', 'Essential', 'Subscription',
]

export const DEFAULT_BUDGETS = {
  'Housing':               { amount: 1800, type: 'Fixed' },
  'Transportation':        { amount: 300,  type: 'Variable' },
  'Food & Dining':         { amount: 500,  type: 'Variable' },
  'Utilities':             { amount: 200,  type: 'Fixed' },
  'Healthcare':            { amount: 100,  type: 'Variable' },
  'Insurance':             { amount: 150,  type: 'Fixed' },
  'Entertainment':         { amount: 100,  type: 'Variable' },
  'Personal Care':         { amount: 80,   type: 'Variable' },
  'Education':             { amount: 50,   type: 'Variable' },
  'Shopping':              { amount: 150,  type: 'Variable' },
  'Travel':                { amount: 100,  type: 'Variable' },
  'Savings & Investments': { amount: 500,  type: 'Fixed' },
  'Debt Payments':         { amount: 200,  type: 'Fixed' },
  'Gifts & Donations':     { amount: 50,   type: 'Variable' },
  'Business':              { amount: 100,  type: 'Variable' },
  'Other':                 { amount: 50,   type: 'Variable' },
}

// Colour assigned to each expense category (index-stable)
export const CATEGORY_COLORS = [
  '#EF4444', // Housing       — red
  '#F97316', // Transportation — orange
  '#EAB308', // Food & Dining  — yellow
  '#14B8A6', // Utilities      — teal
  '#22C55E', // Healthcare     — green
  '#6366F1', // Insurance      — indigo
  '#EC4899', // Entertainment  — pink
  '#A855F7', // Personal Care  — purple
  '#3B82F6', // Education      — blue
  '#F43F5E', // Shopping       — rose
  '#06B6D4', // Travel         — cyan
  '#10B981', // Savings        — emerald
  '#F59E0B', // Debt           — amber
  '#84CC16', // Gifts          — lime
  '#8B5CF6', // Business       — violet
  '#64748B', // Other          — slate
]

export function getCategoryColor(category) {
  const idx = EXPENSE_CATEGORIES.indexOf(category)
  return idx >= 0 ? CATEGORY_COLORS[idx] : '#64748B'
}
