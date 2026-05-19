// 2 months of realistic Victoria, BC sample transactions (March & April 2026)
// These are pre-loaded so the user can see how the app looks before entering real data.

function tx(id, date, category, subcategory, description, amount, type, paymentMethod, tag) {
  return { id, date, category, subcategory, description, amount, type, paymentMethod, tag, createdAt: Date.now() }
}

export const SAMPLE_TRANSACTIONS = [
  // ═══════════════════════════════════
  // MARCH 2026
  // ═══════════════════════════════════

  // Income
  tx('s01', '2026-03-01', 'Salary',         'Regular Pay',          'Employer payroll',           5500.00, 'Income',  'Auto-Debit',        'Recurring'),
  tx('s02', '2026-03-15', 'GST/HST Credit', 'Quarterly Credit',     'CRA GST/HST Credit',          125.00, 'Income',  'Auto-Debit',        'Recurring'),

  // Housing
  tx('s03', '2026-03-01', 'Housing',         'Rent/Mortgage',       'March rent',                 1800.00, 'Expense', 'Interac e-Transfer', 'Recurring'),

  // Utilities
  tx('s04', '2026-03-03', 'Utilities',       'Phone',               'TELUS mobile',                 85.00, 'Expense', 'Auto-Debit',         'Subscription'),
  tx('s05', '2026-03-03', 'Utilities',       'Streaming',           'Netflix',                       17.99, 'Expense', 'Credit Card',        'Subscription'),
  tx('s06', '2026-03-03', 'Utilities',       'Streaming',           'Spotify',                       11.99, 'Expense', 'Credit Card',        'Subscription'),
  tx('s07', '2026-03-07', 'Utilities',       'Electricity',         'BC Hydro',                      89.50, 'Expense', 'Auto-Debit',         'Recurring'),
  tx('s08', '2026-03-10', 'Utilities',       'Internet',            'Shaw Internet',                 75.00, 'Expense', 'Auto-Debit',         'Subscription'),

  // Insurance
  tx('s09', '2026-03-01', 'Insurance',       'Extended Health/Dental','Sun Life benefits',          145.00, 'Expense', 'Auto-Debit',         'Recurring'),

  // Transportation
  tx('s10', '2026-03-05', 'Transportation',  'Gas',                 'Petro-Canada Douglas St',      72.40, 'Expense', 'Debit Card',         'Recurring'),
  tx('s11', '2026-03-12', 'Transportation',  'Insurance',           'ICBC autoplan',               145.00, 'Expense', 'Auto-Debit',         'Recurring'),
  tx('s12', '2026-03-17', 'Transportation',  'Gas',                 'Petro-Canada Burnside',        68.20, 'Expense', 'Debit Card',         'Recurring'),
  tx('s13', '2026-03-22', 'Transportation',  'Public Transit',      'BC Transit monthly pass',     100.00, 'Expense', 'Debit Card',         'Recurring'),

  // Food & Dining — Groceries
  tx('s14', '2026-03-02', 'Food & Dining',   'Groceries',           'Superstore Carey Rd',         156.80, 'Expense', 'Debit Card',         'Essential'),
  tx('s15', '2026-03-08', 'Food & Dining',   'Groceries',           'Safeway Cook St Village',      98.35, 'Expense', 'Debit Card',         'Essential'),
  tx('s16', '2026-03-14', 'Food & Dining',   'Groceries',           'Save-On-Foods Quadra',         87.45, 'Expense', 'Debit Card',         'Essential'),
  tx('s17', '2026-03-20', 'Food & Dining',   'Groceries',           'Superstore Carey Rd',         122.60, 'Expense', 'Debit Card',         'Essential'),
  tx('s18', '2026-03-27', 'Food & Dining',   'Groceries',           'Thrifty Foods Cedar Hill',     67.90, 'Expense', 'Debit Card',         'Essential'),

  // Food & Dining — Coffee/Takeout
  tx('s19', '2026-03-03', 'Food & Dining',   'Coffee',              'Tim Hortons Yates St',          6.45, 'Expense', 'Debit Card',         'Discretionary'),
  tx('s20', '2026-03-06', 'Food & Dining',   'Coffee',              'Starbucks Fort St',             8.75, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s21', '2026-03-10', 'Food & Dining',   'Restaurants',         'Moxies Victoria',              78.40, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s22', '2026-03-13', 'Food & Dining',   'Coffee',              'Tim Hortons Douglas',           5.25, 'Expense', 'Cash',               'Discretionary'),
  tx('s23', '2026-03-19', 'Food & Dining',   'Takeout',             'Subway Fort St',               14.50, 'Expense', 'Debit Card',         'Discretionary'),
  tx('s24', '2026-03-24', 'Food & Dining',   'Coffee',              'Habit Coffee Fisgard',          7.80, 'Expense', 'Debit Card',         'Discretionary'),
  tx('s25', '2026-03-28', 'Food & Dining',   'Restaurants',         'Rebar Modern Food',            54.20, 'Expense', 'Credit Card',        'Discretionary'),

  // Healthcare
  tx('s26', '2026-03-15', 'Healthcare',      'Prescriptions',       'London Drugs Rx',              34.50, 'Expense', 'Debit Card',         'Essential'),
  tx('s27', '2026-03-20', 'Healthcare',      'Gym',                 'YMCA membership',              49.99, 'Expense', 'Auto-Debit',         'Recurring'),

  // Entertainment
  tx('s28', '2026-03-16', 'Entertainment',   'Movies',              'Cineplex Tillicum',            22.50, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s29', '2026-03-23', 'Entertainment',   'Hobbies',             'Mountain Equipment Co-op',     45.00, 'Expense', 'Credit Card',        'Discretionary'),

  // Personal Care
  tx('s30', '2026-03-18', 'Personal Care',   'Haircut',             'Mayfair Barbers',              35.00, 'Expense', 'Cash',               'Recurring'),
  tx('s31', '2026-03-27', 'Personal Care',   'Skincare',            'Shoppers Drug Mart',           23.45, 'Expense', 'Debit Card',         'Discretionary'),

  // Shopping
  tx('s32', '2026-03-14', 'Shopping',        'Amazon',              'Amazon.ca — misc',             45.99, 'Expense', 'Credit Card',        'One-Time'),
  tx('s33', '2026-03-27', 'Shopping',        'Clothing',            'Winners Mayfair',              89.95, 'Expense', 'Debit Card',         'Discretionary'),

  // Savings
  tx('s34', '2026-03-31', 'Savings & Investments', 'TFSA',          'TFSA contribution',           300.00, 'Expense', 'Auto-Debit',         'Recurring'),
  tx('s35', '2026-03-31', 'Savings & Investments', 'Emergency Fund','Emergency savings',           200.00, 'Expense', 'Auto-Debit',         'Recurring'),

  // ═══════════════════════════════════
  // APRIL 2026
  // ═══════════════════════════════════

  // Income
  tx('s36', '2026-04-01', 'Salary',          'Regular Pay',         'Employer payroll',            5500.00, 'Income', 'Auto-Debit',         'Recurring'),
  tx('s37', '2026-04-12', 'Freelance',       'Consulting',          'Web consulting project',       350.00, 'Income', 'Interac e-Transfer', 'One-Time'),
  tx('s38', '2026-04-30', 'CRA Refund',      'Tax Refund',          'CRA income tax refund',        892.00, 'Income', 'Auto-Debit',         'One-Time'),

  // Housing
  tx('s39', '2026-04-01', 'Housing',         'Rent/Mortgage',       'April rent',                  1800.00, 'Expense', 'Interac e-Transfer', 'Recurring'),
  tx('s40', '2026-04-19', 'Housing',         'Maintenance',         'Canadian Tire hardware',        42.80, 'Expense', 'Debit Card',         'One-Time'),

  // Utilities
  tx('s41', '2026-04-03', 'Utilities',       'Phone',               'TELUS mobile',                  85.00, 'Expense', 'Auto-Debit',         'Subscription'),
  tx('s42', '2026-04-03', 'Utilities',       'Streaming',           'Netflix',                        17.99, 'Expense', 'Credit Card',        'Subscription'),
  tx('s43', '2026-04-03', 'Utilities',       'Streaming',           'Spotify',                        11.99, 'Expense', 'Credit Card',        'Subscription'),
  tx('s44', '2026-04-07', 'Utilities',       'Electricity',         'BC Hydro',                       76.20, 'Expense', 'Auto-Debit',         'Recurring'),
  tx('s45', '2026-04-10', 'Utilities',       'Internet',            'Shaw Internet',                  75.00, 'Expense', 'Auto-Debit',         'Subscription'),

  // Insurance
  tx('s46', '2026-04-01', 'Insurance',       'Extended Health/Dental','Sun Life benefits',           145.00, 'Expense', 'Auto-Debit',         'Recurring'),

  // Transportation
  tx('s47', '2026-04-04', 'Transportation',  'Gas',                 'Petro-Canada Douglas St',       64.80, 'Expense', 'Debit Card',         'Recurring'),
  tx('s48', '2026-04-12', 'Transportation',  'Insurance',           'ICBC autoplan',                145.00, 'Expense', 'Auto-Debit',         'Recurring'),
  tx('s49', '2026-04-19', 'Transportation',  'Gas',                 'Esso McKenzie Ave',             58.40, 'Expense', 'Debit Card',         'Recurring'),
  tx('s50', '2026-04-22', 'Transportation',  'Public Transit',      'BC Transit monthly pass',      100.00, 'Expense', 'Debit Card',         'Recurring'),
  tx('s51', '2026-04-25', 'Transportation',  'Parking',             'Downtown parkade',               8.00, 'Expense', 'Cash',               'One-Time'),

  // Food & Dining — Groceries
  tx('s52', '2026-04-02', 'Food & Dining',   'Groceries',           'Superstore Carey Rd',          143.25, 'Expense', 'Debit Card',         'Essential'),
  tx('s53', '2026-04-08', 'Food & Dining',   'Groceries',           'Safeway Cook St Village',      104.60, 'Expense', 'Debit Card',         'Essential'),
  tx('s54', '2026-04-15', 'Food & Dining',   'Groceries',           'Save-On-Foods Quadra',          92.80, 'Expense', 'Debit Card',         'Essential'),
  tx('s55', '2026-04-23', 'Food & Dining',   'Groceries',           'Superstore Carey Rd',          138.90, 'Expense', 'Debit Card',         'Essential'),
  tx('s56', '2026-04-29', 'Food & Dining',   'Groceries',           'Thrifty Foods Cedar Hill',      58.45, 'Expense', 'Debit Card',         'Essential'),

  // Food & Dining — Coffee/Dining Out
  tx('s57', '2026-04-02', 'Food & Dining',   'Coffee',              'Tim Hortons Yates St',           6.45, 'Expense', 'Debit Card',         'Discretionary'),
  tx('s58', '2026-04-05', 'Food & Dining',   'Coffee',              'Discovery Coffee',               5.80, 'Expense', 'Cash',               'Discretionary'),
  tx('s59', '2026-04-09', 'Food & Dining',   'Restaurants',         'The Bard & Banker',             92.60, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s60', '2026-04-13', 'Food & Dining',   'Takeout',             'Pizzeria Prima Strada',         38.50, 'Expense', 'Debit Card',         'Discretionary'),
  tx('s61', '2026-04-17', 'Food & Dining',   'Coffee',              'Habit Coffee Fisgard',           7.80, 'Expense', 'Debit Card',         'Discretionary'),
  tx('s62', '2026-04-21', 'Food & Dining',   'Restaurants',         'Fishhook',                      67.40, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s63', '2026-04-26', 'Food & Dining',   'Coffee',              'Starbucks Fort St',              9.15, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s64', '2026-04-28', 'Food & Dining',   'Alcohol',             'BC Liquor Store',               48.90, 'Expense', 'Debit Card',         'Discretionary'),

  // Healthcare
  tx('s65', '2026-04-16', 'Healthcare',      'Dentist',             'Cook St Dental',               180.00, 'Expense', 'Debit Card',         'Essential'),
  tx('s66', '2026-04-20', 'Healthcare',      'Gym',                 'YMCA membership',               49.99, 'Expense', 'Auto-Debit',         'Recurring'),

  // Entertainment
  tx('s67', '2026-04-11', 'Entertainment',   'Sports',              'Victoria Royals game',          55.00, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s68', '2026-04-24', 'Entertainment',   'Books',               'Munro\'s Books',                28.95, 'Expense', 'Cash',               'Discretionary'),

  // Personal Care
  tx('s69', '2026-04-14', 'Personal Care',   'Clothing',            'Aritzia Fort St',              112.00, 'Expense', 'Credit Card',        'Discretionary'),
  tx('s70', '2026-04-22', 'Personal Care',   'Skincare',            'Sephora Bay Centre',            64.50, 'Expense', 'Credit Card',        'Discretionary'),

  // Shopping
  tx('s71', '2026-04-06', 'Shopping',        'Amazon',              'Amazon.ca — kitchen',           67.89, 'Expense', 'Credit Card',        'One-Time'),
  tx('s72', '2026-04-18', 'Shopping',        'Home Goods',          'Homesense Mayfair',             89.99, 'Expense', 'Debit Card',         'Discretionary'),

  // Travel
  tx('s73', '2026-04-30', 'Travel',          'Flights',             'Air Canada — YYJ→YVR',         189.00, 'Expense', 'Credit Card',        'One-Time'),

  // Gifts & Donations
  tx('s74', '2026-04-27', 'Gifts & Donations','Gifts',              'Birthday gift',                 50.00, 'Expense', 'Cash',               'One-Time'),

  // Savings
  tx('s75', '2026-04-30', 'Savings & Investments','TFSA',           'TFSA contribution',            300.00, 'Expense', 'Auto-Debit',         'Recurring'),
  tx('s76', '2026-04-30', 'Savings & Investments','Emergency Fund', 'Emergency savings',            200.00, 'Expense', 'Auto-Debit',         'Recurring'),
]
