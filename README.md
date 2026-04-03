# HouseMedi - Patient-First Clinical Registry

A modern, patient-centric clinical management system designed for doctors to manage subjects, document medical notes, and store clinical assets (X-rays, Blood reports, Lab results).

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Supabase Account

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/cbow-hacksagon/frontend.git
cd frontend

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(You can use `.env.example` as a template)*

### 4. Supabase Database Setup
Run the following SQL in your Supabase SQL Editor to initialize the required tables and columns:

```sql
-- Create Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    age INT,
    sex TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Cases Table (with 'notes' support)
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id),
    doctor_id UUID REFERENCES auth.users(id),
    notes TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Reports Table (for file attachments)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id),
    patient_id UUID REFERENCES public.patients(id),
    doctor_id UUID REFERENCES auth.users(id),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    category TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- IMPORTANT: Disable RLS for easy setup (or add your own policies)
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
```

### 5. Supabase Storage Setup
1.  Go to **Storage** in your Supabase Dashboard.
2.  Create a new bucket named **`reports`**.
3.  Set the bucket to **Public**.
4.  Add a policy to "**Allow all operations for authenticated users**" (or just allow public access for testing).

### 6. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 🛠️ Features
- **Patient Registry**: Search and filter subjects by name or location.
- **Clinical Records**: Document symptoms and observations in a clean, persistent text interface.
- **Asset Uploads**: Dedicated slots for X-rays, Blood reports, and Laboratory results.
- **History Feed**: Chronological log of all patient interactions and medical files.

## 🤝 Contributing
Feel free to fork this project and submit pull requests. For major changes, please open an issue first.

---
Built with ❤️ for Clinical Excellence.
