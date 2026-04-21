import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer,
} from '@/components/selia/table';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { DataPagination } from '@/components/shared/data-pagination';
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
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  adminBanUser,
  adminUnbanUser,
  adminRemoveUser,
  getUsers,
} from '@/functions/admin';
import { adminUsersQuery } from '@/queries/admin.queries';
import { authClient } from '@/lib/auth-client';
import { EllipsisIcon, SearchIcon } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/selia/card';
import { InputGroup, InputGroupAddon } from '@/components/selia/input-group';

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
  const { data } = useSuspenseQuery(adminUsersQuery({ page, search }));
  const { users, totalPages } = data;
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id;
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

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

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function handleBanToggle() {
    if (!banTarget) return;
    if (banTarget.banned) {
      await adminUnbanUser({ data: { userId: banTarget.id } });
    } else {
      await adminBanUser({ data: { userId: banTarget.id } });
    }
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setBanTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await adminRemoveUser({ data: { userId: deleteTarget.id } });
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setDeleteTarget(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2.5">
          <InputGroup className="w-xs">
            <InputGroupAddon align="start">
              <SearchIcon />
            </InputGroupAddon>
            <Input
              key={search}
              placeholder="Search by name or email..."
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  navigate({ search: { page: 1, search: value || undefined } });
                }
              }}
            />
          </InputGroup>
          {search && (
            <p className="text-sm text-muted">
              Showing results for "<strong>{search}</strong>".{' '}
              <button
                className="underline cursor-pointer"
                onClick={() => navigate({ search: { page: 1 } })}
              >
                Clear search
              </button>
            </p>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted py-8"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
              <Button variant="danger" onClick={handleDelete}>
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
