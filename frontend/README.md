# MirTech Assessment - Frontend

This is the frontend portion of the High-Performance Data Table application, built with [Next.js](https://nextjs.org) (App Router), Tailwind CSS, TanStack Table v8, and `@tanstack/react-virtual` for advanced DOM virtualization.

## 🚀 Getting Started Locally (Native)

If you prefer to run the frontend independently of Docker, ensure you have Node.js installed, then follow these steps:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   The frontend automatically connects to the backend API. If you need to customize the backend URL, ensure the following is set in a `.env` file at the root of the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

Here is a breakdown of the core frontend architecture:

*   **`src/app/`**: The Next.js 14+ App Router directory.
    *   `page.tsx`: The main entry point rendering the data table grid and overarching layout.
    *   `layout.tsx`: The global application layout, containing shared metadata and fonts.
    *   `globals.css`: Global Tailwind CSS directives and root styling.
    *   `items/[id]/page.tsx`: The dynamic routing component for the detailed view of individual products.
*   **`src/components/`**: Reusable Next.js React UI components.
    *   `data-table.tsx`: The crux of the application. This component handles the TanStack Table initialization, coordinates the API fetching logic (with debouncing, pagination, sorting, and filtering), and governs the `@tanstack/react-virtual` DOM mapper to ensure 100,000+ rows render smoothly.
    *   `ui/`: Generic, reusable UI elements (e.g., highly stylized Skeleton pulse animations).
*   **`src/lib/`**: Utility functions (such as `cn` for dynamic Tailwind class construction using `clsx` and `tailwind-merge`).

---

## 🐳 Docker Setup

While this frontend can be run independently via `npm`, it is architected to be orchestrated seamlessly alongside its backend services using Docker.

The root repository contains a master `docker-compose.yml` file that inherently links this Next.js container securely to the internal API network.

### Running the Full Stack via Docker

To run the complete integrated stack (Frontend, Backend, Redis Cache, Postgres DB) locally:

```bash
# Navigate out to the root of the repository
cd ..

# Build and start all containers simultaneously
docker-compose up --build
```

### Docker Architectural Design
*   **Production Readiness:** The provided `Dockerfile` contained within this directory executes a multi-stage build, generating a highly optimized, lightweight Node.js production container.
*   **Volume Mounting:** During local `docker-compose` orchestration, the internal container volumes are intelligently mapped. This ensures that any adjustments made to code within this `frontend/` directory trigger instant Hot Module Replacement (HMR) directly into the running Docker container, meaning you never have to turn it off and rebuild it while coding.
*   **Port Mapping:** The container explicitly maps port `3000` outwards, allowing you to access the bridged Next.js application at `http://localhost:3000` securely.
