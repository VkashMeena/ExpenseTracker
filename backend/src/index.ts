import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool, initDb } from './db.js';
import { ALLOWED_FRIENDS, FriendName, Expense, StatsResponse } from './types.js';
import { getDayOfWeekFromDate, calculateSettlement, DAYS_OF_WEEK } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files if built
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      dbConnected: true,
      timestamp: result.rows[0].now,
      friends: ALLOWED_FRIENDS
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Friends list
app.get('/api/friends', (_req: Request, res: Response) => {
  res.json({ friends: ALLOWED_FRIENDS });
});

/**
 * GET /api/expenses
 * Supports filtering:
 *  - from: YYYY-MM-DD
 *  - to: YYYY-MM-DD
 *  - person: FriendName
 *  - search: string (description match)
 */
app.get('/api/expenses', async (req: Request, res: Response) => {
  try {
    const { from, to, person, search } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (from && typeof from === 'string' && from.trim()) {
      conditions.push(`expense_date >= $${paramIdx++}`);
      values.push(from.trim());
    }

    if (to && typeof to === 'string' && to.trim()) {
      conditions.push(`expense_date <= $${paramIdx++}`);
      values.push(to.trim());
    }

    if (person && typeof person === 'string' && ALLOWED_FRIENDS.includes(person as FriendName)) {
      conditions.push(`person_name = $${paramIdx++}`);
      values.push(person);
    }

    if (search && typeof search === 'string' && search.trim()) {
      conditions.push(`description ILIKE $${paramIdx++}`);
      values.push(`%${search.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const listQuery = `
      SELECT 
        id, 
        person_name, 
        description, 
        amount::float as amount, 
        expense_date::text as expense_date, 
        day_of_week, 
        category, 
        created_at, 
        updated_at
      FROM expenses
      ${whereClause}
      ORDER BY expense_date DESC, id DESC
    `;

    const { rows: expenses } = await pool.query<Expense>(listQuery, values);

    // Calculate totals for the filtered results
    let filteredTotal = 0;
    const friendTotals: Record<FriendName, number> = {
      'Vikash Meena': 0,
      'Devendra Singh': 0,
      'Kamlesh Meena': 0
    };

    expenses.forEach((item) => {
      filteredTotal += item.amount;
      if (item.person_name in friendTotals) {
        friendTotals[item.person_name] += item.amount;
      }
    });

    filteredTotal = Number(filteredTotal.toFixed(2));
    Object.keys(friendTotals).forEach((k) => {
      friendTotals[k as FriendName] = Number(friendTotals[k as FriendName].toFixed(2));
    });

    const settlement = calculateSettlement(friendTotals, filteredTotal);

    res.json({
      count: expenses.length,
      filteredTotal,
      friendTotals,
      settlement,
      expenses
    });
  } catch (err: any) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses', details: err.message });
  }
});

/**
 * POST /api/expenses
 * Add a new expense
 */
app.post('/api/expenses', async (req: Request, res: Response) => {
  try {
    const { person_name, description, amount, expense_date, category } = req.body;

    if (!person_name || !ALLOWED_FRIENDS.includes(person_name)) {
      return res.status(400).json({
        error: `Invalid person name. Allowed: ${ALLOWED_FRIENDS.join(', ')}`
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Item description is required' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Date defaults to today's local date (YYYY-MM-DD)
    let finalDate = expense_date;
    if (!finalDate || !/^\d{4}-\d{2}-\d{2}$/.test(finalDate)) {
      const now = new Date();
      finalDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // Compute automatic day of the week
    const day_of_week = getDayOfWeekFromDate(finalDate);
    const finalCategory = category?.trim() || 'General';

    const insertQuery = `
      INSERT INTO expenses (person_name, description, amount, expense_date, day_of_week, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, 
        person_name, 
        description, 
        amount::float as amount, 
        expense_date::text as expense_date, 
        day_of_week, 
        category, 
        created_at, 
        updated_at
    `;

    const { rows } = await pool.query<Expense>(insertQuery, [
      person_name,
      description.trim(),
      numericAmount,
      finalDate,
      day_of_week,
      finalCategory
    ]);

    res.status(201).json({
      message: 'Expense added successfully',
      expense: rows[0]
    });
  } catch (err: any) {
    console.error('Error adding expense:', err);
    res.status(500).json({ error: 'Failed to add expense', details: err.message });
  }
});

/**
 * PUT /api/expenses/:id
 * Update an existing expense
 */
app.put('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const { person_name, description, amount, expense_date, category } = req.body;

    if (person_name && !ALLOWED_FRIENDS.includes(person_name)) {
      return res.status(400).json({
        error: `Invalid person name. Allowed: ${ALLOWED_FRIENDS.join(', ')}`
      });
    }

    const numericAmount = amount ? parseFloat(amount) : undefined;
    if (numericAmount !== undefined && (isNaN(numericAmount) || numericAmount <= 0)) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    let day_of_week: string | undefined = undefined;
    if (expense_date) {
      day_of_week = getDayOfWeekFromDate(expense_date);
    }

    const updateQuery = `
      UPDATE expenses
      SET 
        person_name = COALESCE($1, person_name),
        description = COALESCE($2, description),
        amount = COALESCE($3, amount),
        expense_date = COALESCE($4, expense_date),
        day_of_week = COALESCE($5, day_of_week),
        category = COALESCE($6, category),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING 
        id, 
        person_name, 
        description, 
        amount::float as amount, 
        expense_date::text as expense_date, 
        day_of_week, 
        category, 
        created_at, 
        updated_at
    `;

    const { rows } = await pool.query<Expense>(updateQuery, [
      person_name || null,
      description?.trim() || null,
      numericAmount || null,
      expense_date || null,
      day_of_week || null,
      category || null,
      id
    ]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Expense not found' });
    }

    res.json({
      message: 'Expense updated successfully',
      expense: rows[0]
    });
  } catch (err: any) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Failed to update expense', details: err.message });
  }
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense
 */
app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully', id });
  } catch (err: any) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Failed to delete expense', details: err.message });
  }
});

/**
 * GET /api/stats
 * Complete analytics for dashboard & charts with optional date filtering (from & to)
 */
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (from && typeof from === 'string' && from.trim()) {
      conditions.push(`expense_date >= $${paramIdx++}`);
      values.push(from.trim());
    }

    if (to && typeof to === 'string' && to.trim()) {
      conditions.push(`expense_date <= $${paramIdx++}`);
      values.push(to.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Friend breakdown for this date range
    const friendQuery = `
      SELECT 
        person_name,
        COUNT(*)::int as count,
        COALESCE(SUM(amount), 0)::float as total
      FROM expenses
      ${whereClause}
      GROUP BY person_name
    `;
    const { rows: friendRows } = await pool.query(friendQuery, values);

    let totalAmount = 0;
    let totalCount = 0;
    const totals: Record<FriendName, number> = {
      'Vikash Meena': 0,
      'Devendra Singh': 0,
      'Kamlesh Meena': 0
    };
    const counts: Record<FriendName, number> = {
      'Vikash Meena': 0,
      'Devendra Singh': 0,
      'Kamlesh Meena': 0
    };

    friendRows.forEach((r: any) => {
      const name = r.person_name as FriendName;
      if (name in totals) {
        totals[name] = r.total;
        counts[name] = r.count;
        totalAmount += r.total;
        totalCount += r.count;
      }
    });

    totalAmount = Number(totalAmount.toFixed(2));
    const perPersonShare = Number((totalAmount / ALLOWED_FRIENDS.length).toFixed(2));

    const breakdown: any = {};
    ALLOWED_FRIENDS.forEach((f) => {
      const total = totals[f];
      const count = counts[f];
      const percentage = totalAmount > 0 ? Number(((total / totalAmount) * 100).toFixed(1)) : 0;
      breakdown[f] = { total, count, percentage };
    });

    // Settlement
    const settlement = calculateSettlement(totals, totalAmount);

    // 2. Breakdown by Day of Week for this range
    const dayQuery = `
      SELECT 
        day_of_week as day, 
        COALESCE(SUM(amount), 0)::float as amount
      FROM expenses
      ${whereClause}
      GROUP BY day_of_week
    `;
    const { rows: dayRows } = await pool.query(dayQuery, values);

    const dayMap: Record<string, number> = {};
    DAYS_OF_WEEK.forEach((d) => (dayMap[d] = 0));
    dayRows.forEach((r: any) => {
      if (dayMap[r.day] !== undefined) {
        dayMap[r.day] = r.amount;
      }
    });
    const byDayOfWeek = DAYS_OF_WEEK.map((day) => ({
      day,
      amount: Number(dayMap[day].toFixed(2))
    }));

    // 3. Breakdown by Month (last 12 months)
    const monthQuery = `
      SELECT 
        TO_CHAR(expense_date, 'Mon YYYY') as month,
        DATE_TRUNC('month', expense_date) as m_order,
        COALESCE(SUM(amount), 0)::float as amount
      FROM expenses
      ${whereClause}
      GROUP BY TO_CHAR(expense_date, 'Mon YYYY'), DATE_TRUNC('month', expense_date)
      ORDER BY m_order ASC
      LIMIT 12
    `;
    const { rows: monthRows } = await pool.query(monthQuery, values);
    const byMonth = monthRows.map((r: any) => ({
      month: r.month,
      amount: Number(r.amount.toFixed(2))
    }));

    // 4. Recent expenses for this range
    const recentQuery = `
      SELECT 
        id, 
        person_name, 
        description, 
        amount::float as amount, 
        expense_date::text as expense_date, 
        day_of_week, 
        category, 
        created_at, 
        updated_at
      FROM expenses
      ${whereClause}
      ORDER BY expense_date DESC, id DESC
      LIMIT 10
    `;
    const { rows: recentExpenses } = await pool.query(recentQuery, values);

    const response: StatsResponse = {
      totalAmount,
      totalCount,
      perPersonShare,
      breakdown,
      settlement,
      byDayOfWeek,
      byMonth,
      recentExpenses
    };

    res.json(response);
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

// Fallback to React index.html for client-side routing
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Start server and initialize DB
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Maintenance Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
