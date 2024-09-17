# Billing Service - Technical Overview

This document provides an overview of the core components and services involved in the Billing system, detailing their respective roles and functionalities. Each service corresponds to specific TypeScript files in the codebase, as outlined below.

## Components Overview

### 1. `BillingSubscriptionService.ts` - Subscription Management in RAM
The `BillingSubscriptionService` is responsible for managing subscription data in RAM (memory). It allows fast access to subscription information without frequent database queries, enhancing performance for subscription-related operations.

**Key Responsibilities:**
- **Store subscriptions in memory** for fast access.
- **Query subscriptions from RAM** to reduce the need for database hits.
- Provide **utility methods** for fetching and managing subscription data.

This service ensures low-latency access to subscription data, optimizing performance when dealing with large volumes of requests.

### 2. `BillingSubscriptionSyncService.ts` - Subscription Synchronization
The `BillingSubscriptionSyncService` is responsible for synchronizing the in-memory subscription data with the database. It listens for database changes and updates the in-memory cache accordingly, ensuring consistency between the two.

**Key Responsibilities:**
- Listen for **database changes** (using Mongoose post-process hooks).
- **Update RAM** when new subscriptions are added, updated, or removed from the database.
- Provide methods to **manually synchronize** RAM with the database if necessary.

This service ensures that the in-memory data is always up to date with the source of truth, the database.

### 3. `BillingSubscriptionCleanRefresh.ts` - Memory Cleanup
The `BillingSubscriptionCleanRefresh` service runs as a background process to ensure that the in-memory subscription data remains consistent with the database. It periodically cleans up old or invalid data that may no longer be relevant.

**Key Responsibilities:**
- Use a **cron job** to run at scheduled intervals.
- Validate the **accuracy of in-memory subscriptions** against the database.
- **Remove stale or invalid subscriptions** from memory.

This process ensures that the memory does not hold outdated data, maintaining the reliability of the cached subscription information.

### 4. `StripeSubscriptionSyncService.ts` - Stripe Integration
The `StripeSubscriptionSyncService` handles communication between the billing system and Stripe, listening for events that affect subscriptions, such as creation, updates, or deletions.

**Key Responsibilities:**
- **Listen to Stripe events**: subscription creation, update, and deletion.
- **Update in-memory subscriptions** when Stripe events are received.
- Manage **automatic subscription updates** based on real-time Stripe webhook notifications.

This service ensures that external subscription changes from Stripe are reflected in the system promptly and automatically.

### 5. API Interface
The Billing Service exposes a set of RESTful API routes for interacting with the services described above. These routes allow for manual operations, such as updating subscriptions, querying data, or forcing a synchronization between the RAM and the database.

**Key Responsibilities:**
- Provide **REST API routes** for manual interactions.
- Allow developers to **manually manage subscriptions** via API calls.
- Facilitate **manual synchronization** and validation of data.

## Flow Overview

```mermaid
graph TD
    A[Request to Billing API] -->|Calls API| B[Billing Subs Service]
    B -->|Fetches Data from RAM| E[Subs Response]
    B -->|Miss in RAM or Manual Sync| C[Database]
    C -->|Updates Data| B
    F[Stripe Subs Sync Service] -->|Stripe Event| B
    D[Billing Subs Clean&Refresh] -->|Scheduled Check| B
    G[Billing Subs Sync Service] -->|Database Changes| B
