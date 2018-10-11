import * as restify from "restify";
import * as Middleware from "../middleware/pump-historical";
import * as pumpHistoricalValidator from "../validation/pump-historical";
import * as pumpValidator from "../validation/pump";
import { handleJsonData, handleErrors, checkQuery } from "./helpers";
import { IPumpHistorical } from "../models/interface/pump-historical";

export function routes(server: restify.Server, mainPath: string = ''): void {

    const commonQuery: string[] = ['gte', 'lte', 'sortBy'];

    function byEnvironmentId(req: restify.Request, res: restify.Response,
    next: restify.Next): Promise<IPumpHistorical[]> {
        let commQuery: string[] = commonQuery;
        commQuery.push('byEnvironmentId');
        return checkQuery(commQuery, req.query)
        .then(() => {
            let gte = req.query.gte? new Date(req.query.gte) : null;
            let lte = req.query.lte? new Date(req.query.lte) : null;
            let sortBy: string = req.query.sortBy;
            let environmentId: string = req.query.byEnvironmentId;
            return Middleware
                .fetchByEnvironmentId(environmentId, sortBy, gte, lte);
        });
    }

    function byPumpId(req: restify.Request, res: restify.Response,
    next: restify.Next): Promise<IPumpHistorical[]> {
        let commQuery: string[] = commonQuery;
        commQuery.push('byPumpId');
        return checkQuery(commQuery, req.query)
        .then(() => {
            let gte = req.query.gte? new Date(req.query.gte) : null;
            let lte = req.query.lte? new Date(req.query.lte) : null;
            let sortBy: string = req.query.sortBy;
            let pumpId: string = req.query.byPumpId;
            return Middleware.fetchByPumpId(pumpId, sortBy, gte, lte);
        });
    }

    function byPump(req: restify.Request, res: restify.Response,
    next: restify.Next): Promise<IPumpHistorical[]> {
        let commQuery: string[] = commonQuery;
        commQuery.push('byPump');
        return checkQuery(commQuery, req.query)
        .then(() => {
            let gte = req.query.gte? new Date(req.query.gte) : null;
            let lte = req.query.lte? new Date(req.query.lte) : null;
            let sortBy: string = req.query.sortBy;
            return pumpValidator.validate(req.query.pump, true)
            .then(pump => Middleware.fetchByPump(pump, sortBy, gte, lte));
        });
    }

    server.get(mainPath + '/', (req, res, next) => {
        let queryResult: Promise<IPumpHistorical[]> = null;

        if(req.query.byEnvironmentId){
            queryResult = byEnvironmentId(req, res, next);
        } else if(req.query.byPumpId){
            queryResult = byPumpId(req, res, next);
        } else {
            queryResult = byPump(req, res, next);
        }
        queryResult.then(pumpHistorical => handleJsonData(pumpHistorical, res, next))
        .catch(err => handleErrors(err, next));
    });

    server.post(mainPath, (req, res, next) => {
        pumpHistoricalValidator.validate(req.body)
        .then(pumpHistorical => Middleware.addPumpHistorical(pumpHistorical))
        .then(pumpHistorical => handleJsonData(pumpHistorical, res, next, 201))
        .catch(err => handleErrors(err, next));
    });

    server.patch(mainPath, (req, res, next)=>{
        pumpHistoricalValidator.validate(req.body, true)
        .then(pumpHistorical => Middleware.updatePumpHistorical(pumpHistorical))
        .then(pumpHistorical => handleJsonData(pumpHistorical, res, next))
        .catch(err => handleErrors(err, next));
    });

    server.patch(mainPath + '/:id', (req, res, next)=>{
        pumpHistoricalValidator.validate(req.body)
        .then(pumpHistorical => Middleware.updatePumpHistoricalById(req.params.id, pumpHistorical))
        .then(pumpHistorical => handleJsonData(pumpHistorical, res, next))
        .catch(err => handleErrors(err, next));
    });

    server.del(mainPath, (req, res, next)=>{
        pumpHistoricalValidator.validate(req.body, true)
        .then(pumpHistorical => Middleware.deletePumpHistorical(pumpHistorical))
        .then(() => handleJsonData(null, res, next))
        .catch(err => handleErrors(err, next));
    });

    server.del(mainPath + '/:id', (req, res, next)=>{
        Middleware.deletePumpHistoricalById(req.params.id)
        .then(() => handleJsonData(null, res, next))
        .catch(err => handleErrors(err, next));
    });

    server.get(mainPath, (req, res, next)=>{
        Middleware.fetchPumpHistoricals()
        .then(pumpHistoricals => handleJsonData(pumpHistoricals, res, next))
        .catch(err => handleErrors(err, next));
    });

    server.get(mainPath + '/:id', (req, res, next)=>{
        Middleware.getPumpHistoricalById(req.params.id)
        .then(pumpHistorical => handleJsonData(pumpHistorical, res, next))
        .catch(err => handleErrors(err, next));
    });
}