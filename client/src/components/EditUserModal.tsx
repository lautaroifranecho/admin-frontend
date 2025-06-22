import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserSchema, type User, type UpdateUser } from '../../../shared/schema';

interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      client_number: '',
      address: '',
      phone_number: '',
      alt_number: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        client_number: user.client_number,
        address: user.address,
        phone_number: user.phone_number,
        alt_number: user.alt_number || '',
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: async (data: UpdateUser) => {
      if (!user) throw new Error("No user selected for update.");

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user.');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'User updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: UpdateUser) => {
    mutation.mutate(data);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit User: {user.first_name} {user.last_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...form.register('first_name')} />
              {form.formState.errors.first_name && <p className="text-red-500 text-xs">{form.formState.errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...form.register('last_name')} />
              {form.formState.errors.last_name && <p className="text-red-500 text-xs">{form.formState.errors.last_name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...form.register('email')} />
            {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_number">Client Number</Label>
            <Input id="client_number" {...form.register('client_number')} />
            {form.formState.errors.client_number && <p className="text-red-500 text-xs">{form.formState.errors.client_number.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...form.register('address')} />
            {form.formState.errors.address && <p className="text-red-500 text-xs">{form.formState.errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input id="phone_number" {...form.register('phone_number')} />
              {form.formState.errors.phone_number && <p className="text-red-500 text-xs">{form.formState.errors.phone_number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt_number">Alternate Number</Label>
              <Input id="alt_number" {...form.register('alt_number')} />
            </div>
          </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 