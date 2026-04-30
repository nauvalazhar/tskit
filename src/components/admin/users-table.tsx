import { useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import { DataPagination } from '@/components/shared/data-pagination';
import { DataTable } from '@/components/shared/data-table';
import { TableSearchInput } from '@/components/shared/table-search-input';
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/selia/alert-dialog';
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
} from '@/components/selia/menu';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Link, getRouteApi, useNavigate, useRouter } from '@tanstack/react-router';
import {
  adminBanUser,
  adminUnbanUser,
  adminRemoveUser,
  getUsers,
} from '@/functions/admin/users';
import { authClient } from '@/lib/auth-client';
import { EllipsisIcon } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/selia/card';

const routeApi = getRouteApi('/admin/users/');

type User = Awaited<ReturnType<typeof getUsers>>['users'][number];

const columnHelper = createColumnHelper<User>();

const baseColumns = [
  columnHelper.display({
    id: 'user',
    header: 'User',
    cell: ({ row }) => (
      <Link
        to="/admin/users/$userId"
        params={{ userId: row.original.id }}
        className="flex items-center gap-3"
      >
        <UserAvatar name={row.original.name} image={row.original.image || ''} />
        <div className="min-w-0">
          <p className="font-medium truncate">{row.original.name}</p>
          <p className="text-muted truncate">{row.original.email}</p>
        </div>
      </Link>
    ),
  }),
  columnHelper.display({
    id: 'teams',
    header: 'Teams',
    cell: ({ row }) => {
      const memberList = row.original.members;
      if (!memberList?.length) return <span className="text-muted">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {memberList.slice(0, 2).map((m, i) => (
            <Badge key={i} variant="secondary">
              {m.organizations.name}
            </Badge>
          ))}
          {memberList.length > 2 && (
            <Badge variant="secondary">+{memberList.length - 2}</Badge>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: ({ getValue }) => (
      <Badge variant={getValue() === 'admin' ? 'primary' : 'secondary'}>
        {getValue() || 'user'}
      </Badge>
    ),
  }),
  columnHelper.accessor('banned', {
    header: 'Status',
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? 'danger' : 'success'}>
        {getValue() ? 'Banned' : 'Active'}
      </Badge>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Joined',
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
];

export function UsersTable() {
  const { page = 1, search = '' } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { users, totalPages } = routeApi.useLoaderData();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id;
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [banning, setBanning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const columns = useMemo(
    () => [
      ...baseColumns,
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.id === currentUserId ? null : (
            <UserActionsMenu
              user={row.original}
              onBan={setBanTarget}
              onDelete={setDeleteTarget}
            />
          ),
      }),
    ],
    [currentUserId],
  );

  async function handleBanToggle() {
    if (!banTarget) return;
    setBanning(true);
    try {
      if (banTarget.banned) {
        await adminUnbanUser({ data: { userId: banTarget.id } });
      } else {
        await adminBanUser({ data: { userId: banTarget.id } });
      }
      await router.invalidate();
      setBanTarget(null);
    } finally {
      setBanning(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminRemoveUser({ data: { userId: deleteTarget.id } });
      await router.invalidate();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <TableSearchInput
          placeholder="Search by name or email..."
          value={search}
          onSearch={(v) => navigate({ search: { page: 1, search: v } })}
          onClear={() => navigate({ search: { page: 1 } })}
        />
      </CardHeader>
      <CardBody>
        <DataTable data={users} columns={columns} emptyMessage="No users found." />

        <DataPagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => navigate({ search: { page: p, search } })}
        />

        <AlertDialog
          open={!!banTarget}
          onOpenChange={(open) => !open && setBanTarget(null)}
        >
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {banTarget?.banned ? 'Unban' : 'Ban'} User
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogBody>
              <AlertDialogDescription>
                Are you sure you want to {banTarget?.banned ? 'unban' : 'ban'}{' '}
                <strong>{banTarget?.name}</strong>?
                {!banTarget?.banned &&
                  ' They will no longer be able to sign in.'}
              </AlertDialogDescription>
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogClose>Cancel</AlertDialogClose>
              <Button
                variant={banTarget?.banned ? 'primary' : 'danger'}
                onClick={handleBanToggle}
                progress={banning}
              >
                {banTarget?.banned ? 'Unban' : 'Ban'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>

        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogBody>
              <AlertDialogDescription>
                Are you sure you want to permanently delete{' '}
                <strong>{deleteTarget?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogClose>Cancel</AlertDialogClose>
              <Button variant="danger" onClick={handleDelete} progress={deleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
      </CardBody>
    </Card>
  );
}

function UserActionsMenu({
  user,
  onBan,
  onDelete,
}: {
  user: User;
  onBan: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end">
      <Menu>
        <MenuTrigger
          render={
            <Button variant="plain" size="xs-icon">
              <EllipsisIcon />
            </Button>
          }
        />
        <MenuPopup size="compact">
          <MenuItem
            onClick={() =>
              navigate({
                to: '/admin/users/$userId',
                params: { userId: user.id },
              })
            }
          >
            View
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={() => onBan(user)}>
            {user.banned ? 'Unban' : 'Ban'}
          </MenuItem>
          <MenuItem onClick={() => onDelete(user)} className="text-danger">
            Delete
          </MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  );
}
