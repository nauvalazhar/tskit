import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/selia/dialog';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldLabel, FieldError } from '@/components/selia/field';
import { Form } from '@/components/selia/form';
import { setActiveTeam, createTeam } from '@/functions/team';

export function CreateTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: { name: '', slug: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      try {
        const org = await createTeam({ data: value });
        await setActiveTeam({ data: { organizationId: org.id } });
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create team',
        );
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create a new team</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
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
                    onChange={(e) => {
                      const name = e.target.value;
                      field.handleChange(name);
                      form.setFieldValue('slug', name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, ''));
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Acme Inc."
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
                    placeholder="acme-inc"
                  />
                  {field.state.meta.errors.map((err, i) => (
                    <FieldError key={i}>{err}</FieldError>
                  ))}
                </Field>
              )}
            </form.Field>
            {error && <FieldError>{error}</FieldError>}
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button type="submit" variant="primary" progress={pending}>
              Create team
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}
