import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_marketing/')({ component: App });

function App() {
  return <div>{import.meta.env.VITE_APP_NAME}</div>;
}
