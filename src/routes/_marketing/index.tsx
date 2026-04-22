import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';

export const Route = createFileRoute('/_marketing/')({
  head: () => ({
    meta: [{ title: pageTitle() }],
  }),
  component: App,
});

function App() {
  return <div>{import.meta.env.VITE_APP_NAME}</div>;
}
