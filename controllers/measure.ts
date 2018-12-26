import { Request, Response, Next } from 'restify';
import { handleJsonData, handleErrors, checkQuery } from './helpers';
import { Measure } from '../models/interface/measure';
import { measureRepository, environmentRepository, sensorRepository } from '../repositories';
import { Sensor } from '../models/interface/sensor';
import * as measureValidator from '../validation/measure';
import * as sensorValidator from '../validation/sensor';
import { socketIOService } from '../services/socket-io.service';

const commonQuery: string[] = ['gte', 'lte', 'sortBy'];

function validateDependencies(measure: Measure): Promise<Measure> {
    const sensorId: string = (<Sensor>measure.sensor).id ||
        <string>measure.sensor;
    return sensorRepository.find(sensorId)
    .then(() => measure);
}

function byEnvironmentId(req: Request, res: Response, next: Next) {
    let commQuery: string[] = commonQuery;
    commQuery.push('byEnvironmentId');
    return checkQuery(commQuery, req.query)
    .then(() => {
        let gte = req.query.gte? new Date(req.query.gte) : null;
        let lte = req.query.lte? new Date(req.query.lte) : null;
        let sortBy: string = req.query.sortBy;
        let environmentId: string = req.query.byEnvironmentId;
        return environmentRepository.find(environmentId)
        .then(environment => measureRepository
            .findAllBySensors(<Array<Sensor>>environment.sensors, sortBy, gte, lte));
    });
}

function bySensorId(req: Request, res: Response, next: Next) {
    let commQuery: string[] = commonQuery;
    commQuery.push('bySensorId');
    return checkQuery(commQuery, req.query)
    .then(() => {
        let gte = req.query.gte? new Date(req.query.gte) : null;
        let lte = req.query.lte? new Date(req.query.lte) : null;
        let sortBy: string = req.query.sortBy;
        let sensorId: string = req.query.bySensorId;
        return sensorRepository.find(sensorId)
        .then(() => measureRepository.findAllBySensorId(sensorId, sortBy, gte, lte));
    });
}

function bySensor(req: Request, res: Response, next: Next) {
    let commQuery: string[] = commonQuery;
    commQuery.push('bySensor');
    return checkQuery(commQuery, req.query)
    .then(() => {
        let gte = req.query.gte? new Date(req.query.gte) : null;
        let lte = req.query.lte? new Date(req.query.lte) : null;
        let sortBy: string = req.query.sortBy;
        return sensorValidator.validate(req.query.sensor, true)
        .then(sensor => sensorRepository.find(sensor.id)
        .then(() => measureRepository.findAllBySensor(sensor, sortBy, gte, lte)));
    });
}

export function getMeasures(req: Request, res: Response, next: Next) {
    let queryResult: Promise<Measure[]> = null;
    if(req.query.byEnvironmentId){
        queryResult = byEnvironmentId(req, res, next);
    } else if(req.query.bySensorId){
        queryResult = bySensorId(req, res, next);
    } else {
        queryResult = bySensor(req, res, next);
    }
    queryResult.then(measure => handleJsonData(req, res, next, measure))
    .catch(err => handleErrors(next, err));
}

export function addMeasure(req: Request, res: Response, next: Next) {
    if (!req.body.date) {
        req.body.date = new Date();
    }
    measureValidator.validate(req.body, false)
    .then(validateDependencies)
    .then(measureRepository.create)
    .then(measure => handleJsonData<Measure>(req, res, next, measure))
    .then(socketIOService.sensorsSIOService.emitLastMeasure)
    .catch(err => handleErrors(next, err));
}

export function updateMeasure(req: Request, res: Response, next: Next) {
    req.body.id = req.params.id;
    measureValidator.validate(req.body)
    .then(validateDependencies)
    .then(measureRepository.update)
    .then(measure => handleJsonData(req, res, next, measure))
    .catch(err => handleErrors(next, err));
}

export function deleteMeasure(req: Request, res: Response, next: Next) {
    measureRepository.remove(req.params.id)
    .then(measure => handleJsonData(req, res, next, measure))
    .catch(err => handleErrors(next, err));
}

export function fetchMeasures(req: Request, res: Response, next: Next) {
    measureRepository.findAll()
    .then(measures => handleJsonData(req, res, next, measures))
    .catch(err => handleErrors(next, err));
}

export function getMeasure(req: Request, res: Response, next: Next) {
    measureRepository.find(req.params.id)
    .then(measure => handleJsonData(req, res, next, measure))
    .catch(err => handleErrors(next, err));
}
