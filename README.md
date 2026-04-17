# 🏛️ E-TaxPay | Digital Tax Collection System

**E-TaxPay** is a full-stack digital tax collection platform built for the **Uttarakhand Zila Panchayat** to modernize shop-tax management, complaint handling, and government notice publication across **13 districts**.

---

## 📱📥 Download  
➡️ **E-TaxPay Android APK**  
*(Add your download link here)*

---

## 🚀 Key Features

### 🌐 Admin Dashboard
- Real-time analytics & district-wise revenue metrics  
- Dashboard graphs & tax insights  

### 🧾 Taxpayer Panel
- Secure login for shop owners  
- View pending taxes  
- Pay tax online using Razorpay  

### 📰 Government Notices & Updates
- Admin can publish official updates  
- District-wise notification system  

### 🛠️ Complaint Management System
- Users can raise complaints  
- Track complaint status in real time  

### 🗣️ Multilingual Support
- Fully available in **Hindi** and **English**  
- Implemented using **i18next**

---

## 🛠️ Technology Stack

### 🔹 Frontend
- React.js (Vite)  
- Framer Motion (Animations)  
- i18next (Multilingual)  
- Supabase JS Client (Auth + Realtime)

### 🔹 Backend
- Node.js + Express  
- Supabase (PostgreSQL + Auth)  
- Razorpay (Payment Gateway)  
- Nodemailer (Auto Email Alerts)

---

## 📂 Project Structure
```bash
e-taxpay/
├── frontend/   # React + Vite application
│   ├── src/assets/    # Images & Brand Identity (Uttarakhand Emblem)
│   ├── src/components/# Reusable UI Components
│   └── public/        # Static assets (Favicons)
├── backend/           # Node.js Server
│   ├── src/controllers/# Business Logic
│   └── src/routes/     # API Endpoints
└── supabase/          # Database Schemas & SQL migrations

---
```
##  🔧 Installation & Setup 


## 1️⃣ Clone the Repository
```bash
git clone https://github.com/raja393-disigner/Major-Project.git

---
## 2️⃣ Setup Frontend
```
```bash
cd frontend
npm install
npm run dev

## 3️⃣ Setup Backend
```
```bash
cd ../backend
npm install

# Add your .env credentials here
npm run dev


🛡️ Admin Credentials
Supports Super Admin + District Admins (13 districts of Uttarakhand)

Super Admin ID: super****
Default Password: super******
Master Passkey: ADMIN*****

🚩 Disclaimer

This project is part of a digital transformation initiative for the Uttarakhand region.
All government emblems, logos, and branding are used strictly for official representation.

