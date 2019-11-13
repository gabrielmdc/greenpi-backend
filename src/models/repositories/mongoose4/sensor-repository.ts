import mongoose = require("mongoose");
import { rejectIfNull, normalizeData, paginateQuery } from "./helpers";
import { SensorRepository } from "../interfaces/sensor-repository";
import { Sensor } from "../../entities/sensor";
import { PaginationRequest } from "../../../lib/pagination/request";

interface SensorModel extends Sensor, mongoose.Document {}

const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A sensor must have a name"]
  },
  description: String,
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SensorType",
    required: [true, "A sensor must have a sensor type"]
  },
  connectionPorts: [Number]
});

const SensorModel = mongoose.model<SensorModel>("Sensor", sensorSchema);

const defaultPagination: PaginationRequest = {
  limit: 10
};

export class SensorMongooseRepository implements SensorRepository {
  async create(document: Sensor): Promise<Sensor> {
    let doc = await SensorModel.create(document);
    doc = await SensorModel.populate(doc, {
      path: "type"
    });
    return normalizeData(doc);
  }

  async update(document: Sensor): Promise<Sensor> {
    const doc = await SensorModel.findByIdAndUpdate(document.id, document, {
      new: true
    }).exec();
    rejectIfNull("Sensor not found", doc);
    return normalizeData(doc);
  }

  async remove(id: string): Promise<Sensor> {
    const doc = await SensorModel.findByIdAndRemove(id).exec();
    rejectIfNull("Sensor not found", doc);
    return normalizeData(doc);
  }

  async findAll(pagination: PaginationRequest = defaultPagination) {
    const query = SensorModel.find();
    const countQuery = SensorModel.estimatedDocumentCount();
    const paginatedData = await paginateQuery(query, countQuery, pagination);
    return paginatedData;
  }

  async find(id: string): Promise<Sensor> {
    const doc = await SensorModel.findById(id).populate("type");
    rejectIfNull("Sensor not found", doc);
    return normalizeData(doc);
  }
}
