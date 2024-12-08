import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreatePsychographDto {
    @IsNotEmpty()
    @IsEnum(['activity', 'interest', 'opinion'])
    type: string;

    @IsNotEmpty()
    @IsString()
    option_value: string;
}
