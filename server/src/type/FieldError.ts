import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class FieldError {
    @Field()
    filed: string;
    
    @Field()
    message: string;
}