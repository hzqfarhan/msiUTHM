# MSI UTHM Companion Web App 🕌

Welcome to the **MSI UTHM Companion** repository! This is a modern, community-focused web application built for **Masjid Sultan Ibrahim (MSI)** at Universiti Tun Hussein Onn Malaysia (UTHM).

## 🌟 Why This Was Built

The **MSI UTHM Companion** was created to bridge the gap between the mosque administration and the local community, especially the students. Traditionally, information about prayer times, upcoming events, and mosque facilities was scattered or difficult to access. 

This central hub aims to:
- Provide accurate, location-based prayer times and Iqamah countdowns.
- Digitize the management of mosque programs, facilities, and volunteer efforts.
- Make it easier for the community to contribute (Infaq) and provide feedback.
- Serve as a blueprint for modernizing mosque management systems everywhere.

---

## ✨ Key Features

### 📅 Waktu Solat & Kompas Qiblat (Prayer Times & Qibla)
- Real-time prayer timings based on JAKIM zones.
- Dynamic Iqamah countdown timers.
- Integrated Qibla compass utilizing device orientation sensors.

![Waktu Solat Screenshot](doc_images/waktu-solat-placeholder.PNG)

### 🕌 Program & Aktiviti (Events & Activities)
- Browse upcoming mosque events with beautiful poster images.
- RSVP to events directly through the app.
- "Add to Calendar" functionality for easy scheduling.

![Program Screenshot](doc_images/program-placeholder.PNG)

### 🏢 Kemudahan (Facilities)
- Explore available mosque facilities (halls, meeting rooms, etc.).
- View facility images, descriptions, and wheelchair accessibility status.

![Kemudahan Screenshot](doc_images/kemudahan-placeholder.PNG)

### 💡 Maklum Balas (Feedback & Reporting)
- Users can report issues (e.g., broken pipes, lighting problems) with photos.
- Track the status of reports as admins acknowledge and resolve them.

### 💖 Infaq & Sumbangan (Donations)
- Easy access to the mosque's DuitNow QR codes and bank details.
- Seamless, secure way for the community to contribute financially.

![Infaq Screenshot](doc_images/infaq-placeholder.PNG)

### 🤖 Pembantu Maya MSIBot (AI Chatbot)
- Integrated AI chatbot (MSIBot) to answer general Islamic questions and provide information about the mosque.

### ⚙️ Panel Admin (Admin Dashboard)
- A comprehensive, secure dashboard for mosque administrators.
- Full CRUD capabilities for adding events, managing facilities, updating donation QR codes, and resolving user feedback.
- Analytics and tracking tools for mosque engagement.

![Admin Panel Screenshot](doc_images/admin-panel-placeholder.PNG)

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom Glassmorphism aesthetic
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Storage)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** Vercel

---

## 🚀 Getting Started Locally

### Prerequisites
1. Node.js 18+ install
2. A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hzqfarhan/MSIUTHM.git
   cd MSIUTHM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📝 License

This project is intended for the community use of Masjid Sultan Ibrahim UTHM. Reach out to the repository owner for licensing queries.
