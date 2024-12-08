import { IsNotEmpty, IsString } from "class-validator";

export class UpdateDemographOptionDto{

    @IsNotEmpty()
    @IsString()
    option_value: string;

    @IsNotEmpty()
    @IsString()
    result_value: string;
}
