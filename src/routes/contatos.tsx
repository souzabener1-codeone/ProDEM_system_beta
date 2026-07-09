import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/contatos")({
  component: ContatosLayout,
});

function ContatosLayout() {
  return <Outlet />;
}
