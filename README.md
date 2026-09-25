# SalesMatrix Studio 📊
### Interactive Multi-Dimensional Sales Intelligence & Financial Analytics Platform

SalesMatrix Studio is an enterprise-grade Business Intelligence (BI) dashboard designed to transform raw transaction datasets into executive financial statements, multi-dimensional charts, dynamic pivot tables, and AI-powered strategic briefings.

---

## 🌟 Key Features

### 1. Executive P&L Financial Performance (5 Core Metrics)
Instant clarity on corporate revenue flow from topline sales down to net retained earnings:
- **Total Sales**: Gross commercial revenue generated across all closed transactions.
- **Cost of Goods Sold (COGS)**: Direct production, hosting, licensing, and fulfillment costs.
- **Gross Profit**: `Total Sales − COGS` along with Gross Margin %.
- **Operating Expenses (OPEX)**: Sales commissions, marketing spend, distribution, and operational overhead.
- **Net Profit**: `Gross Profit − OPEX` representing bottom-line profit and Net Margin %.
- **Interactive P&L Flow Bar**: Visual mathematical waterfall showing the step-by-step reduction of costs.

### 2. 9 Multi-Dimensional Analytic Perspectives
1. **Executive Overview**: High-level revenue vs. profit timelines, regional and category shares, and top performers.
2. **Trends & Time Series**: Monthly and quarterly sales momentum with MoM / YoY growth tracking.
3. **Categories & Products**: Category breakdowns with 80/20 Pareto cumulative distribution analysis.
4. **Geographic Matrix**: Regional revenue concentration, territory margins, and market comparison.
5. **Sales Team Leaderboard**: Rep revenue rankings, win rates, deal counts, and average transaction sizes.
6. **Financial & Income Statement**: Dedicated P&L financial statement ledger, discount-vs-margin scatter plot, and deal size brackets.
7. **Dynamic 2D Pivot Table**: Drag-and-drop cross-tabulation with customizable row/column dimensions and aggregations (`sum`, `avg`, `count`, `min`, `max`).
8. **Custom Chart Studio**: Build your own charts on the fly (Bar, Line, Area, Pie, Donut, Scatter, Radar, Composed) with custom metrics.
9. **Raw Data Explorer**: High-performance transaction table with search, pagination, multi-column sorting, and CSV export.

### 3. Intelligent CSV Ingestion Engine
- **RFC-4180 Compliant Parser**: Handles quoted fields, line breaks inside cells, currency symbols (`$`, `€`, `£`), and percentage signs.
- **Dynamic Schema Detection**: Automatically infers dimension columns, date formats, and numeric metrics.
- **Drag-and-Drop or Copy-Paste**: Upload `.csv` files or paste tabular data directly from Excel or Google Sheets.

### 4. Cloud Persistence & User Authentication (Supabase)
- **Email & Password Authentication**: Secure Sign In and Sign Up with automatic session handling.
- **Dashboard Snapshots**: Save customized datasets, active views, and filter states to Supabase.
- **Saved Dashboards Drawer**: Browse, load, or delete previous snapshots with 1 click.
- **Row Level Security (RLS)**: Enforces strict tenant isolation so users only access their own data.
- **Zero-Crash Fallback**: App remains 100% functional with local demo data even if Supabase keys are unconfigured.

### 5. AI Executive Analyst (Gemini Integration)
- **Live Statistical Synthesis**: Automatically highlights the leading revenue drivers, territory anchors, and margin health directly on the overview.
- **"Ask AI Analyst" Modal**: Query data in plain English (*"How can we improve margin in Europe?"*, *"Analyze Q4 discount risks"*).
- **Executive Strategic Briefings**: Produces concise bullet-point briefings with tactical recommendations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Data Visualization**: Recharts (Responsive SVG charts, Area, Bar, Scatter, Composed)
- **Backend / API**: Node.js, Express, TSX
- **Database & Auth**: Supabase (`@supabase/supabase-js`, PostgreSQL, Row Level Security)
- **AI Intelligence**: Google Gemini API (`@google/genai`)
- **Build Tool**: Vite

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ installed on your machine
- (Optional) A free [Supabase](https://supabase.com) account

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd salesmatrix-studio
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` (or configure via the in-app **Setup / Keys** modal):

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Supabase Configuration (Optional for Cloud Persistence)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Gemini API Key (Optional for Server-side AI Analyst)
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

### 4. Start the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase SQL Schema

To enable user dashboard saving and loading, run this SQL script in your **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Create the dashboards persistence table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can view their own dashboards
CREATE POLICY "Users can view own dashboards"
ON public.dashboards
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Policy: Users can insert their own dashboards
CREATE POLICY "Users can insert own dashboards"
ON public.dashboards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Users can update their own dashboards
CREATE POLICY "Users can update own dashboards"
ON public.dashboards
FOR UPDATE
USING (auth.uid() = user_id);

-- 6. Policy: Users can delete their own dashboards
CREATE POLICY "Users can delete own dashboards"
ON public.dashboards
FOR DELETE
USING (auth.uid() = user_id);
```

---

## 📁 Project Architecture

```
├── .env.example                     # Environment template
├── index.html                       # HTML5 entry with metadata
├── package.json                     # Dependencies & scripts
├── server.ts                        # Express server & Gemini AI API proxy
├── src/
│   ├── App.tsx                      # Root component, state & views coordinator
│   ├── main.tsx                     # React DOM entry
│   ├── supabaseClient.ts            # Supabase SDK client & persistence helpers
│   ├── types.ts                     # TypeScript data interfaces & types
│   ├── components/
│   │   ├── Navbar.tsx               # Top header, auth badges & drawer triggers
│   │   ├── KPICards.tsx             # 5 Core Financial Cards & P&L Flow Bar
│   │   ├── FilterBar.tsx            # Multi-dimensional filter controls
│   │   ├── NavigationTabs.tsx       # 9 visual perspective tabs
│   │   ├── AuthModal.tsx            # Sign in, sign up & Supabase settings
│   │   ├── SavedDashboardsModal.tsx # Snapshot manager & SQL schema drawer
│   │   ├── DataUploadModal.tsx      # CSV drag-and-drop & parser
│   │   ├── AIInsightsModal.tsx      # Interactive AI Analyst interface
│   │   └── views/
│   │       ├── OverviewView.tsx     # Executive Overview & Live synthesis
│   │       ├── TrendsView.tsx       # Time-series & growth rates
│   │       ├── CategoriesView.tsx   # Product breakdowns & Pareto 80/20
│   │       ├── GeographicView.tsx   # Regional matrix & territory comparisons
│   │       ├── TeamView.tsx         # Sales representative leaderboard
│   │       ├── FinancialView.tsx    # Formal P&L Statement & scatter plot
│   │       ├── PivotView.tsx        # 2D cross-tabulation engine
│   │       ├── ChartStudioView.tsx  # Custom visualization builder
│   │       └── DataTableView.tsx    # Raw tabular view with sorting & search
│   ├── data/
│   │   └── defaultSalesData.ts      # Pre-loaded baseline enterprise dataset
│   └── utils/
│       ├── csvParser.ts             # RFC-4180 CSV parsing & normalization
│       └── dataAnalytics.ts         # P&L formulas, KPI calculators & formatters
```

---

## 📄 License
MIT License. Free for commercial and non-commercial use.
