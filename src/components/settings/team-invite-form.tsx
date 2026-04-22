import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldLabel, FieldError } from '@/components/selia/field';
import {
  Select,
  SelectTrigger,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectValue,
  type SelectItem as SelectItemType,
} from '@/components/selia/select';
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/selia/dialog';
import { Form } from '@/components/selia/form';
import { toastManager } from '@/components/selia/toast';
import { inviteMember } from '@/functions/team';
import { TEAM_ROLES, type TeamRole } from '@/lib/constants';
import { PlusIcon } from 'lucide-react';

const ROLE_OPTIONS: SelectItemType[] = [...TEAM_ROLES];

export function TeamInviteForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: { email: '', role: 'member' as TeamRole },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      try {
        await inviteMember({
          data: {
            email: value.email,
            role: value.role,
          },
        });
        await router.invalidate();
        toastManager.add({
          title: 'Invitation sent',
          description: `An invitation has been sent to ${value.email}.`,
          type: 'success',
        });
        form.reset();
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to send invitation',
        );
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        Invite member
      </Button>
      <DialogPopup>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <DialogDescription>
              Send an invitation email to add a new member to your team.
            </DialogDescription>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? 'Email is required'
                    : !/\S+@\S+\.\S+/.test(value)
                      ? 'Please enter a valid email'
                      : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
                  <Input
                    id="invite-email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="colleague@example.com"
                  />
                  {field.state.meta.errors.map((err, i) => (
                    <FieldError key={i}>{err}</FieldError>
                  ))}
                </Field>
              )}
            </form.Field>
            <form.Field name="role">
              {(field) => (
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={ROLE_OPTIONS.find((o) => o.value === field.state.value)}
                    onValueChange={(v) =>
                      field.handleChange((v as SelectItemType).value as TeamRole)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectList>
                        {ROLE_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectList>
                    </SelectPopup>
                  </Select>
                </Field>
              )}
            </form.Field>
            {error && <FieldError>{error}</FieldError>}
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button type="submit" variant="primary" progress={pending}>
              Send invitation
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}
