# EPIX - ED Pharmacy Inventory aXcess

**Emergency Pharmacy Hospital Segamat**

A modern, serverless pharmacy inventory management system built with React, Ant Design, and Supabase.

## 🚀 Features

### Module 1: Drug Locator (Public Access)
- 🔍 Search drugs by name, type, location, or remarks
- 📱 Grid and List view toggle
- 🖼️ Drug images with fallback placeholders
- 📍 Location tracking (Section-Row-Bin)
- 📝 Detailed drug information modal

### Module 2: Indent Management
- 🏥 Section-based filtering (F, G, H, etc.)
- ➕ Add items to indent cart
- 🔄 Real-time inventory updates
- 📊 Visual shelf grid layout

### Module 3: Cart Management
- 📦 Grouped by indent source (IPD, OPD, MFG)
- ✏️ Edit quantities
- 🗑️ Remove items
- ✅ Approve indent requests
- 🖨️ Print-friendly layout

### Module 4: Settings & Administration
- ➕ Add, edit, delete inventory items
- 📸 Upload drug images to Supabase Storage
- 🔍 Filter and sort inventory
- 📋 Complete CRUD operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier works!)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd d:\tmp\pims
npm install
```

### 2. Configure Supabase

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### B. Update Environment Variables
The `.env` file is already configured with your credentials:
```
VITE_SUPABASE_URL=https://kohzqwxfwydtvdkmblez.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### C. Set Up Database
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following scripts in order:

**Step 1: Create Tables**
```sql
-- Copy and paste contents from: supabase/schema.sql
```

**Step 2: Set Up Security**
```sql
-- Copy and paste contents from: supabase/rls_policies.sql
```

**Step 3: Add Sample Data (Optional)**
```sql
-- Copy and paste contents from: supabase/sample_data.sql
```

#### D. Configure Storage (For Image Upload)
1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it: `drug-images`
4. Set it to **Public**
5. Click **Create Bucket**

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 📱 Usage Guide

### For All Users (Public Access)

#### Locator Module
1. Navigate to **Locator** from the sidebar
2. Use the search bar to find drugs
3. Toggle between Grid and List views
4. Click any drug card to view details

### For Pharmacy Staff

#### Creating an Indent
1. Go to **Indent** page
2. Filter by section if needed
3. Click on a drug card
4. Enter quantity
5. Click "Add to Cart"

#### Managing Cart
1. Navigate to **Cart**
2. View items grouped by source (IPD/OPD/MFG)
3. Edit quantities or remove items as needed
4. Click "Approve Indent" when ready
5. Use "Print" for physical documentation

#### Managing Inventory
1. Go to **Settings** → **Inventory Management**
2. Click "Add New Drug" to create entries
3. Edit or delete existing items
4. All changes sync in real-time

#### Uploading Images
1. Go to **Settings** → **Image Upload**
2. Select a drug from the dropdown
3. Drag and drop an image or click to browse
4. Image automatically links to the drug

## 🏗️ Project Structure

```
pims/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── MainLayout.jsx       # Main app layout
│   │   └── DrugCard.jsx             # Reusable drug card
│   ├── pages/
│   │   ├── Locator/
│   │   │   ├── LocatorPage.jsx      # Public drug catalog
│   │   │   └── DrugDetailModal.jsx  # Drug details modal
│   │   ├── Indent/
│   │   │   ├── IndentPage.jsx       # Indent management
│   │   │   └── IndentModal.jsx      # Add to cart modal
│   │   ├── Cart/
│   │   │   └── CartPage.jsx         # Cart management
│   │   └── Settings/
│   │       ├── SettingsPage.jsx     # Settings container
│   │       ├── InventoryTable.jsx   # CRUD table
│   │       └── ImageUploader.jsx    # Image upload
│   ├── lib/
│   │   └── supabase.js              # Supabase client
│   ├── App.jsx                      # Root component
│   └── main.jsx                     # Entry point
├── supabase/
│   ├── schema.sql                   # Database schema
│   ├── rls_policies.sql             # Security policies
│   └── sample_data.sql              # Test data
└── package.json
```

## 🗄️ Database Schema

### inventory_items
- `id` - UUID (Primary Key)
- `name` - Drug name (e.g., "Paracetamol 500mg")
- `type` - Tablet, Injection, Syrup, Eye Drops, Ear Drops, Others
- `section`, `row`, `bin` - Physical location
- `location_code` - Auto-generated (e.g., "F-3-1")
- `min_qty`, `max_qty` - Stock thresholds
- `indent_source` - IPD, OPD, or MFG
- `remarks` - Special notes
- `image_url` - Link to drug image

### indent_requests
- `id` - UUID (Primary Key)
- `item_id` - Foreign key to inventory_items
- `requested_qty` - Quantity requested
- `status` - Pending, Approved, or Completed

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Public read/write access (as per requirements)
- No authentication required
- Supabase handles all security at the database level

## 🎨 Technology Stack

- **Frontend**: React 18 + Vite
- **UI Library**: Ant Design 5.x
- **Backend**: Supabase (PostgreSQL + Storage)
- **Routing**: React Router v6
- **Real-time**: Supabase Realtime (free tier)

## 📝 Notes

- Real-time updates work on Supabase free tier (max 2 concurrent connections per client)
- Image storage is public - suitable for non-sensitive drug images
- Print functionality uses browser's native print dialog
- Mobile-responsive design with collapsible sidebar

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env` file exists and contains valid credentials
- Restart the dev server after changing `.env`

### Images not uploading
- Verify `drug-images` bucket exists in Supabase Storage
- Ensure bucket is set to Public
- Check file size (max 5MB recommended)

### Real-time updates not working
- Check browser console for connection errors
- Verify Supabase project is active
- Free tier has connection limits

## 📄 License

This project is built for Emergency Pharmacy Hospital Segamat.

## 👨‍💻 Support

For issues or questions, please contact the development team.
