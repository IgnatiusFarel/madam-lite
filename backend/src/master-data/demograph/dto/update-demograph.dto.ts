import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateDemographOptionDto } from "./create-demograph-option.dto";

export class UpdateDemographDto{
    @IsNotEmpty()
    @IsString()
    parameter_name: string;

    @IsOptional()
    @IsString()
    custom_result_parameter: string;

    @ValidateNested({ each: true })
    @Type(() => CreateDemographOptionDto)
    list_of_options: CreateDemographOptionDto[];
}
