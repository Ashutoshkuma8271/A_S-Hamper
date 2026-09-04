# 🎁 A_S Hamper - Luxury Bespoke Gift Studio

An enterprise-grade, full-stack luxury gift hamper e-commerce platform crafted with **React, TypeScript, Vite, Tailwind CSS, Supabase PostgreSQL & Auth, Cloudinary Media CDN, and Razorpay Gateway**.

---

## 🌟 Key Features

- 🎀 **100% Full-Bleed Luxury Hero Slider**: Interactive multi-slide banner with smooth touch gestures, dynamic theme cross-fades, and 4-pillar trust badging.
- 🎨 **Artisan Bespoke Customizer ("Build Your Own")**: Interactive 3-step basket, treats, and wax-sealed note builder with live pricing calculator.
- 🛒 **Unified Shopping Experience**:
  - Quick-view modals and interactive category filters (Birthday, Anniversary, Wedding, Baby Shower, Corporate, Festival, Valentine, Luxury).
  - One-click "Add to Cart" with instant authentication modal interception for guest visitors.
  - Interactive Wishlist sync with localStorage and Supabase persistence.
- 🏢 **Corporate & Bulk Inquiries**: Dedicated B2B gifting module with RFQ form, volume discount tiers, and GST invoicing support.
- 💳 **Razorpay & Multi-Payment Integration**: Fully responsive checkout supporting Razorpay Gateway, UPI Instant, Cards, Net Banking, and COD.
- 🛡️ **Role-Based Single-Admin Security**: Robust PostgreSQL row-level security (RLS), single-admin database trigger (`check_single_admin`), vendor management portal, and order management dashboard.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Hot Toast
- **Database & Auth**: Supabase (PostgreSQL, Realtime, Row Level Security, Edge Functions)
- **Payment Processing**: Razorpay Web SDK
- **Media CDN**: Cloudinary
- **Email & Alerts**: Brevo SMTP API

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Ashutoshkuma8271/A_S-Hamper.git
cd A_S-Hamper
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Supabase Database & Auth
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Razorpay Gateway
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id

# Cloudinary CDN
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 📄 License
MIT © A_S Hamper Studio. Hand-packed with care.
