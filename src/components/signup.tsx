"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

// Schema with validation for matching passwords
const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Sets the error to the confirmPassword field
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupForm() {
  const router = useRouter()
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SignupFormValues) {
    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    }, {
      onSuccess: () => {
        router.push("/dashboard")
      },
      onError: (error) => {
        toast.error(`Error signing up: ${error}`)
      },
    })
  }

  const isPending = form.formState.isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">
          <span className="text-primary">&gt;_</span> register
          <span className="cursor-blink" aria-hidden />
        </CardTitle>
        <CardDescription className="!text-xs text-muted-foreground">
          provision your operator account_
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tui-kicker">full name</FormLabel>
                  <FormControl>
                    <Input placeholder="jane operator" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tui-kicker">email</FormLabel>
                  <FormControl>
                    <Input placeholder="operator@meu.dev" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tui-kicker">password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tui-kicker">confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full ring-1 ring-inset ring-primary transition-colors hover:bg-transparent hover:text-primary"
              disabled={isPending}
            >
              {isPending ? "[ provisioning… ]" : "$ create account"}
            </Button>
            <div className="flex justify-center">
              <p className="text-muted-foreground text-sm">
              Already have an account?
              <Link href="/login" className="font-bold text-primary underline-offset-4 hover:underline">login here →</Link>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}