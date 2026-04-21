import { featureRegistry, type FeatureKey } from '@/config/features';
import { Switch } from '@/components/selia/switch';
import { Input } from '@/components/selia/input';

type Entitlements = Record<string, boolean | number>;

export function EntitlementsEditor({
  value,
  onChange,
}: {
  value: Entitlements;
  onChange: (entitlements: Entitlements) => void;
}) {
  const features = Object.entries(featureRegistry) as [
    FeatureKey,
    (typeof featureRegistry)[FeatureKey],
  ][];

  function handleChange(key: FeatureKey, featureValue: boolean | number) {
    onChange({ ...value, [key]: featureValue });
  }

  return (
    <div className="divide-y divide-separator">
      {features.map(([key, feature]) => (
        <div
          key={key}
          className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
        >
          <div className="shrink-0">
            <p className="font-medium">{feature.label}</p>
            {feature.type === 'limit' && (
              <p className="text-muted text-sm">Use -1 for unlimited</p>
            )}
          </div>
          {feature.type === 'boolean' ? (
            <Switch
              checked={value[key] === true}
              onCheckedChange={(checked) => handleChange(key, !!checked)}
            />
          ) : (
            <Input
              type="number"
              className="w-28 text-right"
              placeholder="0"
              value={value[key] !== undefined ? String(value[key]) : ''}
              onChange={(e) =>
                handleChange(
                  key,
                  e.target.value === '' ? 0 : Number(e.target.value),
                )
              }
            />
          )}
        </div>
      ))}
      <p className="text-muted text-sm mt-4">
        Features are defined in{' '}
        <code className="text-foreground bg-code rounded px-1 py-0.5">
          config/features.ts
        </code>
      </p>
    </div>
  );
}
