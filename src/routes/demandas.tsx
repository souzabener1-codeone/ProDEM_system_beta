import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/demandas")({
  component: DemandasLayout,
});

function DemandasLayout() {
  return <Outlet />;
}
