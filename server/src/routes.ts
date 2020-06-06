import express from 'express';
import knex from './database/connection';
import PointController from './controllers/pointsControllers';
import ItemController from './controllers/itemsControllers';


const routes = express.Router();
const pointController = new PointController();
const itemController = new ItemController();

routes.get('/items', itemController.index );

routes.post('/points', pointController.create);
routes.get('/points/:id', pointController.show);
routes.get('/points', pointController.index);



export default routes;