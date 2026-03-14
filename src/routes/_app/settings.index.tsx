import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Separator } from '@/components/selia/separator';
import { createFileRoute } from '@tanstack/react-router';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { ProfileForm } from '@/components/settings/profile-form';

export const Route = createFileRoute('/_app/settings/')({
  loader: async ({ context }) => {
    return {
      user: context.session?.user || null,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useLoaderData();

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <Heading level={2} size="sm">
          Profile Settings
        </Heading>
        <Text className="text-muted mt-1">
          Change your profile settings, including your name and profile picture.
        </Text>
      </div>
      <div className="flex flex-col gap-6">
        <AvatarUpload
          name={user?.name || ''}
          image={user?.image || undefined}
        />
        <Separator />
        <ProfileForm defaultName={user?.name || ''} email={user?.email || ''} />
      </div>
    </div>
  );
}
