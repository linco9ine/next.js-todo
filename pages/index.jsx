import Dashboard from "@/components/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
    return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
    );
}