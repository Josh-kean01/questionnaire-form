import { useState, type SetStateAction } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, GraduationCap, BriefcaseBusiness, ClipboardList, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "./assets/images/oceansmith_hd_vibrant-removebg-preview.png"
import "./App.css"
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";


import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


function Asterisk() {
  return <span className="text-red-600 text-xs">*</span>;
}

type SectionProps = {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  children: React.ReactNode;
};

function Section({ icon: Icon, title, children, }: SectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5" />}
        <div>
          <h2 className="text-xl font-semibold leading-tight">{title}</h2>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

type TextareaWithCounterProps = {
  maxLength?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
};

function TextareaWithCounter({ maxLength, value, onChange, placeholder, required }: TextareaWithCounterProps) {
  const remaining = (maxLength ?? 0) - (value?.length ?? 0);
  return (
    <div className="space-y-1.5">
      <Textarea maxLength={maxLength} value={value} onChange={onChange} placeholder={placeholder} required={required} />
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">{remaining} of {maxLength} character(s) left</div>
      )}
    </div>
  );
}

const personalSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name is required"),
  email: z.email("Invalid email"),
  phone: z.string().min(7, "Phone is required"),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "US State is required"),
  zip: z.string().regex(/^\d{5}$/, { message: "Zip must be exactly 5 digits" }),
  availableFrom: z.date().min(new Date(), "Date cannot be in the past"),
  nationality: z.string().min(2),
  linkedin: z.string().trim().regex(
    /^(na|NA|https?:\/\/(www\.)?linkedin\.com\/.*)$/i,
    { message: "Enter a valid LinkedIn URL or 'NA'" }),
  yearsOfExperience: z
    .number()
    .min(0, { message: "Experience must be 0 or more" })
    .or(z.nan()),
  previousJobTitle: z.string().optional(),
  jobStartDate: z.date().optional(),
  jobEndDate: z.date().optional(),
  visaType: z.string().min(1, { message: "VISA Type is required" }),
  eadStartDate: z.date({ error: "Please select a valid date" }),
  eadEndDate: z.date({ error: "Please select a valid end date" }),
  jobType: z.enum(["full", "intern", "both"], {
    error: "Please select a job type",
  }),
  contractType: z.enum(["yes", "no"], {
    error: "Please select Yes or No",
  }),
  preferredPositions: z
    .string()
    .min(1, "Preferred job positions are required")
    .max(500, "Keep it concise (max 500 characters)"
    ),
  hourlyWage: z
    .number()
    .positive("Hourly wage must be greater than 0")
    .max(1000, "Please enter a realistic hourly rate")
    .optional(), // only validates if the user enters something

  annualSalary: z
    .number()
    .min(1, "Annual salary must be at least 1 USD")
    .max(1000000, "Please enter a realistic annual salary"),

  applyIfLess: z.enum(["yes", "no", "other"], {
    message: "Please select an option",
  }),
  applyIfLessOther: z.string().optional(),







  // optional if you want to handle NaN separately
}).refine(
  (data) => {
    if (data.applyIfLess === "other") {
      return data.applyIfLessOther && data.applyIfLessOther.trim() !== "";
    }
    return true;
  },
  {
    message: "Please specify your answer",
    path: ["applyIfLessOther"],
  }
);



const jobSchema = z.object({
  position: z.string().min(2, "Position is required"),
  experienceYears: z.number().min(0, "Invalid number"),
  skills: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  degree: z.string().min(2, "Degree is required"),
  institution: z.string().min(2, "Institution is required"),
  graduationYear: z.number().int().min(1900).max(new Date().getFullYear()),
});

// Merge all into one schema
export const fullApplicationSchema = personalSchema
  .merge(jobSchema)
  .merge(educationSchema);

type FullApplicationForm = z.infer<typeof fullApplicationSchema>;


const App = () => {
  // const { register, handleSubmit, watch, setError, getValues, trigger, setFocus, formState: { errors }, control } = useForm<FullApplicationForm>({
  const { register, handleSubmit, watch, trigger, setFocus, formState: { errors }, control } = useForm<FullApplicationForm>({
    resolver: zodResolver(fullApplicationSchema),
    mode: "onChange",       // 👈 validates while typing
    reValidateMode: "onChange", // 👈 re-validates while typing
  });

  // const validateStep = (schema: z.ZodTypeAny) => {
  //   const values = getValues();
  //   const result = schema.safeParse(values);
  //   if (!result.success) {
  //     result.error.issues.forEach((issue) => {
  //       setError(issue.path[0] as any, { message: issue.message });
  //     });
  //     return false;
  //   }
  //   return true;
  // };

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // textareas w/ counters
  const [travelMilesNotes, setTravelMilesNotes] = useState("");
  const [msgHM, setMsgHM] = useState("");
  const [msgSpecialist, setMsgSpecialist] = useState("");

  const go = (dir: number) => setStep((s) => Math.min(totalSteps, Math.max(1, s + dir)));

  const onSubmit = (data: FullApplicationForm) => {
    console.log("Form submitted:", data);
    // later: send `data` to backend / email service
  };

  // Map step numbers to schema shapes
  const stepSchemas: Record<number, Record<string, any>> = {
    1: personalSchema.shape,
    2: educationSchema.shape,
    // 3: workEligibilitySchema.shape,
    // 4: demographicsSchema.shape,
    // 5: finalSchema.shape, // or {} if your final step has no inputs
  };

  const handleNext = async () => {
    const currentFields = Object.keys(stepSchemas[step] ?? {});

    console.log("Step:", step);
    console.log("Validating fields:", currentFields);

    const isValid = await trigger(currentFields as (keyof FullApplicationForm)[]);

    if (isValid) {
      go(1); // ✅ move to next step
    } else {
      // ❌ focus the first invalid field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        setFocus(firstErrorField as keyof FullApplicationForm);
      }
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 text-center header">
        <div className="flex flex-row max-w-5xl mx-auto py-3">
          <motion.div className="">
            <motion.img initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }} src={logo} alt="Logo" className="h-32" />
          </motion.div>
          <div className="flex flex-col items-start justify-center pt-4">
            <motion.div
              className="text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ocean"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              OCEANSMITH.
            </motion.div>
            <div className="text-1xl font-semibold text-muted-foreground subtitle">
              <motion.div initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>  Job Hunt Made Easy</motion.div>
            </div>


          </div>
        </div>
      </div>



      <form className="max-w-5xl mx-auto p-4" onSubmit={handleSubmit(onSubmit)}>

        <Card className="shadow-xl rounded-2xl">
          <CardContent className="px-6 space-y-5">
            {/* STEP 1 */}
            {step === 1 && (
              <Section icon={User} title="Personal Information" >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label className="mb-2">First Name <Asterisk /></Label>
                    <Input {...register("firstName")} />
                    {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="md:col-span-1">
                    <Label className="mb-2">Middle Name</Label><Input />
                  </div>
                  <div className="md:col-span-1">
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
                        name="state"               // <-- field name
                        control={control}          // <-- comes from useForm
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
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
                      {errors.state && <p className="text-red-500">{errors.state.message}</p>}

                    </div>
                    <div>
                      <Label className="mb-2">Zip <Asterisk /></Label>
                      <Input {...register("zip")} />
                      {errors.zip && <p className="text-xs text-red-600 mt-1">{errors.zip.message}</p>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                  <div>
                    <Label className="mb-2">Nationality <Asterisk /></Label>
                    <Input placeholder="Country" {...register("nationality")} />
                    {errors.nationality && <p className="text-xs text-red-600 mt-1">{errors.nationality.message}</p>}
                  </div>
                  <div>
                    <Label className="mb-2">Your LinkedIn URL <Asterisk /></Label>
                    <Input placeholder=" Enter NA only if you do not have a LinkedIn." {...register("linkedin")} />
                    {errors.linkedin ? (
                      <p className="text-xs text-red-600 mt-1">{errors.linkedin.message}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter NA only if you do not have a LinkedIn.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="mb-2">Years of professional experience <Asterisk /></Label>
                    <Input
                      type="number"
                      {...register("yearsOfExperience", { valueAsNumber: true })}
                      placeholder="Enter number of years"
                    />
                    {errors.yearsOfExperience ? (
                      <p className="text-xs text-red-600 mt-1">{errors.yearsOfExperience.message}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Enter 0 if no experience yet</p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-2">Previous Job Title</Label>
                    <Input {...register("previousJobTitle")} />
                  </div>
                  <div>
                    <Label className="mb-2">Date Previous Job Started</Label>
                    <Controller
                      name="jobStartDate"
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
                  </div>
                  <div>
                    <Label className="mb-2">Date Previous Job Ended</Label>
                    <Controller
                      name="jobEndDate"
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
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">VISA Type <Asterisk /></Label>
                    <Controller
                      name="visaType"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Input
                            {...field}
                          />
                          {errors.visaType ? (
                            <p className="text-red-500 text-sm">{errors.visaType.message}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">For example, OPT, H1B or CPT</p>
                          )}

                        </div>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {errors.eadStartDate ? (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.eadStartDate.message}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          If you are a GC holder or USA Citizen mention 00/00/00
                        </p>
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
                      {errors.eadEndDate ? (
                        <p className="text-xs text-red-600 mt-1">{errors.eadEndDate.message}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          If you are a GC holder or USA Citizen mention 00/00/00
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Apply for Full time jobs or internships? <Asterisk /></Label>
                    <Controller
                      name="jobType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full">
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
                    {errors.jobType && (
                      <p className="text-xs text-red-600 mt-1">{errors.jobType.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-2">
                      Apply for W2 or 1099 jobs as well (Contract Jobs)? <Asterisk />
                    </Label>
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
                </div>

                <div>
                  <Label className="mb-2">
                    Preferred job positions <Asterisk />
                  </Label>
                  <Textarea
                    {...register("preferredPositions")}
                    placeholder="For example, 1. Project Manager 2. Assistant Project Manager 3. Human Resource Manager"
                  />
                  {errors.preferredPositions && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.preferredPositions.message}
                    </p>
                  )}
                  {!errors.preferredPositions && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ex, Software Developer, Project Manager, Business Analyst
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div>
                      <Label className="mb-2">Hourly wage expectation</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("hourlyWage", { valueAsNumber: true })}
                        placeholder="USD"
                      />
                      {errors.hourlyWage && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.hourlyWage.message}
                        </p>
                      )}
                    </div>

                  </div>
                  <div>
                    <div>
                      <Label className="mb-2">
                        Annual salary expectation <Asterisk />
                      </Label>
                      <Input
                        type="number"
                        step="1000"
                        {...register("annualSalary", { valueAsNumber: true })}
                        placeholder="USD"
                        required
                      />
                      {errors.annualSalary && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.annualSalary.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">If a company offers less than your expectation, can we apply? <Asterisk /></Label>
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
                    {errors.applyIfLess && (
                      <p className="text-xs text-red-600 mt-1">{errors.applyIfLess.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Ex: You expect $100k but company offers 65–85k. Can we apply at the max they offer?
                    </p>
                  </div>
                  <div>
                    {watch("applyIfLess") === "other" && (
                      <div className="">
                        <Label className="mb-2">
                          If you answered 'Other', please specify
                        </Label>
                        <Input {...register("applyIfLessOther")} placeholder="Explain here..." />
                        {errors.applyIfLessOther && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.applyIfLessOther.message}
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </Section>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <Section icon={GraduationCap} title="Education" >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Do you have a bachelor’s degree?</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">University/College (Bachelor’s)</Label>
                    <Input />
                  </div>
                  <div>
                    <Label className="mb-2">Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label className="mb-2">End Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label className="mb-2">CGPA Bachelor's</Label>
                    <Input />
                  </div>
                  <div>
                    <Label className="mb-2">Highest education level achieved <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masters">Master of Science</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">If you chose 'Other', specify</Label>
                    <Input />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">University/College (Highest level)</Label>
                    <Input />
                  </div>
                  <div>
                    <Label className="mb-2">Highest education Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label className="mb-2">Highest Education End Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label className="mb-2">Highest Education CGPA</Label>
                    <Input />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">Languages known</Label>
                    <Input placeholder="Comma-separated" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">Certification (If any) <Asterisk /></Label>
                    <Input required />
                  </div>
                </div>
              </Section>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <Section icon={BriefcaseBusiness} title="Work Eligibility & Preferences">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Are you at least 18 years of age? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Date Of Birth <Asterisk /></Label>
                    <Input type="date" required />
                  </div>
                  <div>
                    <Label className="mb-2">Legally authorized to work in the United States? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Will you now or in future require sponsorship? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">If YES above, will you require sponsorship right away or in future</Label>
                    <Input placeholder="In Future (New H1B filing / Green card filing)" />
                  </div>
                  <div>
                    <Label className="mb-2">Total number of hours you prefer per week <Asterisk /></Label>
                    <Input placeholder="ex, 40 hr/week" required />
                  </div>
                  <div>
                    <Label className="mb-2">Are you willing to travel? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">How much percentage will you travel? <Asterisk /></Label>
                    <Input placeholder="0-25%" required />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">How far will you travel? <span className="text-muted-foreground">(Answer in miles)</span></Label>
                    <TextareaWithCounter
                      maxLength={1000}
                      value={travelMilesNotes}
                      onChange={(e: { target: { value: SetStateAction<string>; }; }) => setTravelMilesNotes(e.target.value)}
                      placeholder="Describe typical travel distance in miles"
                      required={true}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Willing to Travel Internationally? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Are you willing to work anywhere within the USA? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Are you willing to relocate? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">If yes to relocate, preferred location</Label>
                    <Input />
                  </div>
                  <div>
                    <Label className="mb-2">For a REMOTE job, willing to work anywhere within the USA? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Will you need relocation help? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">Reference Details</Label>
                    <Input placeholder="Can be someone from your past job or university professor" />
                  </div>
                  <div>
                    <Label className="mb-2">Do you have a valid driving license? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">If yes, licence type</Label><Input placeholder="Class D" />
                  </div>
                  <div>
                    <Label className="mb-2">Covid-19 Vaccine status <Asterisk /></Label><Input required />
                  </div>
                  <div>
                    <Label className="mb-2">Preferred Shift</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="1. Day  2. Night  3. Evening" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day Shift</SelectItem>
                        <SelectItem value="night">Night Shift</SelectItem>
                        <SelectItem value="evening">Evening Shift</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Willing to work on weekend (if required) <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Have you ever been convicted of a criminal offense? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">If Yes, please explain</Label>
                    <Textarea placeholder="Details" />
                  </div>
                </div>
              </Section>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <Section icon={ClipboardList} title="Demographics & Messages">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Gender <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Are you Hispanic/Latino? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2"><Label>Race <Asterisk /></Label><Input placeholder="e.g., Asian" required /></div>
                  <div>
                    <Label className="mb-2">Are you a Veteran? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Do you have a disability? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">Your message to the Hiring Manager <Asterisk /></Label>
                    <TextareaWithCounter maxLength={10000} value={msgHM} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setMsgHM(e.target.value)} placeholder="Write a concise message for the hiring manager" required />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">Your message to the Jack Meow Job Hunt Specialist(s) <Asterisk /></Label>
                    <TextareaWithCounter maxLength={100000} value={msgSpecialist} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setMsgSpecialist(e.target.value)} placeholder="Share anything that helps us apply on your behalf" required />
                  </div>
                </div>
              </Section>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <Section icon={Globe2} title="Final Section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Do you want us to apply for jobs all over the USA? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2"><Label>If NO above, list your location preference</Label><Input /></div>
                  <div>
                    <Label className="mb-2">For REMOTE jobs, can we apply all over the USA? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">If NO above, list location preference for REMOTE jobs</Label>
                    <Input />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">Is there any company you DO NOT want us to apply to? <Asterisk /></Label>
                    <Textarea />
                  </div>
                  <div>
                    <Label className="mb-2">Your Whatsapp number for Customer Support <Asterisk /></Label>
                    <Input />
                  </div>
                  <div>
                    <Label className="mb-2">Are you a new customer or a returning customer? <Asterisk /></Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Customer</SelectItem>
                        <SelectItem value="returning">Returning Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">How did you hear about Jack Meow? <Asterisk /></Label>
                    <Input />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">If your friend referred us, please mention their name</Label><Input />
                  </div>
                </div>
              </Section>
            )}
          </CardContent>
        </Card>

        {/* Sticky actions */}
        <div className="mt-6">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4 rounded-2xl bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg border p-3">

            {/* <div className="flex gap-2 justify-between w-full">
              <Button variant="outline" onClick={() => go(-1)} disabled={step <= 1}>Back</Button>

              {step < totalSteps ? (
                <Button type="button" onClick={() => go(1)}>Next</Button>
              ) : (
                <Button type="submit">Submit</Button>
              )}
            </div> */}

            <div className="flex gap-2 justify-between w-full">
              <Button
                variant="outline"
                onClick={() => go(-1)}
                disabled={step <= 1}
              >
                Back
              </Button>

              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit">Submit</Button>
              )}
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}


export default App;