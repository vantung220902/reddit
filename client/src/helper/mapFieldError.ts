import { FieldError } from "../generated/graphql";

export const mapFieldErrors = (error: FieldError[]): { [key: string]: string } => error.reduce((accumulated, e) => ({
    ...accumulated,
    [e.filed]: [e.message]
}), {})