"use client"
import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, GraduationCap, BriefcaseBusiness, ClipboardList, Globe2 } from "lucide-react"
import { motion } from "framer-motion"
import DatePicker from "react-datepicker"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"

function Asterisk() {
    return <span className="text-red-600 text-xs">*</span>
}

type SectionProps = {
    icon?: React.ComponentType<{ className?: string }>
    title: React.ReactNode
    children: React.ReactNode
}

function Section({ icon: Icon, title, children }: SectionProps) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5" />}
                <h2 className="text-xl font-semibold leading-tight">{title}</h2>
            </div>
            <div className="grid gap-4">{children}</div>
        </div>
    )
}

const schema = Yup.object({
    // Personal Information (Step 1)
    firstName: Yup.string().min(2, "First name is required").required("First name is required"),
    middleName: Yup.string().notRequired(),
    lastName: Yup.string().min(2, "Last name is required").required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().min(7, "Phone is required").required("Phone is required"),
    address: Yup.string().min(2, "Address is required").required("Address is required"),
    city: Yup.string().min(2, "City is required").required("City is required"),
    state: Yup.string().min(2, "US State is required").required("US State is required"),
    zip: Yup.string().matches(/^\d{5}$/, "Zip must be exactly 5 digits").required("Zip is required"),
    availableFrom: Yup.date().min(new Date(), "Date cannot be in the past").required("Available from is required"),
    nationality: Yup.string().min(2, "Nationality is required").required("Nationality is required"),
    linkedin: Yup.string()
        .matches(/^(na|NA|https?:\/\/(www\.)?linkedin\.com\/.*)$/i, "Enter a valid LinkedIn URL or 'NA'")
        .required("LinkedIn URL is required"),
    // Education (Step 2)
    degree: Yup.string().min(2, "Degree is required").required("Degree is required"),
    institution: Yup.string().min(2, "Institution is required").required("Institution is required"),
    graduationYear: Yup.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear())
        .required("Graduation year is required"),
    // Work Eligibility (Step 3)
    position: Yup.string().min(2, "Position is required").required("Position is required"),
    experienceYears: Yup.number().min(0, "Invalid number").required("Experience years is required"),
    visaType: Yup.string().min(1, "VISA Type is required").required("VISA Type is required"),
    eadStartDate: Yup.date().required("EAD Start Date is required"),
    eadEndDate: Yup.date().required("EAD End Date is required"),
    // Preferences (Step 4)
    jobType: Yup.string().oneOf(["full", "intern", "both"], "Please select a job type").required("Job type is required"),
    contractType: Yup.string().oneOf(["yes", "no"], "Please select Yes or No").required("Contract type is required"),
    preferredPositions: Yup.string()
        .min(1, "Preferred job positions are required")
        .max(500, "Keep it concise (max 500 characters)")
        .required("Preferred positions are required"),
    hourlyWage: Yup.number()
        .positive("Hourly wage must be greater than 0")
        .max(1000, "Please enter a realistic hourly rate")
        .notRequired(),
    annualSalary: Yup.number()
        .min(1, "Annual salary must be at least 1 USD")
        .max(1000000, "Please enter a realistic annual salary")
        .required("Annual salary is required"),
    applyIfLess: Yup.string()
        .oneOf(["yes", "no", "other"], "Please select an option")
        .required("Please select an option"),
    applyIfLessOther: Yup.string().when("applyIfLess", {
        is: "other",
        then: (schema) => schema.required("Please specify your answer"),
        otherwise: (schema) => schema.notRequired(),
    }),
    // Demographics (Step 5)
    gender: Yup.string().required("Gender is required"),
    isHispanic: Yup.string().required("Hispanic/Latino status is required"),
    race: Yup.string().required("Race is required"),
    isVeteran: Yup.string().required("Veteran status is required"),
    hasDisability: Yup.string().required("Disability status is required"),
    messageToHM: Yup.string().max(10000, "Message too long").required("Message to Hiring Manager is required"),
    messageToSpecialist: Yup.string()
        .max(100000, "Message too long")
        .required("Message to Specialist is required"),
})

type FormData = Yup.InferType<typeof schema>

const App = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        trigger,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    })

    const [step, setStep] = useState(1)
    const totalSteps = 5

    const stepFields: Record<number, (keyof FormData)[]> = {
        1: [
            "firstName",
            "middleName",
            "lastName",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "zip",
            "availableFrom",
            "nationality",
            "linkedin",
        ],
        2: ["degree", "institution", "graduationYear"],
        3: ["position", "experienceYears", "visaType", "eadStartDate", "eadEndDate"],
        4: ["jobType", "contractType", "preferredPositions", "hourlyWage", "annualSalary", "applyIfLess", "applyIfLessOther"],
        5: ["gender", "isHispanic", "race", "isVeteran", "hasDisability", "messageToHM", "messageToSpecialist"],
    }

    const nextStep = async () => {
        const isValid = await trigger(stepFields[step])
        if (isValid && step < totalSteps) {
            setStep((prev) => prev + 1)
        }
    }

    const prevStep = () => {
        if (step > 1) {
            setStep((prev) => prev - 1)
        }
    }

    const onSubmit = (data: any) => {
        console.log("Form submitted:", data)
    }

    return (
        <div className="">
            {/* Header */}
            <div className="mb-6 text-center header">
                <div className="flex flex-row max-w-5xl mx-auto py-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                    >
                        OS
                    </motion.div>
                    <div className="flex flex-col items-start justify-center pt-4">
                        <motion.div
                            className="text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            OCEANSMITH.
                        </motion.div>
                        <motion.div
                            className="text-1xl font-semibold text-muted-foreground"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Job Hunt Made Easy
                        </motion.div>
                    </div>
                </div>
            </div>

            <form className="max-w-5xl mx-auto p-4" onSubmit={handleSubmit(onSubmit)}>
                <Card className="shadow-xl rounded-2xl">
                    <CardContent className="px-6 space-y-5">
                        {/* STEP 1: Personal Information */}
                        {step === 1 && (
                            <Section icon={User} title="Personal Information">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label className="mb-2">First Name <Asterisk /></Label>
                                        <Input {...register("firstName")} />
                                        {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Middle Name</Label>
                                        <Input {...register("middleName")} />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Last Name <Asterisk /></Label>
                                        <Input {...register("lastName")} />
                                        {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Email <Asterisk /></Label>
                                        <Input type="email" {...register("email")} />
                                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Phone <Asterisk /></Label>
                                        <Input type="tel" {...register("phone")} />
                                        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label className="mb-2">Address <Asterisk /></Label>
                                        <Input {...register("address")} />
                                        {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div className="md:col-span-2">
                                            <Label className="mb-2">City <Asterisk /></Label>
                                            <Input {...register("city")} />
                                            {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
                                        </div>
                                        <div>
                                            <Label className="mb-2">US State <Asterisk /></Label>
                                            <Controller
                                                name="state"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a state" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="alabama">Alabama</SelectItem>
                                                            <SelectItem value="alaska">Alaska</SelectItem>
                                                            <SelectItem value="arizona">Arizona</SelectItem>
                                                            <SelectItem value="arkansas">Arkansas</SelectItem>
                                                            <SelectItem value="california">California</SelectItem>
                                                            <SelectItem value="colorado">Colorado</SelectItem>
                                                            <SelectItem value="connecticut">Connecticut</SelectItem>
                                                            <SelectItem value="delaware">Delaware</SelectItem>
                                                            <SelectItem value="florida">Florida</SelectItem>
                                                            <SelectItem value="georgia">Georgia</SelectItem>
                                                            <SelectItem value="hawaii">Hawaii</SelectItem>
                                                            <SelectItem value="idaho">Idaho</SelectItem>
                                                            <SelectItem value="illinois">Illinois</SelectItem>
                                                            <SelectItem value="indiana">Indiana</SelectItem>
                                                            <SelectItem value="iowa">Iowa</SelectItem>
                                                            <SelectItem value="kansas">Kansas</SelectItem>
                                                            <SelectItem value="kentucky">Kentucky</SelectItem>
                                                            <SelectItem value="louisiana">Louisiana</SelectItem>
                                                            <SelectItem value="maine">Maine</SelectItem>
                                                            <SelectItem value="maryland">Maryland</SelectItem>
                                                            <SelectItem value="massachusetts">Massachusetts</SelectItem>
                                                            <SelectItem value="michigan">Michigan</SelectItem>
                                                            <SelectItem value="minnesota">Minnesota</SelectItem>
                                                            <SelectItem value="mississippi">Mississippi</SelectItem>
                                                            <SelectItem value="missouri">Missouri</SelectItem>
                                                            <SelectItem value="montana">Montana</SelectItem>
                                                            <SelectItem value="nebraska">Nebraska</SelectItem>
                                                            <SelectItem value="nevada">Nevada</SelectItem>
                                                            <SelectItem value="new-hampshire">New Hampshire</SelectItem>
                                                            <SelectItem value="new-jersey">New Jersey</SelectItem>
                                                            <SelectItem value="new-mexico">New Mexico</SelectItem>
                                                            <SelectItem value="new-york">New York</SelectItem>
                                                            <SelectItem value="north-carolina">North Carolina</SelectItem>
                                                            <SelectItem value="north-dakota">North Dakota</SelectItem>
                                                            <SelectItem value="ohio">Ohio</SelectItem>
                                                            <SelectItem value="oklahoma">Oklahoma</SelectItem>
                                                            <SelectItem value="oregon">Oregon</SelectItem>
                                                            <SelectItem value="pennsylvania">Pennsylvania</SelectItem>
                                                            <SelectItem value="rhode-island">Rhode Island</SelectItem>
                                                            <SelectItem value="south-carolina">South Carolina</SelectItem>
                                                            <SelectItem value="south-dakota">South Dakota</SelectItem>
                                                            <SelectItem value="tennessee">Tennessee</SelectItem>
                                                            <SelectItem value="texas">Texas</SelectItem>
                                                            <SelectItem value="utah">Utah</SelectItem>
                                                            <SelectItem value="vermont">Vermont</SelectItem>
                                                            <SelectItem value="virginia">Virginia</SelectItem>
                                                            <SelectItem value="washington">Washington</SelectItem>
                                                            <SelectItem value="west-virginia">West Virginia</SelectItem>
                                                            <SelectItem value="wisconsin">Wisconsin</SelectItem>
                                                            <SelectItem value="wyoming">Wyoming</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
                                        </div>
                                        <div>
                                            <Label className="mb-2">Zip <Asterisk /></Label>
                                            <Input {...register("zip")} />
                                            {errors.zip && <p className="text-xs text-red-600 mt-1">{errors.zip.message}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Available to work from <Asterisk /></Label>
                                        <Controller
                                            name="availableFrom"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    className="w-full border rounded-md p-2"
                                                    placeholderText="MM/DD/YYYY"
                                                    dateFormat="MM/dd/yyyy"
                                                />
                                            )}
                                        />
                                        {errors.availableFrom && (
                                            <p className="text-xs text-red-600 mt-1">{errors.availableFrom.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Nationality <Asterisk /></Label>
                                        <Input {...register("nationality")} />
                                        {errors.nationality && <p className="text-xs text-red-600 mt-1">{errors.nationality.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">LinkedIn URL <Asterisk /></Label>
                                        <Input {...register("linkedin")} placeholder="Enter NA if none" />
                                        {errors.linkedin && <p className="text-xs text-red-600 mt-1">{errors.linkedin.message}</p>}
                                    </div>
                                </div>
                            </Section>
                        )}

                        {/* STEP 2: Education */}
                        {step === 2 && (
                            <Section icon={GraduationCap} title="Education">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Degree <Asterisk /></Label>
                                        <Input {...register("degree")} />
                                        {errors.degree && <p className="text-xs text-red-600 mt-1">{errors.degree.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Institution <Asterisk /></Label>
                                        <Input {...register("institution")} />
                                        {errors.institution && <p className="text-xs text-red-600 mt-1">{errors.institution.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Graduation Year <Asterisk /></Label>
                                        <Input type="number" {...register("graduationYear", { valueAsNumber: true })} />
                                        {errors.graduationYear && (
                                            <p className="text-xs text-red-600 mt-1">{errors.graduationYear.message}</p>
                                        )}
                                    </div>
                                </div>
                            </Section>
                        )}

                        {/* STEP 3: Work Eligibility */}
                        {step === 3 && (
                            <Section icon={BriefcaseBusiness} title="Work Eligibility">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Position <Asterisk /></Label>
                                        <Input {...register("position")} />
                                        {errors.position && <p className="text-xs text-red-600 mt-1">{errors.position.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Years of Experience <Asterisk /></Label>
                                        <Input type="number" {...register("experienceYears", { valueAsNumber: true })} />
                                        {errors.experienceYears && (
                                            <p className="text-xs text-red-600 mt-1">{errors.experienceYears.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="mb-2">VISA Type <Asterisk /></Label>
                                        <Input {...register("visaType")} placeholder="e.g., OPT, H1B, CPT" />
                                        {errors.visaType && <p className="text-xs text-red-600 mt-1">{errors.visaType.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">EAD Start Date <Asterisk /></Label>
                                        <Controller
                                            name="eadStartDate"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    className="w-full border rounded-md p-2"
                                                    placeholderText="MM/DD/YYYY"
                                                    dateFormat="MM/dd/yyyy"
                                                />
                                            )}
                                        />
                                        {errors.eadStartDate && (
                                            <p className="text-xs text-red-600 mt-1">{errors.eadStartDate.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="mb-2">EAD End Date <Asterisk /></Label>
                                        <Controller
                                            name="eadEndDate"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    className="w-full border rounded-md p-2"
                                                    placeholderText="MM/DD/YYYY"
                                                    dateFormat="MM/dd/yyyy"
                                                />
                                            )}
                                        />
                                        {errors.eadEndDate && <p className="text-xs text-red-600 mt-1">{errors.eadEndDate.message}</p>}
                                    </div>
                                </div>
                            </Section>
                        )}

                        {/* STEP 4: Preferences */}
                        {step === 4 && (
                            <Section icon={ClipboardList} title="Preferences">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Job Type <Asterisk /></Label>
                                        <Controller
                                            name="jobType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="full">Full Time</SelectItem>
                                                        <SelectItem value="intern">Internship</SelectItem>
                                                        <SelectItem value="both">Both</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.jobType && <p className="text-xs text-red-600 mt-1">{errors.jobType.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Contract Type (W2/1099) <Asterisk /></Label>
                                        <Controller
                                            name="contractType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="no">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.contractType && (
                                            <p className="text-xs text-red-600 mt-1">{errors.contractType.message}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="mb-2">Preferred Positions <Asterisk /></Label>
                                        <Textarea
                                            {...register("preferredPositions")}
                                            placeholder="e.g., Software Developer, Project Manager"
                                        />
                                        {errors.preferredPositions && (
                                            <p className="text-xs text-red-600 mt-1">{errors.preferredPositions.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Hourly Wage Expectation</Label>
                                        <Input type="number" step="0.01" {...register("hourlyWage", { valueAsNumber: true })} />
                                        {errors.hourlyWage && <p className="text-xs text-red-600 mt-1">{errors.hourlyWage.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Annual Salary Expectation <Asterisk /></Label>
                                        <Input
                                            type="number"
                                            step="1000"
                                            {...register("annualSalary", { valueAsNumber: true })}
                                        />
                                        {errors.annualSalary && (
                                            <p className="text-xs text-red-600 mt-1">{errors.annualSalary.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Apply if offered less? <Asterisk /></Label>
                                        <Controller
                                            name="applyIfLess"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="no">No</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.applyIfLess && <p className="text-xs text-red-600 mt-1">{errors.applyIfLess.message}</p>}
                                    </div>
                                    <div>
                                        <Controller
                                            name="applyIfLess"
                                            control={control}
                                            render={({ field }) => (
                                                <>
                                                    {field.value === "other" && (
                                                        <div>
                                                            <Label className="mb-2">Specify if Other</Label>
                                                            <Input {...register("applyIfLessOther")} />
                                                            {errors.applyIfLessOther && (
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    {errors.applyIfLessOther.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </div>
                                </div>
                            </Section>
                        )}

                        {/* STEP 5: Demographics */}
                        {step === 5 && (
                            <Section icon={Globe2} title="Demographics & Messages">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Gender <Asterisk /></Label>
                                        <Controller
                                            name="gender"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Hispanic/Latino? <Asterisk /></Label>
                                        <Controller
                                            name="isHispanic"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="no">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.isHispanic && <p className="text-xs text-red-600 mt-1">{errors.isHispanic.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="mb-2">Race <Asterisk /></Label>
                                        <Input {...register("race")} />
                                        {errors.race && <p className="text-xs text-red-600 mt-1">{errors.race.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Veteran? <Asterisk /></Label>
                                        <Controller
                                            name="isVeteran"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="no">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.isVeteran && <p className="text-xs text-red-600 mt-1">{errors.isVeteran.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="mb-2">Disability? <Asterisk /></Label>
                                        <Controller
                                            name="hasDisability"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="no">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.hasDisability && (
                                            <p className="text-xs text-red-600 mt-1">{errors.hasDisability.message}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="mb-2">Message to Hiring Manager <Asterisk /></Label>
                                        <Textarea {...register("messageToHM")} maxLength={10000} />
                                        {errors.messageToHM && <p className="text-xs text-red-600 mt-1">{errors.messageToHM.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="mb-2">Message to Specialist <Asterisk /></Label>
                                        <Textarea {...register("messageToSpecialist")} maxLength={100000} />
                                        {errors.messageToSpecialist && (
                                            <p className="text-xs text-red-600 mt-1">{errors.messageToSpecialist.message}</p>
                                        )}
                                    </div>
                                </div>
                            </Section>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="mt-6">
                    <div className="mx-auto max-w-5xl flex items-center justify-between gap-4 rounded-2xl bg-background/80 backdrop-blur shadow-lg border p-3">
                        <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                            Back
                        </Button>
                        {step < totalSteps ? (
                            <Button type="button" onClick={nextStep}>
                                Next
                            </Button>
                        ) : (
                            <Button type="submit">Submit</Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}

export default App