import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouteContext, useLocation } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { cn } from '@/lib/utils';
import { Button } from '@/components/selia/button';
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';
import { updateUserSetting } from '@/functions/settings';
import { UserMenu } from '@/components/shared/user-menu';

const LG = 1024;

export function SidebarLayout({
  sidebar,
  children,
  maxWidth = 'max-w-5xl',
  banner,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  banner?: React.ReactNode;
}) {
  const { settings } = useRouteContext({ from: '__root__' });
  const serverSidebar = settings?.sidebar !== 'closed';

  const updateSetting = useServerFn(updateUserSetting);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(serverSidebar);

  useEffect(() => {
    const mobile = window.innerWidth < LG;
    if (mobile) {
      setSidebarOpen(false);
    }
    setMounted(true);

    const check = () => {
      if (window.innerWidth < LG) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(settings?.sidebar !== 'closed');
      }
    };

    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [settings?.sidebar]);

  const pathname = useLocation({ select: (l) => l.pathname });
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname && window.innerWidth < LG) {
      setSidebarOpen(false);
    }
    prevPathname.current = pathname;
  }, [pathname]);

  const handleToggle = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (window.innerWidth >= LG) {
        updateSetting({
          data: { key: 'sidebar', value: next ? 'open' : 'closed' },
        });
      }
      return next;
    });
  }, []);

  const showSidebar = mounted ? sidebarOpen : serverSidebar;

  return (
    <div className="flex flex-col h-dvh dark:bg-[oklch(0.1809_0.0023_247.96)] bg-[oklch(0.977_0.0007_247.83)]">
      {banner}
      <div className="flex flex-1 min-h-0">
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden',
            showSidebar && mounted
              ? 'opacity-100 visible'
              : 'opacity-0 invisible pointer-events-none',
          )}
          onClick={handleToggle}
        />

        <div
          className={cn(
            // Mobile: fixed overlay
            'max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:z-50 max-lg:h-dvh max-lg:bg-background',
            // Desktop: static flex item
            'lg:relative lg:shrink-0',
            // Shared
            'w-64 *:h-full',
            mounted && 'transition-[transform,width,margin] duration-200',
            // Visibility
            showSidebar
              ? mounted
                ? 'translate-x-0'
                : 'max-lg:-translate-x-full lg:translate-x-0'
              : cn('max-lg:-translate-x-full', 'lg:w-0 lg:overflow-hidden'),
          )}
        >
          {sidebar}
        </div>

        {/* Main content */}
        <main className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-2 py-3 lg:px-6">
            <Button
              variant="plain"
              size="sm-icon"
              onClick={handleToggle}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              className="text-muted"
            >
              {sidebarOpen ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
            </Button>
            <UserMenu />
          </div>
          <div className="flex-1 overflow-auto rounded-3xl mb-2 mx-2 ring ring-card-border/40 bg-background">
            <div className={cn('mx-auto p-6 lg:p-10', maxWidth)}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
