import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { Toast } from '@/components/selia/toast';
import { NotFound } from '@/components/shared/not-found';
import { getSession } from '@/functions/auth';
import { getActiveOrganization, getTeams } from '@/functions/team';
import { getUserSettings } from '@/functions/settings';
import type { Theme } from '@/lib/theme';
import { pageTitle } from '@/lib/utils';
import { QueryClient } from '@tanstack/react-query';

import appCss from '../styles.css?url';

function getThemeInitScript(serverTheme?: string) {
  return `(function(){try{var s="${serverTheme || ''}";var stored=window.localStorage.getItem('theme');var mode=s==='light'||s==='dark'||s==='auto'?s:(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;window.localStorage.setItem('theme',mode);}catch(e){}})();`;
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async () => {
    const session = await getSession();
    const settings = session ? await getUserSettings() : {};
    const [activeOrganization, teams] = session
      ? await Promise.all([getActiveOrganization(), getTeams()])
      : [null, []];
    return { session, settings, activeOrganization, teams: teams ?? [] };
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: pageTitle(),
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { settings } = useRouteContext({ from: '__root__' });
  const theme = settings?.theme as Theme | undefined;

  return (
    <html
      lang="en"
      className={theme && theme !== 'auto' ? theme : undefined}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getThemeInitScript(theme) }}
        />
        <HeadContent />
      </head>
      <body
        className="font-sans antialiased selection:bg-primary selection:text-primary-foreground"
        suppressHydrationWarning
      >
        <div className="root">{children}</div>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Toast />
        <Scripts />
      </body>
    </html>
  );
}
