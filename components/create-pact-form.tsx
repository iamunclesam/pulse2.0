"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usePactStore } from "@/lib/stores/pact-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { CalendarIcon, Check, User, Users, Globe, Coins, AlertTriangle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PactBadge } from "@/components/pact-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

// Create a base schema with common fields
const baseSchema = {
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  type: z.enum(["solo", "duo", "cause", "borrow"], {
    required_error: "Please select a pact type.",
  }),
  targetAmount: z.coerce.number().positive({
    message: "Target amount must be positive.",
  }),
  initialStake: z.coerce.number().min(0, {
    message: "Initial stake must be positive or zero.",
  }),
  deadline: z.date({
    required_error: "Please select a deadline date.",
  }),
}

// Type-specific schemas
const soloSchema = z.object({
  ...baseSchema,
  type: z.literal("solo"),
  category: z.string().optional(),
})

const duoSchema = z.object({
  ...baseSchema,
  type: z.literal("duo"),
  partnerAddress: z.string().min(10, {
    message: "Partner address must be at least 10 characters.",
  }),
  splitRatio: z.coerce.number().min(1).max(99),
})

const causeSchema = z.object({
  ...baseSchema,
  type: z.literal("cause"),
  causeAddress: z.string().min(10, {
    message: "Cause address must be at least 10 characters.",
  }),
  publiclyVisible: z.boolean().default(true),
})

const borrowSchema = z.object({
  ...baseSchema,
  type: z.literal("borrow"),
  interestRate: z.coerce.number().min(0).max(100),
  collateralAmount: z.coerce.number().min(0),
  repaymentSchedule: z.enum(["weekly", "biweekly", "monthly"]),
  lenderAddress: z.string().min(10, {
    message: "Lender address must be at least 10 characters.",
  }),
})

// Combined schema with discriminated union
const formSchema = z.discriminatedUnion("type", [soloSchema, duoSchema, causeSchema, borrowSchema])

export function CreatePactForm() {
  const router = useRouter()
  const { createPact } = usePactStore()
  const { balance, subtractFunds } = useWalletStore()
  const { addNotification } = useNotificationStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "solo",
      targetAmount: 0,
      initialStake: 0,
    },
  })

  const watchType = form.watch("type")
  const watchTarget = form.watch("targetAmount") || 0
  const watchInitialStake = form.watch("initialStake") || 0
  const progress = watchTarget > 0 ? (watchInitialStake / watchTarget) * 100 : 0

  // Reset form fields when type changes
  const handleTypeChange = (value: "solo" | "duo" | "cause" | "borrow") => {
    form.setValue("type", value)
    form.setValue("targetAmount", 0)
    form.setValue("initialStake", 0)

    // Clear type-specific fields
    if (value !== "duo") {
      form.unregister("partnerAddress")
      form.unregister("splitRatio")
    }
    if (value !== "cause") {
      form.unregister("causeAddress")
      form.unregister("publiclyVisible")
    }
    if (value !== "borrow") {
      form.unregister("interestRate")
      form.unregister("collateralAmount")
      form.unregister("repaymentSchedule")
      form.unregister("lenderAddress")
    }
    if (value !== "solo") {
      form.unregister("category")
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.initialStake > balance) {
      addNotification({
        type: "warning",
        title: "Insufficient funds",
        message: "You don't have enough funds to stake this amount.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate blockchain interaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create base pact data
      const pactData: any = {
        title: values.title,
        description: values.description,
        type: values.type,
        targetAmount: values.targetAmount,
        stakedAmount: values.initialStake,
        deadline: format(values.deadline, "PPP"),
        completed: false,
        failed: false,
      }

      // Add type-specific data
      if (values.type === "duo") {
        pactData.partnerAddress = values.partnerAddress
        pactData.splitRatio = values.splitRatio
      } else if (values.type === "cause") {
        pactData.causeAddress = values.causeAddress
        pactData.publiclyVisible = values.publiclyVisible
        pactData.contributors = [{ address: "Your Address", amount: values.initialStake }]
      } else if (values.type === "borrow") {
        pactData.interestRate = values.interestRate
        pactData.collateralAmount = values.collateralAmount
        pactData.repaymentSchedule = values.repaymentSchedule
        pactData.lenderAddress = values.lenderAddress
        pactData.totalRepayment = values.targetAmount * (1 + values.interestRate / 100)
      } else if (values.type === "solo") {
        pactData.category = values.category || "General"
      }

      createPact(pactData)

      // Subtract initial stake from balance
      if (values.initialStake > 0) {
        subtractFunds(values.initialStake)
      }

      addNotification({
        type: "success",
        title: "Pact Created",
        message: `Your ${values.type} pact "${values.title}" has been created successfully.`,
      })

      router.push("/")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Financial Pact</CardTitle>
        <CardDescription>Set a financial goal and commit to it by staking funds</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pact Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Save for vacation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your financial goal..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Pact Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => handleTypeChange(value as any)}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solo" id="solo" />
                        <label htmlFor="solo" className="flex items-center cursor-pointer">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <span className="font-medium">Solo</span>
                            <p className="text-xs text-muted-foreground">Personal financial goal</p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="duo" id="duo" />
                        <label htmlFor="duo" className="flex items-center cursor-pointer">
                          <Users className="h-4 w-4 mr-2 text-purple-500" />
                          <div>
                            <span className="font-medium">Duo</span>
                            <p className="text-xs text-muted-foreground">Shared goal with another user</p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cause" id="cause" />
                        <label htmlFor="cause" className="flex items-center cursor-pointer">
                          <Globe className="h-4 w-4 mr-2 text-green-500" />
                          <div>
                            <span className="font-medium">Cause</span>
                            <p className="text-xs text-muted-foreground">Goal tied to a social or public cause</p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="borrow" id="borrow" />
                        <label htmlFor="borrow" className="flex items-center cursor-pointer">
                          <Coins className="h-4 w-4 mr-2 text-amber-500" />
                          <div>
                            <span className="font-medium">Borrow</span>
                            <p className="text-xs text-muted-foreground">Borrow funds with terms and collateral</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Solo-specific fields */}
            {watchType === "solo" && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Emergency">Emergency Fund</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Vacation">Vacation</SelectItem>
                        <SelectItem value="Housing">Housing</SelectItem>
                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Categorize your personal goal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Duo-specific fields */}
            {watchType === "duo" && (
              <>
                <FormField
                  control={form.control}
                  name="partnerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your partner's wallet address" {...field} />
                      </FormControl>
                      <FormDescription>The wallet address of your partner</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="splitRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Contribution Percentage: {field.value || 50}%</FormLabel>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value || 50]}
                          max={99}
                          min={1}
                          step={1}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>You: {field.value || 50}%</span>
                        <span>Partner: {100 - (field.value || 50)}%</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Cause-specific fields */}
            {watchType === "cause" && (
              <>
                <FormField
                  control={form.control}
                  name="causeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cause Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the cause's wallet address" {...field} />
                      </FormControl>
                      <FormDescription>The wallet address where funds will be sent if the pact fails</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publiclyVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 mt-1"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publicly Visible</FormLabel>
                        <FormDescription>Allow others to see and contribute to this cause</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Borrow-specific fields */}
            {watchType === "borrow" && (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Borrowing Terms</AlertTitle>
                  <AlertDescription>
                    Borrowing requires collateral and includes interest. Make sure you understand the terms before
                    proceeding.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="lenderAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lender Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the lender's wallet address" {...field} />
                      </FormControl>
                      <FormDescription>The wallet address of the lender</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate: {field.value || 5}%</FormLabel>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value || 5]}
                          max={30}
                          min={0}
                          step={0.5}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Total to repay: {formatCurrency(watchTarget * (1 + (field.value || 5) / 100))}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collateralAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collateral Amount (ADA)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={0.1} {...field} />
                      </FormControl>
                      <FormDescription>
                        Amount to lock as collateral (recommended: at least {formatCurrency(watchTarget * 0.5)})
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repaymentSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repayment Schedule</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a repayment schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{watchType === "borrow" ? "Borrow Amount (ADA)" : "Target Amount (ADA)"}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialStake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === "borrow"
                        ? "Initial Deposit (ADA)"
                        : watchType === "cause"
                          ? "Initial Contribution (ADA)"
                          : "Initial Stake (ADA)"}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.1} {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {watchType === "borrow"
                        ? "Initial deposit towards repayment"
                        : watchType === "cause"
                          ? "Your initial contribution"
                          : "Amount to stake now"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{watchType === "borrow" ? "Repayment Deadline" : "Deadline"}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-center py-4 space-y-4">
              <p className="text-sm font-medium">Pact Preview</p>
              <PactBadge type={watchType} progress={progress} size="lg" />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating Pact...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Create Pact
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
