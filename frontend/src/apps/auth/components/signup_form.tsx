import { useForm } from "react-hook-form";
import { signUpSchema, type SignUpValues } from "../service/validation";
import { FormInput } from "@shared/components/form_input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import api from "@shared/api";
import { useAppDispatch } from "@shared/store";
import { loginThunk } from "../redux/thunks";

export default function SignUpForm() {
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });
    const dispatch = useAppDispatch()

    const onSubmit = async (values: SignUpValues) => {
        try {
            const { confirmPassword, ...data} = values
            const response = await api.post("/user/create", data)

            if (response.status === 201) {
                await dispatch(loginThunk({identefier: data.username, password: data.password}))
            }
        } catch (error) {
            
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                Create Your Account
            </h2>

            <FormInput 
                label="Username" 
                type="text" 
                placeholder="Your username here"
                {...register("username")}
                error={errors.username}
                containerClass="mb-4"
            />

            <FormInput 
                label="Email" 
                type="email" 
                placeholder="you@example.com"
                {...register("email")}
                error={errors.email}
                containerClass="mb-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormInput 
                    label="Password" 
                    type="password" 
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password}
                />
                <FormInput 
                    label="Confirm Password" 
                    type="password" 
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={[
                    "w-full py-3 px-4 rounded-lg font-medium text-white shadow-md",
                    "bg-gradient-to-r from-blue-600 to-indigo-600",
                    "hover:from-blue-700 hover:to-indigo-700",
                    "transition-all duration-200",
                    "disabled:opacity-70 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                ].join(" ")}
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                    </>
                ) : "Sign Up"}
            </button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Sign in instead
                </Link>
            </p>
        </form>
    )
}