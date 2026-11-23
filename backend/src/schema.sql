-- Maintenance Expense Tracker Schema for 3 Friends: Vikash Meena, Devendra Singh, Kamlesh Meena

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    person_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    day_of_week VARCHAR(20) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_person ON expenses(person_name);
