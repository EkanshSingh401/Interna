# Interna

Production SaaS platform for identity management, workflow coordination, and subscription automation.

## Problem

Teams need reliable infrastructure for authentication, access control, and workflow state management. Many systems struggle to coordinate user identity, permissions, and operational workflows across applications.

## Solution

Interna is a production SaaS platform designed to manage identity, access control, and workflow state for collaborative environments. The platform provides authentication, relational data modeling, and automated subscription management.

## Architecture

Interna uses a modern web stack and cloud infrastructure to support secure user authentication and scalable data workflows.

**Frontend**  
React + TypeScript

**Backend**  
Supabase database and authentication

**Infrastructure**  
Stripe subscription billing and webhook lifecycle automation

## Key Features

- User authentication and account lifecycle management  
- Relational data models for workflow state  
- Role-based access control  
- Subscription billing and webhook automation  
- Structured logging and operational monitoring  

## Results

- 100+ active users  
- Production SaaS deployment  
- Hundreds of billing and account lifecycle events processed monthly  

## Tech Stack

TypeScript  
React  
Supabase  
Stripe  
SQL  

## System Flow

User  
↓  
React / Next.js Frontend  
↓  
Supabase API & Authentication  
↓  
PostgreSQL Database  
↓  
Stripe Billing & Webhook Automation  

## Repository Structure

landing_ui/  
 ├ app/          Next.js application routes and pages  
 ├ components/   Reusable UI components  
 ├ hooks/        Custom React hooks  
 ├ lib/          Shared utilities and services  
 ├ templates/    UI layout templates  
 ├ public/       Static assets  
 └ styles/       Global styles  

## Running the Project

1. Clone the repository

git clone https://github.com/EkanshSingh401/interna.git

2. Install dependencies

npm install

3. Start the development server

npm run dev

4. Open the application

http://localhost:3000
