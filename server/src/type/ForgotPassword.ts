import { Field, InputType } from "type-graphql";

@InputType()
export abstract class ForgotPasswordInput{
    @Field()
    email: string;
}