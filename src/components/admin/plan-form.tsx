import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardBody,
  CardSubsection,
  CardSubsectionTitle,
  CardSubsectionDescription,
} from '@/components/selia/card';
import { Form } from '@/components/selia/form';
import { Field, FieldLabel, FieldError } from '@/components/selia/field';
import { Input } from '@/components/selia/input';
import { Button } from '@/components/selia/button';
import { Switch } from '@/components/selia/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
} from '@/components/selia/select';
import { toastManager } from '@/components/selia/toast';
import { EntitlementsEditor } from './entitlements-editor';
import { PlanPricesEditor } from './plan-prices-editor';
import { savePlan, getAllPlans } from '@/functions/admin';
import { slugify } from '@/lib/utils';
import { CURRENCIES, BILLING_INTERVALS } from '@/lib/constants';
import { useServerFn } from '@tanstack/react-start';

type Plan = Awaited<ReturnType<typeof getAllPlans>>[number];

interface PlanFormDefaults {
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  entitlements: Record<string, boolean | number>;
  sortOrder: number;
  popular: boolean;
  active: boolean;
}

export function PlanForm({
  plan,
  isNew = false,
}: {
  plan: Plan | PlanFormDefaults;
  isNew?: boolean;
}) {
  const save = useServerFn(savePlan);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      sortOrder: plan.sortOrder,
      popular: plan.popular,
      active: plan.active,
      entitlements: plan.entitlements as Record<string, boolean | number>,
    },
    onSubmit: async ({ value }) => {
      setSaving(true);

      try {
        const result = await save({
          data: {
            slug: value.slug,
            name: value.name,
            description: value.description || null,
            price: value.price,
            currency: value.currency,
            interval: value.interval,
            entitlements: value.entitlements,
            sortOrder: value.sortOrder,
            popular: value.popular,
            active: value.active,
          },
        });

        queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });

        if (isNew && result) {
          toastManager.add({
            title: 'Plan Created',
            description: 'The plan has been created successfully.',
            type: 'success',
          });
          navigate({
            to: '/admin/plans/$planId',
            params: { planId: result.id },
          });
        } else {
          toastManager.add({
            title: 'Plan Saved',
            description: 'Changes have been saved successfully.',
            type: 'success',
          });
        }
      } catch (e) {
        toastManager.add({
          title: 'Error',
          description: e instanceof Error ? e.message : 'Failed to save plan.',
          type: 'error',
        });
      } finally {
        setSaving(false);
      }
    },
  });

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6 flex-none"
      >
        <Card>
          <CardBody>
            <CardSubsection>
              <CardSubsectionTitle>Plan Details</CardSubsectionTitle>
              <CardSubsectionDescription>Basic information about this plan</CardSubsectionDescription>
            </CardSubsection>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field
                  name="name"
                  validators={{
                    onSubmit: ({ value }) =>
                      !value ? 'Name is required' : undefined,
                    onChange: ({ value }) =>
                      !value ? 'Name is required' : undefined,
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input
                        id="name"
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          if (isNew) {
                            form.setFieldValue('slug', slugify(e.target.value));
                          }
                        }}
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
                    onSubmit: ({ value }) =>
                      !value ? 'Slug is required' : undefined,
                    onChange: ({ value }) =>
                      !value ? 'Slug is required' : undefined,
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="slug">Slug</FieldLabel>
                      <Input
                        id="slug"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={!isNew}
                      />
                      {field.state.meta.errors.map((err, i) => (
                        <FieldError key={i}>{err}</FieldError>
                      ))}
                    </Field>
                  )}
                </form.Field>
              </div>
              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Input
                      id="description"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </Field>
                )}
              </form.Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardSubsection>
              <CardSubsectionTitle>Pricing</CardSubsectionTitle>
              <CardSubsectionDescription>Set the billing cycle and pricing for this plan</CardSubsectionDescription>
            </CardSubsection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <form.Field
                name="price"
                validators={{
                  onSubmit: ({ value }) =>
                    value === undefined || value === null
                      ? 'Price is required'
                      : undefined,
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="price">Price (cents)</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.map((err, i) => (
                      <FieldError key={i}>{err}</FieldError>
                    ))}
                  </Field>
                )}
              </form.Field>
              <form.Field name="currency">
                {(field) => (
                  <Field>
                    <FieldLabel>Currency</FieldLabel>
                    <Select
                      value={CURRENCIES.find(
                        (c) => c.value === field.state.value,
                      )}
                      onValueChange={(v) =>
                        field.handleChange(
                          (v as (typeof CURRENCIES)[number]).value,
                        )
                      }
                      items={CURRENCIES}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectList>
                          {CURRENCIES.map((item) => (
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
              <form.Field name="interval">
                {(field) => (
                  <Field>
                    <FieldLabel>Interval</FieldLabel>
                    <Select
                      value={BILLING_INTERVALS.find(
                        (i) => i.value === field.state.value,
                      )}
                      onValueChange={(v) =>
                        field.handleChange(
                          (v as (typeof BILLING_INTERVALS)[number]).value,
                        )
                      }
                      items={BILLING_INTERVALS}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectList>
                          {BILLING_INTERVALS.map((item) => (
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
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardSubsection>
              <CardSubsectionTitle>Entitlements</CardSubsectionTitle>
              <CardSubsectionDescription>Configure feature access and usage limits for this plan</CardSubsectionDescription>
            </CardSubsection>
            <form.Field name="entitlements">
              {(field) => (
                <EntitlementsEditor
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                />
              )}
            </form.Field>
          </CardBody>
        </Card>

        {'id' in plan && (
          <Card>
            <CardBody>
              <CardSubsection>
                <CardSubsectionTitle>Channel Pricing</CardSubsectionTitle>
                <CardSubsectionDescription>Map this plan to external payment provider products</CardSubsectionDescription>
              </CardSubsection>
              <PlanPricesEditor planId={plan.id} prices={plan.prices || []} />
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <CardSubsection>
              <CardSubsectionTitle>Settings</CardSubsectionTitle>
              <CardSubsectionDescription>Display order and visibility options</CardSubsectionDescription>
            </CardSubsection>
            <div className="divide-y divide-separator">
              <form.Field name="sortOrder">
                {(field) => (
                  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">Sort Order</p>
                      <p className="text-muted text-sm">Controls the display order on the pricing page. Lower numbers appear first.</p>
                    </div>
                    <Input
                      id="sortOrder"
                      type="number"
                      className="w-28 text-right"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="popular">
                {(field) => (
                  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">Popular</p>
                      <p className="text-muted text-sm">Highlight this plan as the recommended choice on the pricing page.</p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(!!checked)
                      }
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="active">
                {(field) => (
                  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">Active</p>
                      <p className="text-muted text-sm">Only active plans are visible to users and available for new subscriptions.</p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(!!checked)
                      }
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" progress={saving}>
            {isNew ? 'Create Plan' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
