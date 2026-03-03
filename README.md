# 🌿 Gramika Marketplace

Welcome to the **Gramika Website** source code! Gramika is a modern, responsive, full-stack B2B and B2C ecommerce marketplace designed to seamlessly connect local agricultural and homemade goods producers (like poultry farmers, vegetable growers, and bakers) directly with everyday buyers. 

This repository contains the completed integrated ecosystem powered by a Node/Express backend and a beautifully designed React frontend.

## 🚀 Live Demo

You can view and interact with the live deployed application here:
👉 **[View Gramika Live on Vercel](https://gramika-website-kamd.vercel.app/)**

> *(Note: The backend databases and authentication run securely on `https://gramika-website.onrender.com`)*

## 🛠 Features Included
- **Comprehensive User Auth:** Safe purchasing alongside verification pipelines for official Sellers.
- **My Shop & File Uploads:** Registered Sellers have custom dashboards allowing inventory stock updates and high-quality image uploads. 
- **Modern Responsive Design:** A rich UI system utilizing fluid Flexboxes and fully responsive data-tables, scaling flawlessly from desktop to smartphones. 
- **Admin Dashboard:** Robust super-admin dashboard for user moderation, approving seller identification assets, tracking dynamic sales trends over time utilizing active dual-axis charting, and monitoring overall shop stability.
- **Dynamic Charting:** Complete administrative business intelligence powered by `recharts`.
- **Smooth Cart Interaction:** Optimized synchronized shopping cart interfaces.

## 💾 Local Development 
To host this ecosystem locally for development, ensure `mongodb` is accessible or map a Mongo string to `MONGO_URI` across `.env` instances. 
Navigate to `server\` and run `npm run dev`. Then on the project root, run `npm run dev`.
