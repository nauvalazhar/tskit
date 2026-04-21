import { useState } from 'react';
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
import { toastManager } from '@/components/selia/toast';
import { inviteMember } from '@/functions/team';
import { PlusIcon } from 'lucide-react';

const ROLE_OPTIONS: SelectItemType[] = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

export function TeamInviteForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<SelectItemType>(ROLE_OPTIONS[0]);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPending(true);

    try {
      await inviteMember({ data: { email, role: role.value as 'admin' | 'member' } });
      await router.invalidate();
      toastManager.add({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${email}.`,
        type: 'success',
      });
      setEmail('');
      setRole(ROLE_OPTIONS[0]);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        Invite member
      </Button>
      <DialogPopup>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <DialogDescription>
              Send an invitation email to add a new member to your team.
            </DialogDescription>
            <Field>
              <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as SelectItemType)}
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
            {error && <FieldError>{error}</FieldError>}
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button type="submit" variant="primary" progress={pending}>
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
