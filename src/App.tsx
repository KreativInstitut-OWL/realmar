import { QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "./components/AppLayout";
import { Toaster } from "./components/ui/sonner";
import { queryClient } from "./store/query-client";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
