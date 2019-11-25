import { PumpHistorical } from "../../../../models/entities/pump-historical";
import { AddPumpHistoricalArgs } from "./args/add-pump-historical-args";
import { FetchPumpHistoricalArgs } from "./args/fetch-pump-historical-args";
import { GraphqlContext } from "../../../graphql-context";
import { PaginationData } from "../../../../lib/pagination/data";

export interface PumpHistoricalResolver {
  addPumpHistorical(
    args: { pumpHistoricalData: AddPumpHistoricalArgs },
    context: GraphqlContext
  ): Promise<PumpHistorical>;
  deletePumpHistorical(
    args: { id: string },
    context: GraphqlContext
  ): Promise<PumpHistorical>;
  fetchPumpHistoricals(
    args: FetchPumpHistoricalArgs,
    context: GraphqlContext
  ): Promise<PaginationData<PumpHistorical>>;
  getPumpHistorical(
    args: { id: string },
    context: GraphqlContext
  ): Promise<PumpHistorical>;
}
