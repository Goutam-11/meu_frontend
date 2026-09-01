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

// Define validation schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginForm() {
  const router = useRouter()
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: FormValues) {
     await authClient.signIn.email({
       email: values.email,
       password: values.password,
     },{
       onSuccess: () => {
         router.push("/agents")
       },
       onError: (error) => {
         toast.error(`Error signing up: ${error.error.message}`)
       },
     })
  }
  
  const isPending = form.formState.isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">
          <span className="text-primary">&gt;_</span> sign in
          <span className="cursor-blink" aria-hidden />
        </CardTitle>
        <CardDescription className="tui-kicker !tracking-normal !normal-case !text-xs text-muted-foreground">
          authenticate to command your agents_
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tui-kicker">email</FormLabel>
                  <FormControl>
                    <Input placeholder="operator@meu.dev" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
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

            <Button
              type="submit"
              className="w-full ring-1 ring-inset ring-primary transition-colors hover:bg-transparent hover:text-primary"
              disabled={isPending}
            >
              {isPending ? "[ authenticating… ]" : "$ login --now"}
            </Button>
            <div className="flex justify-center">
              <p className="text-muted-foreground text-sm">
              no account yet?{" "}
              <Link href="/signup" className="font-bold text-primary underline-offset-4 hover:underline">
                register here →
              </Link>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}