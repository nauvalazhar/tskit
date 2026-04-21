import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldLabel, FieldError } from '@/components/selia/field';
import { toastManager } from '@/components/selia/toast';
import { updateTeam } from '@/functions/team';

export function TeamGeneralForm({
  name: initialName,
  slug: initialSlug,
}: {
  name: string;
  slug: string;
}) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPending(true);

    try {
      await updateTeam({ data: { name, slug } });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toastManager.add({
        title: 'Team updated',
        description: 'Your team settings have been saved.',
        type: 'success',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setPending(false);
    }
  };

  const hasChanges = name !== initialName || slug !== initialSlug;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="team-name">Team name</FieldLabel>
        <Input
          id="team-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="team-slug">URL slug</FieldLabel>
        <Input
          id="team-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          pattern="[a-z0-9-]+"
          required
        />
      </Field>
      {error && <FieldError>{error}</FieldError>}
      <div>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          progress={pending}
          disabled={!hasChanges}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
