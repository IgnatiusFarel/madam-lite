import { ValidateNested } from "class-validator";
import { CreatePsychographResponseDataDto } from "./create-psychograph-response-data.dto";
import { Type } from "class-transformer";

export class CreatePsychographResponseDto {
    aio_analysis_response_id: number;

    type: string;
    total_selected_option: number;

    total_option: number;

    @ValidateNested()
    @Type(() => CreatePsychographResponseDataDto)
    psychograph_response_data: CreatePsychographResponseDto[];
}