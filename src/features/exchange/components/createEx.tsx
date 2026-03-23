"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Key, ShieldCheck, Landmark } from "lucide-react";
// Replace this with your actual mutation hook
import { useCreateExchange } from "../hooks/use-exchange"; 

const exchangeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  apiKey: z.string().min(1, "API Key is required"),
  secret: z.string().min(1, "API Secret is required"),
  sandbox: z.boolean(),
  urls: z.object({
    public: z.string(),
    private: z.string(),
  })
});

type ExchangeFormValues = z.infer<typeof exchangeSchema>;

export default function CreateExchangePage() {
  const createExchange = useCreateExchange();

  const form = useForm<ExchangeFormValues>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: {
      name: "",
      apiKey: "",
      secret: "",
      sandbox: false,
      urls: {
        public: "",
        private: "",
      }
    },
  });

  function onSubmit(values: ExchangeFormValues) {
    createExchange.mutate(values);
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="border-none shadow-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Landmark className="h-6 w-6" />
            <CardTitle className="text-2xl">Connect Exchange</CardTitle>
          </div>
          <CardDescription>
            Integrate your exchange account to allow agents to execute trades and monitor balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Binance Main, Kraken Secondary" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name to identify this connection.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Key className="h-4 w-4" /> API Key
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Your exchange API key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> API Secret
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••••••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Your secret key is encrypted and never stored in plain text.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-6">
                  
                <FormField
                  control={form.control}
                  name="sandbox"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Sandbox Mode</FormLabel>
                        <FormDescription>
                          Use testnet environment (no real funds involved).
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="urls.public"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public API URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.exchange.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Endpoint for public market data.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="urls.private"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private API URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.exchange.com/private" {...field} />
                      </FormControl>
                      <FormDescription>
                        Endpoint for authenticated requests (orders, balances).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createExchange.isPending}
                >
                  {createExchange.isPending ? "Connecting..." : "Link Exchange Account"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By connecting, you agree to allow the platform to access your account data as per your API permissions.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}