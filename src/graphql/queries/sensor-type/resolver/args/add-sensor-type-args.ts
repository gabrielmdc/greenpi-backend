import { Unit } from "../../../../../models/entities/unit";

export interface AddSensorTypeArgs {
  name: string;
  description: string;
  unit: Unit;
}
