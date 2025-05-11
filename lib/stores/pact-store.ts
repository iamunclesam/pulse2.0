import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Contributor {
  address: string
  amount: number
}

export interface Pact {
  id: string
  title: string
  description: string
  type: "solo" | "duo" | "cause" | "borrow"
  targetAmount: number
  stakedAmount: number
  deadline: string
  completed: boolean
  failed: boolean

  // Solo specific
  category?: string

  // Duo specific
  partnerAddress?: string
  splitRatio?: number

  // Cause specific
  causeAddress?: string
  publiclyVisible?: boolean
  contributors?: Contributor[]

  // Borrow specific
  interestRate?: number
  collateralAmount?: number
  repaymentSchedule?: "weekly" | "biweekly" | "monthly"
  lenderAddress?: string
  totalRepayment?: number
}

interface PactStore {
  pacts: Pact[]
  fetchPacts: () => void
  createPact: (pact: Omit<Pact, "id">) => void
  stakePact: (id: string, amount: number) => void
  contributeToCause: (id: string, amount: number, address: string) => void
  completePact: (id: string) => void
  failPact: (id: string) => void
  resetPacts: () => void
}

// Sample data
const initialPacts: Pact[] = [
  {
    id: "1",
    title: "Emergency Fund",
    description: "Build a 3-month emergency fund for unexpected expenses",
    type: "solo",
    category: "Emergency",
    targetAmount: 5000,
    stakedAmount: 2500,
    deadline: "December 31, 2025",
    completed: false,
    failed: false,
  },
  {
    id: "2",
    title: "New Laptop",
    description: "Save for a new development laptop",
    type: "solo",
    category: "Electronics",
    targetAmount: 2000,
    stakedAmount: 1200,
    deadline: "August 15, 2025",
    completed: false,
    failed: false,
  },
  {
    id: "3",
    title: "Vacation Fund",
    description: "Save for summer vacation",
    type: "solo",
    category: "Vacation",
    targetAmount: 3000,
    stakedAmount: 3000,
    deadline: "May 1, 2025",
    completed: true,
    failed: false,
  },
  {
    id: "4",
    title: "Home Renovation",
    description: "Joint fund with partner for home renovation project",
    type: "duo",
    partnerAddress:
      "addr1qxy8rzd5h5gqgdkgwak2vxnp0zucsq6qvj2qnxvl7lsdhnktp3mzl85lh9cxvj5s8zlj4ztzy52n8krmf2nx7fy8qxsqvz2a9c",
    splitRatio: 60,
    targetAmount: 10000,
    stakedAmount: 4500,
    deadline: "October 15, 2025",
    completed: false,
    failed: false,
  },
  {
    id: "5",
    title: "Charity Marathon",
    description: "Fundraising for local charity marathon",
    type: "cause",
    causeAddress:
      "addr1qxy8rzd5h5gqgdkgwak2vxnp0zucsq6qvj2qnxvl7lsdhnktp3mzl85lh9cxvj5s8zlj4ztzy52n8krmf2nx7fy8qxsqvz2a9c",
    publiclyVisible: true,
    targetAmount: 1500,
    stakedAmount: 750,
    deadline: "June 30, 2025",
    completed: false,
    failed: false,
    contributors: [
      { address: "Your Address", amount: 500 },
      { address: "addr1qx...7fyu", amount: 250 },
    ],
  },
  {
    id: "6",
    title: "Wedding Fund",
    description: "Save for wedding expenses with partner",
    type: "duo",
    partnerAddress:
      "addr1qxy8rzd5h5gqgdkgwak2vxnp0zucsq6qvj2qnxvl7lsdhnktp3mzl85lh9cxvj5s8zlj4ztzy52n8krmf2nx7fy8qxsqvz2a9c",
    splitRatio: 50,
    targetAmount: 8000,
    stakedAmount: 8000,
    deadline: "January 15, 2025",
    completed: true,
    failed: false,
  },
  {
    id: "7",
    title: "Car Repair",
    description: "Emergency fund for car repairs",
    type: "solo",
    category: "Vehicle",
    targetAmount: 1200,
    stakedAmount: 600,
    deadline: "March 10, 2025",
    completed: false,
    failed: true,
  },
  {
    id: "8",
    title: "Business Expansion Loan",
    description: "Loan to expand my small business",
    type: "borrow",
    lenderAddress:
      "addr1qxy8rzd5h5gqgdkgwak2vxnp0zucsq6qvj2qnxvl7lsdhnktp3mzl85lh9cxvj5s8zlj4ztzy52n8krmf2nx7fy8qxsqvz2a9c",
    interestRate: 8,
    collateralAmount: 2000,
    repaymentSchedule: "monthly",
    targetAmount: 5000,
    stakedAmount: 2000,
    totalRepayment: 5400,
    deadline: "September 30, 2025",
    completed: false,
    failed: false,
  },
  {
    id: "9",
    title: "Education Fund",
    description: "Community fund for local school supplies",
    type: "cause",
    causeAddress:
      "addr1qxy8rzd5h5gqgdkgwak2vxnp0zucsq6qvj2qnxvl7lsdhnktp3mzl85lh9cxvj5s8zlj4ztzy52n8krmf2nx7fy8qxsqvz2a9c",
    publiclyVisible: true,
    targetAmount: 3000,
    stakedAmount: 3000,
    deadline: "July 15, 2025",
    completed: true,
    failed: false,
    contributors: [
      { address: "Your Address", amount: 1000 },
      { address: "addr1qx...7fyu", amount: 500 },
      { address: "addr1qx...8gtz", amount: 750 },
      { address: "addr1qx...9ktz", amount: 750 },
    ],
  },
]

export const usePactStore = create<PactStore>()(
  persist(
    (set, get) => ({
      pacts: [],
      fetchPacts: () => {
        // In a real app, this would fetch from the blockchain
        // For now, we'll use the sample data if no pacts exist yet
        if (get().pacts.length === 0) {
          set({ pacts: initialPacts })
        }
      },
      createPact: (pact) => {
        const newPact = {
          ...pact,
          id: Date.now().toString(),
        }
        set((state) => ({
          pacts: [...state.pacts, newPact],
        }))
      },
      stakePact: (id, amount) => {
        set((state) => ({
          pacts: state.pacts.map((pact) =>
            pact.id === id ? { ...pact, stakedAmount: pact.stakedAmount + amount } : pact,
          ),
        }))
      },
      contributeToCause: (id, amount, address) => {
        set((state) => ({
          pacts: state.pacts.map((pact) => {
            if (pact.id !== id) return pact

            // Add to total staked amount
            const newStakedAmount = pact.stakedAmount + amount

            // Add contributor or update existing contribution
            let contributors = pact.contributors || []
            const existingContributorIndex = contributors.findIndex((c) => c.address === address)

            if (existingContributorIndex >= 0) {
              // Update existing contributor
              contributors = [
                ...contributors.slice(0, existingContributorIndex),
                {
                  ...contributors[existingContributorIndex],
                  amount: contributors[existingContributorIndex].amount + amount,
                },
                ...contributors.slice(existingContributorIndex + 1),
              ]
            } else {
              // Add new contributor
              contributors = [...contributors, { address, amount }]
            }

            return {
              ...pact,
              stakedAmount: newStakedAmount,
              contributors,
            }
          }),
        }))
      },
      completePact: (id) => {
        set((state) => ({
          pacts: state.pacts.map((pact) => (pact.id === id ? { ...pact, completed: true, failed: false } : pact)),
        }))
      },
      failPact: (id) => {
        set((state) => ({
          pacts: state.pacts.map((pact) => (pact.id === id ? { ...pact, completed: false, failed: true } : pact)),
        }))
      },
      resetPacts: () => {
        set({ pacts: initialPacts })
      },
    }),
    {
      name: "pulsepact-storage",
    },
  ),
)
