# EV Station-based Rental System 🚗⚡

A comprehensive software solution for managing electric vehicle (EV) rentals at fixed stations. This system connects **EV Renters**, **Station Staff**, and **Administrators** to streamline the process of booking, handing over, returning, and managing the EV fleet.

## 📖 Overview

The **EV Station-based Rental System** is designed to handle the end-to-end workflow of renting electric vehicles. Users can book vehicles via an app, pick them up at specific stations after staff verification, and return them upon completion. The system also provides powerful tools for fleet management, staff coordination, and AI-driven analytics.

## 🌟 Key Features

### 1. For EV Renters
* **Registration & Verification:**
    * Create accounts and upload necessary documents (Driving License, ID/Passport).
    * Quick identity verification via station staff.
* **Booking:**
    * Search for rental stations via an interactive map.
    * View available vehicles with details (Type, Battery level, Price).
    * Pre-book a vehicle or rent directly at the station (Walk-in).
* **Vehicle Pickup:**
    * Check-in via QR code/App at the counter.
    * Sign electronic contracts (E-contracts).
    * Confirm vehicle condition and handover with staff (including photo evidence).
* **Vehicle Return:**
    * Return the vehicle to the designated station.
    * Joint inspection with staff to confirm condition.
    * Automatic cost calculation (including incurred fees).
* **History & Personal Analytics:**
    * View past trip history, costs, and mileage.
    * Usage statistics (Rental frequency, peak/off-peak usage).

### 2. For Station Staff
* **Handover & Return Management:**
    * View lists of available, reserved, and currently rented vehicles.
    * Execute handover procedures: Check vehicle, take photos, update status.
    * Digital confirmation with customers during pickup/return.
* **Customer Verification:**
    * Verify physical Driving Licenses & IDs against the system data.
* **On-site Payment:**
    * Process rental payments or deposits directly at the station.
    * Handle refunds if applicable.
* **Station Management:**
    * Update battery status and technical condition of vehicles.
    * Report incidents or breakdowns to the Admin.

### 3. For Administrators (Web Dashboard) 💻
* **Fleet & Station Management:**
    * Monitor vehicle quantity per station.
    * Track rental history and real-time vehicle status.
    * Coordinate staff and redistribute vehicles during high demand.
* **Customer Management:**
    * Manage customer profiles, rental history, and complaints.
    * "High Risk" customer list (Violations, damages).
* **Staff Management:**
    * Manage staff lists per station.
    * Track performance metrics (Handover counts, Customer satisfaction ratings).
* **Reports & Analytics:**
    * Revenue reports by station.
    * Usage rates and peak hour analysis.
    * **AI Suggestions:** Forecast demand to suggest fleet upgrades or redistribution.

## 🚀 Workflow Summary

1.  **Booking:** Renter finds a station and books an EV.
2.  **Pickup:** Renter arrives at the station. Staff verifies ID and vehicle condition. Both parties sign the E-contract.
3.  **Ride:** Renter uses the vehicle.
4.  **Return:** Renter returns the vehicle. Staff inspects for damages.
5.  **Payment:** System calculates the final fee. Renter pays via App or at the counter.

## 🛠 Tech Stack (Suggested)
*(Note: You can update this section based on your actual implementation)*

* **Mobile App (Renter):** React Native
* **Web Portal (Staff/Admin):** React.js
* **Backend:** Java (Spring Boot)
* **Database:** SQL Server
