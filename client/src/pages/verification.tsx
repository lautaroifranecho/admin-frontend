import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateUserSchema, type UpdateUser, type User } from "../../../shared/schema";

interface UserData {
  user: User;
  hasChanges: boolean;
}

export default function Verification() {
  const [, params] = useRoute("/verify/:token");
  const token = params?.token;
  const [verificationAction, setVerificationAction] = useState("confirm");
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery<UserData>({
    queryKey: [`/api/verify/${token}`],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/verify/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user data');
      }
      return response.json();
    },
    enabled: !!token,
  });

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      client_number: "",
      address: "",
      phone_number: "",
      alt_number: "",
    },
  });

  useEffect(() => {
    if (userData?.user) {
      form.reset({
        first_name: userData.user.first_name,
        last_name: userData.user.last_name,
        email: userData.user.email,
        client_number: userData.user.client_number,
        address: userData.user.address,
        phone_number: userData.user.phone_number,
        alt_number: userData.user.alt_number || "",
      });
    }
  }, [userData, form]);

  const verificationMutation = useMutation({
    mutationFn: async (data: UpdateUser & { action: string }) => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/verify/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: () => {
      // Error handling can be added here if needed
    },
  });

  const onSubmit = (data: UpdateUser) => {
    verificationMutation.mutate({
      ...data,
      action: verificationAction,
    });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white animate-pulse" size={24} />
          </div>
          <p className="text-gray-600">Loading verification form...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Verification Link Invalid</h1>
            <p className="text-gray-600">This verification link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Verification Complete</h1>
            <p className="text-gray-600">Thank you for verifying your information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl overflow-hidden">
          <div className="p-6 text-white text-center border-t-4 border-primary">
          <div className="logo">
                  <img src="https://norris-legal.com/wp-content/uploads/2022/01/Norris-legal3.png" className="h-16" alt="Company Logo" />
                </div>
          </div>

          <CardContent className="p-8">

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  className="rounded-xl"
                  readOnly
                  value={`${userData?.user?.first_name || ''} ${userData?.user?.last_name || ''}`}
                />
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="rounded-xl"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    className="rounded-xl"
                    {...form.register("first_name")}
                  />
                  {form.formState.errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.first_name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    className="rounded-xl"
                    {...form.register("last_name")}
                  />
                  {form.formState.errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="client_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Number
                </Label>
                <Input
                  id="client_number"
                  className="rounded-xl"
                  {...form.register("client_number")}
                />
                {form.formState.errors.client_number && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.client_number.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </Label>
                <Input
                  id="address"
                  className="rounded-xl"
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    className="rounded-xl"
                    {...form.register("phone_number")}
                  />
                  {form.formState.errors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone_number.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alt_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Number
                  </Label>
                  <Input
                    id="alt_number"
                    className="rounded-xl"
                    {...form.register("alt_number")}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Options</h3>
                <RadioGroup value={verificationAction} onValueChange={setVerificationAction}>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="confirm" id="confirm" className="mt-1" />
                      <div>
                        <Label htmlFor="confirm" className="font-medium text-gray-900">
                          Information is Correct
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="update" id="update" className="mt-1" />
                      <div>
                        <Label htmlFor="update" className="font-medium text-gray-900">
                          I Made Changes
                        </Label>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-end pt-6">
                <Button
                  type="submit"
                  className="px-8 rounded-xl font-medium"
                  disabled={verificationMutation.isPending}
                >
                  {verificationMutation.isPending ? "Submitting..." : "Submit Verification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
