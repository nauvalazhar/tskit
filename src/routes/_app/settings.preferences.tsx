import { useEffect, useState } from 'react';
import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { RadioGroup, Radio, RadioGroupLabel } from '@/components/selia/radio';
import { Label } from '@/components/selia/label';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { useServerFn } from '@tanstack/react-start';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';
import { type Theme, applyTheme } from '@/lib/theme';
import { updateUserSetting } from '@/functions/settings';

export const Route = createFileRoute('/_app/settings/preferences')({
  head: () => ({
    meta: [{ title: pageTitle('Preferences') }],
  }),
  loader: ({ context }) => {
    return {
      theme: (context.settings?.theme as Theme) || 'auto',
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { theme: initialTheme } = Route.useLoaderData();
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const updateSetting = useServerFn(updateUserSetting);

  useEffect(() => {
    if (initialTheme) {
      localStorage.setItem('theme', initialTheme);
    }
  }, [initialTheme]);

  const handleThemeChange = (value: unknown) => {
    const newTheme = value as Theme;
    setTheme(newTheme);
    applyTheme(newTheme);

    updateSetting({ data: { key: 'theme', value: newTheme } });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <Heading level={2} size="sm">
          Appearance
        </Heading>
        <Text className="text-muted mt-1">
          Customize how the app looks and feels.
        </Text>
      </div>
      <RadioGroup value={theme} onValueChange={handleThemeChange}>
        <Label className="flex items-center gap-3 cursor-pointer">
          <Radio value="light" />
          <RadioGroupLabel className="flex items-center gap-2">
            <SunIcon className="size-4" />
            Light
          </RadioGroupLabel>
        </Label>
        <Label className="flex items-center gap-3 cursor-pointer">
          <Radio value="dark" />
          <RadioGroupLabel className="flex items-center gap-2">
            <MoonIcon className="size-4" />
            Dark
          </RadioGroupLabel>
        </Label>
        <Label className="flex items-center gap-3 cursor-pointer">
          <Radio value="auto" />
          <RadioGroupLabel className="flex items-center gap-2">
            <MonitorIcon className="size-4" />
            System
          </RadioGroupLabel>
        </Label>
      </RadioGroup>
    </div>
  );
}
