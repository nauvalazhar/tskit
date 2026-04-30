import { useState } from 'react';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
} from '@/components/selia/select';
import {
  Drawer,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
  DrawerDescription,
} from '@/components/selia/drawer';
import { Field, FieldLabel } from '@/components/selia/field';
import { savePlanPrice, removePlanPrice } from '@/functions/admin/plans';
import type { PaymentChannel } from '@/config/payment';

const routeApi = getRouteApi('/admin/plans/$planId');
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemAction,
} from '@/components/selia/item';
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
import { PlusIcon, TrashIcon } from 'lucide-react';

type PlanPrice = {
  id: string;
  channel: string;
  externalProductId: string;
  externalPriceId: string;
};

function ChannelDrawerContent({
  planId,
  channels,
  usedChannels,
  editingPrice,
  onSaved,
  onClose,
}: {
  planId: string;
  channels: { value: string; label: string }[];
  usedChannels: Set<string>;
  editingPrice: PlanPrice | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [channel, setChannel] = useState(editingPrice?.channel || '');
  const [productId, setProductId] = useState(
    editingPrice?.externalProductId || '',
  );
  const [priceId, setPriceId] = useState(editingPrice?.externalPriceId || '');
  const [saving, setSaving] = useState(false);

  const available = channels.filter(
    (c) => !usedChannels.has(c.value) || c.value === editingPrice?.channel,
  );

  async function handleSave() {
    if (!channel || !productId || !priceId) return;
    setSaving(true);
    try {
      await savePlanPrice({
        data: {
          planId,
          channel: channel as PaymentChannel,
          externalProductId: productId,
          externalPriceId: priceId,
        },
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          {editingPrice ? 'Edit Channel' : 'Add Channel'}
        </DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        <DrawerDescription>
          Map this plan to an external payment provider product and price.
        </DrawerDescription>
        <div className="space-y-4 pt-4">
          <Field>
            <FieldLabel>Channel</FieldLabel>
            <Select
              value={available.find((c) => c.value === channel)}
              onValueChange={(v) =>
                setChannel((v as (typeof channels)[number]).value)
              }
              items={available}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectPopup>
                <SelectList>
                  {available.map((item) => (
                    <SelectItem key={item.value} value={item}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectPopup>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="drawer-product-id">Product ID</FieldLabel>
            <Input
              id="drawer-product-id"
              placeholder="prod_..."
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="drawer-price-id">Price ID</FieldLabel>
            <Input
              id="drawer-price-id"
              placeholder="price_..."
              value={priceId}
              onChange={(e) => setPriceId(e.target.value)}
            />
          </Field>
        </div>
      </DrawerBody>
      <DrawerFooter>
        <DrawerClose>Cancel</DrawerClose>
        <Button
          type="button"
          onClick={handleSave}
          progress={saving}
          disabled={!channel || !productId || !priceId}
        >
          {editingPrice ? 'Save' : 'Add'}
        </Button>
      </DrawerFooter>
    </>
  );
}

export function PlanPricesEditor({
  planId,
  prices,
}: {
  planId: string;
  prices: PlanPrice[];
}) {
  const router = useRouter();
  const { channels } = routeApi.useLoaderData();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PlanPrice | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPrice, setDeletingPrice] = useState<PlanPrice | null>(null);

  const usedChannels = new Set(prices.map((p) => p.channel));

  function openDrawer(price?: PlanPrice) {
    setEditingPrice(price || null);
    setDrawerOpen(true);
  }

  async function handleSaved() {
    await router.invalidate();
  }

  function confirmDelete(price: PlanPrice) {
    setDeletingPrice(price);
    setDeleteConfirmOpen(true);
  }

  async function handleDelete() {
    if (!deletingPrice) return;
    setDeleting(deletingPrice.id);
    try {
      await removePlanPrice({ data: { priceId: deletingPrice.id } });
      await router.invalidate();
    } finally {
      setDeleting(null);
      setDeleteConfirmOpen(false);
      setDeletingPrice(null);
    }
  }

  const channelLabel = (value: string) =>
    channels.find((c) => c.value === value)?.label || value;

  return (
    <>
      <div className="space-y-3">
        {prices.length === 0 && (
          <p className="text-muted text-sm">
            No channels configured yet. Add a channel to link this plan to a payment provider.
          </p>
        )}

        {prices.map((price) => (
          <Item key={price.id} size="sm">
            <ItemContent>
              <ItemTitle>{channelLabel(price.channel)}</ItemTitle>
              <ItemDescription className="text-sm">
                Linked to external product and price
              </ItemDescription>
            </ItemContent>
            <ItemAction>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => openDrawer(price)}
              >
                Edit
              </Button>
              <Button
                variant="plain"
                size="sm-icon"
                type="button"
                onClick={() => confirmDelete(price)}
              >
                <TrashIcon className="text-danger" />
              </Button>
            </ItemAction>
          </Item>
        ))}

        {prices.length < channels.length && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => openDrawer()}
          >
            <PlusIcon />
            Add Channel
          </Button>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Channel</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to remove the{' '}
              <strong>{deletingPrice ? channelLabel(deletingPrice.channel) : ''}</strong>{' '}
              channel? You'll need to re-enter the product and price IDs to add it back.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  progress={deleting !== null}
                >
                  Remove
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerPopup>
          <ChannelDrawerContent
            key={editingPrice?.id || 'new'}
            planId={planId}
            channels={channels}
            usedChannels={usedChannels}
            editingPrice={editingPrice}
            onSaved={handleSaved}
            onClose={() => setDrawerOpen(false)}
          />
        </DrawerPopup>
      </Drawer>
    </>
  );
}
