import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldLabel, FieldError } from '@/components/selia/field';
import { Form } from '@/components/selia/form';
import { toastManager } from '@/components/selia/toast';
import { updateTeam } from '@/functions/team';

export function TeamGeneralForm({
  name: initialName,
  slug: initialSlug,
}: {
  name: string;
  slug: string;
}) {
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm({
    defaultValues: { name: initialName, slug: initialSlug },
    onSubmit: async ({ value }) => {
      setPending(true);

      try {
        await updateTeam({ data: { name: value.name, slug: value.slug } });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        await router.invalidate();
        toastManager.add({
          title: 'Team updated',
          description: 'Your team settings have been saved.',
          type: 'success',
        });
      } catch (err) {
        toastManager.add({
          title: 'Update failed',
          description:
            err instanceof Error ? err.message : 'Failed to update team',
          type: 'error',
        });
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Team name is required' : undefined,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor="team-name">Team name</FieldLabel>
            <Input
              id="team-name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((err, i) => (
              <FieldError key={i}>{err}</FieldError>
            ))}
          </Field>
        )}
      </form.Field>
      <form.Field
        name="slug"
        validators={{
          onChange: ({ value }) =>
            !value
              ? 'URL slug is required'
              : !/^[a-z0-9-]+$/.test(value)
                ? 'Slug must be lowercase alphanumeric with hyphens'
                : undefined,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor="team-slug">URL slug</FieldLabel>
            <Input
              id="team-slug"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((err, i) => (
              <FieldError key={i}>{err}</FieldError>
            ))}
          </Field>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => ({ isDirty: state.isDirty })}>
        {({ isDirty }) => (
          <div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              progress={pending}
              disabled={!isDirty}
            >
              Save changes
            </Button>
          </div>
        )}
      </form.Subscribe>
    </Form>
  );
}
