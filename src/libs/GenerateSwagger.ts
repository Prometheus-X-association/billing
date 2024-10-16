import path from 'path';
import { writeFile } from 'fs';
import { Logger } from './Logger';
import { swaggerDocs } from '../config/swagger';
  
  writeFile(
       path.join(__dirname, '../../docs/swagger.json'),
    JSON.stringify(swaggerDocs, null, 2),
    (err) => {
       if (err)
           Logger.error({ message: err.message, location: err.stack });
   }
 );