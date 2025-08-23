// import { z } from "zod";

// // Section 1: Personal Info
// export const personalSchema = z.object({
//     firstName: z.string().min(2, "First name is required"),
//     lastName: z.string().min(2, "Last name is required"),
//     email: z.string().email("Invalid email"),
//     phone: z.string().min(7, "Phone is required"),
// });

// // Section 2: Job Details
// export const jobSchema = z.object({
//     position: z.string().min(2, "Position is required"),
//     experienceYears: z.coerce.number().min(0, "Invalid number"),
//     skills: z.array(z.string()).optional(),
// });

// // Section 3: Education
// export const educationSchema = z.object({
//     degree: z.string().min(2, "Degree is required"),
//     institution: z.string().min(2, "Institution is required"),
//     graduationYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
// });

// // Merge all into one schema
// export const fullApplicationSchema = personalSchema
//     .merge(jobSchema)
//     .merge(educationSchema);

// export type FullApplicationForm = z.infer<typeof fullApplicationSchema>;

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";

// // import { fullApplicationSchema, FullApplicationForm } from "./schemas";





//   export const personalSchema = z.object({
//   // Basic Info
//   firstName: z.string().min(2, "First name is required"),
//   middleName: z.string().optional(),
//   lastName: z.string().min(2, "Last name is required"),
//   email: z.string().email("Invalid email"),
//   phone: z.string().min(7, "Phone is required"),
//   address: z.string().min(2, "Address is required"),
//   city: z.string().min(2, "City is required"),
//   state: z.string().min(2, "US State is required"),
//   zip: z.string().min(2, "Zip is required"),

//   // Work availability
//   availableFrom: z.string().min(1, "Available from date is required"),
//   nationality: z.string().min(2, "Nationality is required"),
//   linkedInUrl: z
//     .string()
//     .min(2, "LinkedIn URL is required")
//     .refine(
//       (val) => val === "NA" || val.startsWith("http"),
//       "Must be a valid LinkedIn URL or NA"
//     ),

//   // Work experience
//   experienceYears: z.coerce.number().min(0, "Experience is required"),
//   previousJobTitle: z.string().optional(),
//   previousJobStart: z.string().optional(),
//   previousJobEnd: z.string().optional(),

//   // Visa / EAD
//   visaType: z.string().min(2, "VISA type is required"),
//   eadStart: z.string().min(1, "EAD Start Date is required"),
//   eadEnd: z.string().min(1, "EAD End Date is required"),

//   // Job preferences
//   jobType: z.enum(["Full Time", "Internship"], {
//     required_error: "Job type is required",
//   }),
//   contractJobs: z.enum(["Yes", "No"], {
//     required_error: "Contract job preference is required",
//   }),
//   preferredPositions: z.string().min(2, "Preferred job positions are required"),

//   // Compensation
//   hourlyWage: z.coerce.number().optional(),
//   annualSalary: z.coerce.number().min(1, "Annual salary expectation is required"),
//   flexibleSalary: z.enum(["Yes", "No", "Other"], {
//     required_error: "Please specify if we can apply for lower salary jobs",
//   }),
//   flexibleSalaryOther: z.string().optional(),
// });